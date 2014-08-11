function CanvasRenderer(width, height, canvas){
	this.canvas = canvas;
	this.ctx = this.canvas.getContext("2d");

	this.width = width;
	this.height = height;

	this.backgroundColor = "#FFFFFF";
	this.disableInterpolation()
}

CanvasRenderer.prototype.render = function(world) {
	this.ctx.fillStyle = this.backgroundColor;
	this.ctx.fillRect(0, 0, this.width, this.height);

	world.render(this.ctx);
};

// Vypne interpolaci canvasu = lepší pro pixelart
CanvasRenderer.prototype.disableInterpolation = function() {
	this.ctx.webkitImageSmoothingEnabled = this.ctx.mozImageSmoothingEnabled = false;
};