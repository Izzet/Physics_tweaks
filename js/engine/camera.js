function Camera(){
	this.position = new Vec2();
	this.scale = new Vec2(1, 1);

	// kdyžtak dodělat
	// this.bounds = {
	// 	topLeft: new Vec2(0, 0),
	// 	bottomRight: new Vec2(0, 0)
	// }

	this.target = false;
}

Camera.prototype.follow = function(object) {
	this.target = object.position;
};

Camera.prototype.tick = function(dt) {
	this.shaking-=dt;
	if(this.target){
		this.position.lerp(this.target, 0.2);
	}
	if(this.shaking > 0){
		var theta = utils.randFloat(0, Math.PI*2);
		this.position.add(new Vec2(Math.cos(theta),Math.sin(theta)).multiplyScalar(this.shakingIntensity));
	}
};

Camera.prototype.shake = function(intensity, duration) {
	this.shaking = duration/1000;
	this.shakingIntensity = intensity;
};