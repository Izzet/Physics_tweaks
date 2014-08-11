function Particle(options){
	options = options || {};

	this.creationTime = new Date().getTime();
	this.life = options.life === undefined ? 1000 : options.life;
	this.update = options.update === undefined ? function (){} : options.update;

	this.position = options.position === undefined ? new Vec2() : options.position;
	this.origin = new Vec2().copy(this.position);
	this.parent = false;

	this.color = options.color === undefined ? new Color(0x000000) : options.color;
	this.texture = options.texture === undefined ? false : options.texture;
	this.textured = options.textured === undefined ? false : options.textured;

	// velikost
	this.width = options.width === undefined ? 1 : options.width;
	this.height = options.height === undefined ? 1 : options.height;

	this.shrink = options.shrink === undefined ? 1 : options.shrink;
	this.size = options.size === undefined ? 1 : options.size;
	this.maxSize = options.maxSize === undefined ? -1 : options.maxSize;
	// síly
	this.velocity = options.velocity === undefined ? new Vec2() : options.velocity;
	this.gravity = options.gravity === undefined ? new Vec2() : options.gravity;
	this.friction = options.friction === undefined ? new Vec2(1,1) : options.friction;
	// průhlednost
	this.alpha = options.alpha === undefined ? 1 : options.alpha; 
	this.fade = options.fade === undefined ? 0 : options.fade;
	// rotace
	this.spin = options.spin === undefined ? 0 : options.spin;
	this.rotation = options.rotation === undefined ? 0 : options.rotation;
}

Particle.prototype.render = function(ctx) {
	if(this.alpha <= 0 || this.size <= 0.5) return;

	ctx.save(); 
	ctx.translate(this.position.x, this.position.y);
	ctx.scale(this.size, this.size);
	ctx.rotate(this.rotation);
	ctx.translate(-this.width/2, -this.height/2);
	ctx.globalAlpha = this.alpha;
	if(this.textured){
		this.texture.draw(ctx,this.width,this.height);
	}
	else{
		ctx.fillStyle = this.color.getStyle();
		ctx.fillRect(0,0, this.width, this.height);
	}

	ctx.restore();
};

Particle.prototype.update = function(){

	this.velocity.x *= this.friction.x;
	this.velocity.y *= this.friction.y;

	this.velocity.add( this.gravity );
	this.position.add( this.velocity );

	this.size *= this.shrink;

	if(this.maxSize != -1 && this.size > this.maxSize)
		this.size = this.maxSize;

	this.alpha -= this.fade;
	if(this.alpha<0) this.alpha = 0;

	this.rotation += this.spin;
};