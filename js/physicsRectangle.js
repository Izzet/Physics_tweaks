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
		ctx.beginPath();
		ctx.translate(this.position.x, this.position.y);
		var v = this.forces[0].point.clone().rotate(this.rotation);
		ctx.moveTo(v.x,v.y);
		ctx.lineTo(this.forces[0].force.x,this.forces[0].force.y);
		ctx.closePath();
		ctx.stroke();
	}
};
PhysicsRectangle.prototype.stopMotion = function(){
	this.rotation = 0;
	this.angularVelocity = 0;
	this.acceleration.set(0,0);
	this.gravity.set(0,0);
	this.velocity.set(0,0);
	this.position.set(0,0);
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
	};
	Object2D.prototype.tick.call(this,dt);
};