function GUILabel(options){
	Object2D.call(this, options);
	
	this.visible = options.visible === undefined ? true : options.visible;
	this.texture = options.texture === undefined ? false : options.texture;
	this.color = options.color === undefined ? "#000" : options.color;
	
	this.onclick = options.onclick === undefined ? function (){} : options.onclick;
	this.onmousein = options.onmousein === undefined ? function (){} : options.onmousein;
	this.onmouseout = options.onmouseout === undefined ? function (){} : options.onmouseout;
	
	this.mouseIN = false;
	var _this = this;
	this.addMouseControl(1,function(x,y,type){
		if(_this.pointIn(new Vec2(x,y)))
			_this.onclick();
	});
	
	this.addMouseControl(0,function(x,y){
		if(_this.pointIn(new Vec2(x,y))){
			if(!_this.mouseIn){
				_this.mouseIn = true;
				_this.onmousein(x,y);
			}
		}
		else{
			if(_this.mouseIn){
				_this.mouseIn = false;
				_this.onmouseout(x,y);
			}
		}
	});
	
	this.logged = false;
}
GUILabel.prototype = Object.create( Object2D.prototype );

GUILabel.prototype.render = function (ctx){
	ctx.save();
	ctx.translate(this.position.x, this.position.y);
	ctx.rotate(this.rotation);
	if(!this.visible)
		return;
	if(this.texture){
		this.texture.draw(ctx);
	}
	else{
		ctx.fillStyle = this.color;
		ctx.fillRect(-this.width/2,-this.height/2,this.width, this.height);
	}
	ctx.restore();
	Object2D.prototype.render.call(this, ctx);
};