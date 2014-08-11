function GUIText(options){
	Object2D.call(this, options);
	
	this.visible = options.visible === undefined ? true : options.visible;
	this.color = options.color === undefined ? "#000" : options.color;
	this.fontSize = options.size === undefined ? 10 : options.size;
	this.font = options.font === undefined ? "sans-serif" : options.font;
	
	this.width = options.width === undefined ? 100 : options.width;
	this.height = options.height === undefined ? 50 : options.height;
	
	this.obsah = options.text === undefined ? [] : options.text.split(" ");
	
	this.logged = false;
}
GUIText.prototype = Object.create( Object2D.prototype );

GUIText.prototype.render = function (ctx){
	
	ctx.save();
	ctx.translate(this.position.x, this.position.y);
	ctx.rotate(this.rotation);
	if(!this.visible)
		return;
	ctx.fillStyle = this.color;
	ctx.font = this.fontSize+"px "+this.font;
	var row = "";
	var rows = 1;
	var i = 0;
	var j = 0;
	while(i < this.obsah.length){
		j = i;
		while(ctx.measureText(row+this.obsah[j]).width <= this.width){
			if(row.length > 0)
				row += " ";
			row += this.obsah[j];
			j++;
			if(j >= this.obsah.length)
				break;
		}
		ctx.fillText(row, -this.width/2, rows*this.fontSize-this.height/2);
		rows++;
		if(rows*this.fontSize > this.height){
			break;
		}
		i = j;
		row = "";
	}
	ctx.restore();
	Object2D.prototype.render.call(this, ctx);
};