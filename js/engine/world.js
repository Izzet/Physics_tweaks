function World(options){
	Object2D.call(this, options);

	this.camera = new Camera();
	var _this = this;
}

World.prototype = Object.create( Object2D.prototype );

World.prototype.tick = function(dt) {
	Object2D.prototype.tick.call(this, dt);

	this.camera.tick(dt);

	this.checkChildrenCollisions(dt);
};

World.prototype.render = function(ctx) {
	ctx.save();

	// díky tomuto ukazuje kamera doprostřed obrazovky
	ctx.translate(this.width/2, this.height/2);
	
	ctx.scale(this.camera.scale.x, this.camera.scale.y);
	ctx.translate(-this.camera.position.x, -this.camera.position.y);
	Object2D.prototype.render.call(this, ctx);

	ctx.restore();
};

World.prototype.handleMouseEvent = function(which, type, x,y){
	if(this.mouseControls[which]){
		this.mouseControls[which].exec(type,x,y);
	}
	var vec = new Vec2(x-this.width/2+this.camera.position.x,y-this.height/2+this.camera.position.y);
	vec.rotate(-this.rotation);
	vec.x = vec.x/this.camera.scale.x;
	vec.y = vec.y/this.camera.scale.y;
	for(var i = 0; i < this.children.length; i++){
		this.children[i].handleMouseEvent(which, type, vec.x, vec.y);
	};
}