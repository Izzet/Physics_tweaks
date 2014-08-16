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
	var smer = force.getAngle();
	if(toPoint.x != 0 || toPoint.y != 0)
		smer = toPoint.getAngle();
	
	var realForce = force.clone().rotate(-smer);
	this.acceleration.add(new Vec2(realForce.x/this.mass,0).rotate(smer));
	
	var rotationVec = new Vec2(0,realForce.y).rotate(smer);
	this.angularAcceleration = (toPoint.cross(rotationVec))/this.inertiaMoment;
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

PhysicsRectangle.prototype.checkRectangleCollision = function(object){
	if(this == object)
		return false;
	if(object instanceof PhysicsRectangle){
		var podminka = false;
		var vec, rotVec, velocity, pointVelocity, points, w, v;
		var objects = [
			[
				this,
				new Matrix().generateRotationMatrix(this.rotation)
			],
			[
				object,
				new Matrix().generateRotationMatrix(object.rotation)
			]
		];
		for(var n = 1; n > -1; n--){
			points = [
				new Vec2(objects[n][0].width/2,objects[n][0].height/2),
				new Vec2(objects[n][0].width/2,-objects[n][0].height/2),
				new Vec2(-objects[n][0].width/2,objects[n][0].height/2),
				new Vec2(-objects[n][0].width/2,-objects[n][0].height/2),
			];
			for(var i = 0; i < points.length; i++){
				rotVec = objects[n][1].multiply(points[i]);
				vec = rotVec.add(objects[n][0].position);
				if(objects[1-n][0].pointIn(vec.x,vec.y)){
					w = objects[n][0].angularVelocity-objects[1-n][0].angularVelocity;
					v = objects[n][0].velocity.clone().sub(objects[1-n][0].velocity);
					// !!! předělat na relativní rychlost vzhledem k druhému objektu
					pointVelocity = new Vec2(-w*points[i].rotate(objects[n][0].rotation).y + v.x, w*points[i].rotate(objects[n][0].rotation).x + v.y);
					objects[n][0].collisionPoints.push([vec.sub(objects[n][0].position).rotate(-objects[n][0].rotation), pointVelocity]);
					podminka = true;
				}
			};
		};
		return podminka;
	}
};

PhysicsRectangle.prototype.onCollision = function (object, dt){
	object.rotation -= object.angularVelocity*dt;
	object.position.sub( object.velocity.clone().multiplyScalar(dt) );
	object.stopMotion();
	
	this.rotation -= this.angularVelocity*dt;
	this.position.sub( this.velocity.clone().multiplyScalar(dt) );
	this.stopMotion();
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
	
	/*var objects = [this, object];
	var harmonicMass = 2*this.mass*object.mass/(this.mass+object.mass);
	var harmonicInertia = 2*this.inertiaMoment*object.inertiaMoment/(this.inertiaMoment+object.inertiaMoment);
	for(var i = 0; i < 2; i++){
		objects[i].velocity.add(objects[1-i].velocity.clone().sub(objects[i].velocity).multiplyScalar(harmonicMass));
		objects[i].angularVelocity += (objects[1-i].angularVelocity-objects[i].angularVelocity)*harmonicInertia;
	};
	*/
	this.collisionPoints = [];
};