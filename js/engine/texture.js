function Texture(image, options){
	var _this = this;

	var options = options === undefined ? {} : options;

	this.image = image;

	this.stripWidth = options.width || this.image.width;
	this.width = this.stripWidth;
	this.height = options.height || this.image.height;

	this.onAnimationEnd = function(){};
	this.ended = false;

	this.clip = options.clip === undefined ? {x: 0, y: 0, width: _this.width, height: _this.height} : options.clip;
	
	this.scale = options.scale === undefined ? new Vec2(1,1) : options.scale;

	this.alpha = options.alpha === undefined ? 1 : options.alpha;

	this.repeat = options.repeat === undefined ? false : options.repeat;
	
	this.animated = options.animations !== undefined;
	if(this.animated){
		this.animations = options.animations;

		for(var i in this.animations){
			this.animations[i].delay = this.animations[i].delay === undefined ? 20 : this.animations[i].delay;
			this.animations[i].cycle = this.animations[i].cycle === undefined ? true : this.animations[i].cycle;
			this.animations[i].start = this.animations[i].start === undefined ? 0 : this.animations[i].start;
			this.animations[i].end = this.animations[i].end === undefined ? 0 : this.animations[i].end;
		}

		this.width = Math.round(this.stripWidth/options.totalFrames);

		// buď specifikovaná animace nebo alespoň nějaké, o které vím
		this.switchAnimation(options.currentAnimation || i);
	}
}

Texture.prototype.switchAnimation = function(name) {
	if(this.animations[name] && (this.currentAnimation != this.animations[name] )){
		this.currentAnimation = this.animations[name];

		this.frames = this.currentAnimation.end - this.currentAnimation.start + 1;

		this.animationStart = new Date().getTime();

		this.currentAnimation.cycle = this.currentAnimation.cycle;
	}
};

Texture.prototype.getCurrentFrameClip = function() {
	var delta = Date.now() - this.animationStart;

	// pokud se necyklí a má skončit
	if(delta > (this.frames * this.currentAnimation.delay) && !this.currentAnimation.cycle){
		if(!this.ended){
			this.ended = true;
			this.onAnimationEnd();
		}
		return this.currentAnimation.end;
	}

	var frame = this.currentAnimation.start + Math.floor(delta/this.currentAnimation.delay) % this.frames;
	return {
		x: frame*this.width,
		y: 0,
		width: this.width,
		height: this.height
	};
};

Texture.prototype.draw = function(ctx, width, height) {
	width = width === undefined ? this.width : width;
	height = height === undefined ? this.height : height;
	ctx.save();

	ctx.scale(this.scale.x, this.scale.y);
	ctx.translate(-this.width/2, -this.height/2);

	ctx.globalAlpha = this.alpha;
	if(this.repeat){
		ctx.fillStyle = ctx.createPattern(this.image, "repeat");
		ctx.fillRect(0, 0, width/this.scale.x, height/this.scale.y);
	}
	else {
		var clip = this.clip;

		if(this.animated){
			clip = this.getCurrentFrameClip();
			// ctx.fillStyle = "#F00";
			// ctx.fillText(clip.x/this.width, 0, 0);
		}
		ctx.drawImage(this.image, clip.x, clip.y, clip.width, clip.height, 0, 0, width, height);
	}

	ctx.restore();
};