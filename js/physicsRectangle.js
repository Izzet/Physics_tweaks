function PhysicsRectangle( options ){
	Object2D.call(this, options);
	
	this.color = options.color === undefined ? "#000" : options.color;
	
	// Težiště vzhledem ke středu renderování
	this.centerOfMass = options.centerOfMass === undefined ? new Vec2(0,0) : options.centerOfMass;
	if(!this.density)
		this.mass = options.mass === undefined ? 1 : options.mass;
	else{
		this.mass = this.density*this.width*this.height;
	}
	
	this.inertiaMoment = options.inertiaMoment === undefined ? this.width*this.height/4 : options.inertiaMoment;
	
	this.forces = []; // Formát je objekt s vlastnostmi point(Vec2d) a force(Vec2d)
	this.colliding = true;
	
	this.collisionPoints = [];
};
PhysicsRectangle.prototype = Object.create( Object2D.prototype );

PhysicsRectangle.prototype.render = function(ctx){
	if(!this.texture){
		ctx.save();
		ctx.translate(this.position.x,this.position.y);
		ctx.rotate(this.rotation);
		ctx.fillStyle = this.color;
		ctx.fillRect(-this.width/2,-this.height/2,this.width,this.height);
		ctx.fillStyle = "#f00";
		ctx.lineWidth = 3;
		ctx.restore();
	}
	Object2D.prototype.render.call(this, ctx);
	if(this.forces.length){
		ctx.save();
		ctx.translate(this.position.x, this.position.y);
		var v;
		for(var i = 0; i < this.forces.length; i++){
			v = this.forces[i].point.clone().rotate(this.rotation);
			ctx.beginPath();
			ctx.arc(v.x,v.y,5,0,Math.PI*2);
			ctx.stroke();
			ctx.closePath();
			if(this.forces[i].force.x == 0 && this.forces[i].force.y == 0)
				continue;
			ctx.beginPath();
			ctx.moveTo(v.x,v.y);
			ctx.lineTo(this.forces[i].force.x,this.forces[i].force.y);
			ctx.stroke();
			ctx.closePath();
		};
		ctx.restore();
	}
};
PhysicsRectangle.prototype.stopMotion = function(){
	this.angularVelocity = 0;
	this.acceleration.set(0,0);
	this.velocity.set(0,0);
};
PhysicsRectangle.prototype.applyForce = function(point,force){
	var toPoint = new Vec2().subVectors(point, this.centerOfMass).rotate(this.rotation);
	var projekce = force.getProjections(toPoint);
	this.acceleration.add(projekce[0].divideScalar(this.mass));
	this.angularAcceleration += (toPoint.cross(projekce[1]))/this.inertiaMoment;
};

PhysicsRectangle.prototype.tick = function(dt){
	for(var i = this.forces.length-1;this.forces[i];i--){
		this.applyForce(this.forces[i].point,this.forces[i].force);
		if(!this.forces[i].permanent){
			this.forces.splice(i,1);
		}
	};
	Object2D.prototype.tick.call(this,dt);
};

