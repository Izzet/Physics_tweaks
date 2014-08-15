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
	if(this.forces[0]){
		ctx.save();
		ctx.beginPath();
		ctx.translate(this.position.x, this.position.y);
		var v = this.forces[0].point.clone().rotate(this.rotation);
		ctx.moveTo(v.x,v.y);
		ctx.lineTo(this.forces[0].force.x,this.forces[0].force.y);
		ctx.closePath();
		ctx.stroke();
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
		var rotVec;
		var vec;
		var pointVelocity;
		var points;
		var w;
		var v;
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
					w = objects[n][0].angularVelocity;
					v = objects[n][0].velocity;
					pointVelocity = new Vec2(-w*rotVec.y + v.x, w*rotVec.x + v.y);
					objects[1-n][0].collisionPoints.push([vec, pointVelocity]);
					podminka = true;
				}
			};
		};
		return podminka;
	}
};

PhysicsRectangle.prototype.onCollision = function (object, dt){
	object.rotation -= object.angularVelocity*dt;
	object.position.sub( object.velocity.multiplyScalar(dt) );
	object.stopMotion();
	
	this.rotation -= this.angularVelocity*dt;
	this.position.sub( this.velocity.multiplyScalar(dt) );
	this.stopMotion();
	/*var _this = this;
	if(this.collisionPoints.length < 1)
		return;
	console.log(this.collisionPoints);
	var v;
	for(var i = 0; i < this.collisionPoints.length; i++){
		this.forces.push({
			point : _this.collisionPoints[i][0],
			force : _this.collisionPoints[i][1].multiplyScalar(0.02*object.mass/dt),
		});
		v = _this.collisionPoints[i][0].add(this.position);
		v.sub(object.position);
		object.forces.push({
			point : v,
			force : _this.collisionPoints[i][1].multiplyScalar(-0.02*object.mass/dt),
		});
	};*/
	this.collisionPoints = [];
};