PhysicsRectangle.prototype.checkRectangleCollision = function(object, dt){
	if(this == object)
		return false;
	if(object instanceof PhysicsRectangle){
		var podminka = false;
		var pointVelocityA, pointVelocityB, points, wa, va, wb, vb, objA, objB, relativeVelocity;
		var objects = [
			this,
			object
		];
		for(var n = 1; n > -1; n--){
			objA = objects[n];
			objB = objects[1-n];
			points = [
				new Vec2(objA.width/2,objA.height/2),
				new Vec2(objA.width/2,-objA.height/2),
				new Vec2(-objA.width/2,objA.height/2),
				new Vec2(-objA.width/2,-objA.height/2),
			];
			for(var i = 0; i < points.length; i++){
				points[i].rotate(objA.rotation).add(objA.position);
				if(objB.pointIn(points[i])){
					var pointToObjA = new Vec2().subVectors(points[i], objA.position);
					var pointToObjB = new Vec2().subVectors(points[i], objB.position);
					va = objA.velocity;
					wa = objA.angularVelocity;
					pointVelocityA = new Vec2(-wa*pointToObjA.y + va.x, wa*pointToObjA.x + va.y);
					vb = objB.velocity;
					wb = objB.angularVelocity;
					pointVelocityB = new Vec2(-wb*pointToObjB.y + vb.x, wb*pointToObjB.x + vb.y);
					relativeVelocity = pointVelocityA.sub(pointVelocityB);
					var normal = objB.getSideNormal(points[i]);
					var pros = relativeVelocity.getProjections(normal);
					var projekce = pros[0];
					objA.forces.push({
						force : projekce.multiplyScalar(-2*this.mass/dt),
						point : new Vec2(),
					});
					projekce = pros[1].getProjections(new Vec2(-wa*pointToObjA.y, wa*pointToObjA.x))[0];
					objA.forces.push({
						force : projekce.multiplyScalar(-2*this.inertiaMoment/(dt*pointToObjA.lengthSq())),
						point : pointToObjA.rotate(-objA.rotation),
					});
					/*var forcesOnB = projekce.getProjections(pointToObjB);
					var velLength = relativeVelocity.length();
					forcesOnB[0].multiplyScalar(0.05*objA.mass*objB.mass*velLength/((objA.mass+objB.mass)));
					forcesOnB[1].multiplyScalar(
						0.05*objA.inertiaMoment*objB.inertiaMoment*velLength/
						((objA.inertiaMoment*pointToObjA.length()+objB.inertiaMoment*pointToObjB.length())*pointToObjB.length())
					);
					var forcesOnA = [new Vec2().copy(forcesOnB[0]).multiplyScalar(-1), new Vec2().copy(forcesOnB[1]).multiplyScalar(-1)];
					objB.forces.push(
						{
							force : forcesOnB[0],
							point : pointToObjB.rotate(-objB.rotation/2),
						},
						{
							force : forcesOnB[1],
							point : pointToObjB.rotate(-objB.rotation/2),
						}
					);
					objA.forces.push(
						{
							force : forcesOnB[0].multiplyScalar(-1),
							point : pointToObjA.rotate(-objA.rotation/2),
						},
						{
							force : forcesOnB[1].multiplyScalar(-1),
							point : pointToObjA.rotate(-objA.rotation/2),
						}
					);
					//objA.collisionPoints.push([points[i], relativeVelocity]);*/
					podminka = true;
				}
			};
		};
		return podminka;
	}
};

PhysicsRectangle.prototype.onCollision = function (object, dt){
	this.rotation -= this.angularVelocity*dt;
	this.position.sub( this.velocity.clone().multiplyScalar(dt) );
	//this.stopMotion();
	/*var _this = this;
	if(this.collisionPoints.length < 1)
		return;
	var v;
	for(var i = 0; i < this.collisionPoints.length; i++){
		if(this.color == "#f00")
			console.log(_this.collisionPoints[i][0]);
		this.forces.push({
			point : _this.collisionPoints[i][0],
			force : _this.collisionPoints[i][1].multiplyScalar(_this.mass/dt),
		});
		v = this.collisionPoints[i][0].clone().rotate(this.rotation);
		v.add(this.position);
		v.sub(object.position);
		v.rotate(-object.rotation);
		object.forces.push({
			point : v,
			force : _this.collisionPoints[i][1].multiplyScalar(object.mass/dt),
		});
	};*/
	
	/*var harmonicMass = 2*this.mass*object.mass/(this.mass+object.mass);
	//var harmonicInertia = 2*this.inertiaMoment*object.inertiaMoment/(this.inertiaMoment+object.inertiaMoment);
	var relVel = object.velocity.clone().sub(this.velocity);console.log(this.velocity);
	var imp = relVel.multiplyScalar(harmonicMass);
	this.velocity.add(imp.multiplyScalar(1/this.mass));
	object.velocity.sub(imp.multiplyScalar(1/object.mass));
	//objects[i].angularVelocity += (objects[1-i].angularVelocity-objects[i].angularVelocity)*harmonicInertia;
	//console.log(objects[1-i].velocity);*/
	this.collisionPoints = [];
};

PhysicsRectangle.prototype.getSideNormal = function (point){
	var points = [
		new Vec2(this.width/2,this.height/2),
		new Vec2(-this.width/2,this.height/2),
		new Vec2(-this.width/2,-this.height/2),
		new Vec2(this.width/2,-this.height/2),
	];
	var u = -this.rotation;
	var toPoint = point.clone().sub(this.position).rotate(u);
	return new Vec2(0,toPoint.y).rotate(-u);
};