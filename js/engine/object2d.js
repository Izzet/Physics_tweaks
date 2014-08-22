function Object2D(options){
	this.options = options === undefined ? {} : options;

	this.position = this.options.position === undefined ? new Vec2() : this.options.position;
	this.velocity = this.options.velocity === undefined ? new Vec2() : this.options.velocity;
	this.acceleration = this.options.acceleration === undefined ? new Vec2() : this.options.acceleration;
	this.friction = this.options.friction === undefined ? new Vec2() : this.options.friction;
	this.angularFriction = this.options.angularFriction === undefined ? 0 : this.options.angularFriction;
	this.gravity = this.options.gravity === undefined ? new Vec2() : this.options.gravity;
	this.rotation = this.options.rotation === undefined ? 0 : this.options.rotation;
	this.angularVelocity = this.options.angularVelocity === undefined ? 0 : this.options.angularVelocity;
	this.angularAcceleration = this.options.angularAcceleration === undefined ? 0 : this.options.angularAcceleration;
	this.width = this.options.width === undefined ? 1 : this.options.width;
	this.height = this.options.height === undefined ? 1 : this.options.height;
	this.texture = this.options.texture === undefined ? false : this.options.texture;
	
	this.debug = false;
	this.fixed = this.options.fixed === undefined ? false : this.options.fixed;

	this.parent = null;
	this.children = [];

	this.colliding = this.options.colliding === undefined ? false : this.options.colliding;
	
	this.keyboardControls = {};
	this.mouseControls = {};
}

Object2D.prototype.onCollision = function(child,dt){};

Object2D.prototype.tick = function(dt) {
	this.acceleration.add(this.gravity);

	var velocityLength = this.velocity.length();
	this.acceleration.x -= this.velocity.x*velocityLength*this.friction.x*dt;
	this.acceleration.y -= this.velocity.y*velocityLength*this.friction.y*dt;

	this.velocity.x += this.acceleration.x*dt;
	this.velocity.y += this.acceleration.y*dt;

	this.position.x += this.velocity.x*dt;
	this.position.y += this.velocity.y*dt;
	
	this.angularVelocity -= this.angularVelocity*Math.abs(this.angularVelocity)*this.angularFriction*dt;
	
	this.angularVelocity += this.angularAcceleration*dt;
	this.rotation += this.angularVelocity*dt;

	for (var i = 0; i < this.children.length; i++) {
		var child = this.children[i];
		child.tick(dt);
	}

	this.acceleration.set(0,0);
	this.angularAcceleration = 0;
};

Object2D.prototype.render = function(ctx) {
	ctx.save();
	ctx.translate(this.position.x, this.position.y);
	ctx.rotate(this.rotation);
	if(this.texture)
		this.texture.draw(ctx);
	if(this.debug){
		ctx.strokeStyle = "#4DE352";
		ctx.strokeRect(-this.width/2, -this.height/2, this.width, this.height);
	}
	for (var i = 0; i < this.children.length; i++) {
		var child = this.children[i];
		if(child.fixed){
			ctx.save();
			for(var childIt = child; childIt.parent != null; childIt = childIt.parent){
				ctx.rotate(-childIt.parent.rotation);
				ctx.translate(-childIt.parent.position.x, -childIt.parent.position.y);
				if(childIt.parent instanceof World){
					ctx.translate(childIt.parent.camera.position.x, childIt.parent.camera.position.y);
					ctx.scale(1/childIt.parent.camera.scale.x, 1/childIt.parent.camera.scale.y);
				}
			};
			child.render(ctx);
			ctx.restore();
		}
		else{
			child.render(ctx);
		}
	}
	ctx.restore();
};

Object2D.prototype.add = function(child) {
	this.children.push(child);
	child.parent = this;
};

Object2D.prototype.remove = function(child) {
	var search = this.children.indexOf(child);
	if(search > -1){
		this.children.splice(search, 1);
	}
};

Object2D.prototype.removeChildren = function() {
	this.children = [];
};

Object2D.prototype.pointIn = function ( v ){ 
	var vec = v.clone();//new Vec2(v.x, v.y);
	vec.sub(this.position);
	vec.rotate(-this.rotation);
	return (vec.x >= -this.width/2 && vec.x <= this.width/2) && (vec.y >= -this.height/2 && vec.y <= this.height/2);
};

Object2D.prototype.checkRectangleCollision = function(object) {
	if(this == object)
		return false;
	
	var thisLeft = this.position.x - this.width/2;
	var thisTop = this.position.y - this.height/2;
	var thisRight = this.position.x + this.width/2;
	var thisBottom = this.position.y + this.height/2;
	var objectLeft = object.position.x - object.width/2;
	var objectTop = object.position.y - object.height/2;
	var objectRight = object.position.x + object.width/2;
	var objectBottom = object.position.y + object.height/2;

	return !(objectLeft > thisRight || objectRight < thisLeft || objectTop > thisBottom || objectBottom < thisTop);
};

Object2D.prototype.checkChildrenCollisions = function(dt) {
	for(var i=0; i<this.children.length-1; i++){
		for(var j=i+1; j<this.children.length; j++){
			if(this.children[i].colliding && this.children[j].colliding){
				var collision = this.children[i].checkRectangleCollision(this.children[j], dt);
				if(collision){
					this.children[i].onCollision(this.children[j],dt);
					this.children[j].onCollision(this.children[i],dt);
				}
			}
		}
	}
};

Object2D.prototype.handleKeyEvent = function (key, type){
	if(this.keyboardControls[key]){
		this.keyboardControls[key].exec(type);
	}
	for(var i = 0; i < this.children.length; i++){
		this.children[i].handleKeyEvent(key, type);
	};
};

Object2D.prototype.handleMouseEvent = function (key, type, x, y){
	if(this.mouseControls[key]){
		this.mouseControls[key].exec(type,x,y);
	}
	var vec = new Vec2(x-this.position.x,y-this.position.y);
	vec.rotate(-this.rotation);
	for(var i = 0; i < this.children.length; i++){
		this.children[i].handleMouseEvent(key, type, vec.x, vec.y);
	};
};

Object2D.prototype.addMouseControl = function (which, down, up, continuous){
	 if(!this.mouseControls[ which ])
                this.mouseControls[ which ] = new Mouse( down, up, continuous );
        else{
                this.mouseControls[ which ].add(down, "mousedown");
                this.mouseControls[ which ].add(up, "mouseup");
                this.mouseControls[ which ].add(continuous, "continuous");
        }
};

Object2D.prototype.addKeyboardControl = function (_key, down, up, continuous){
	if(typeof(_key) == "string"){
                key = _key.charCodeAt(0);
        }
        else {
                key = _key;
        }
        if(!this.keyboardControls[ key ])
            this.keyboardControls[ key ] = new Key( down, up, continuous );
        else{
            this.keyboardControls[ key ].add(down, "keydown");
            this.keyboardControls[ key ].add(up, "keyup");
            this.keyboardControls[ key ].add(continuous, "continuous");
        }
};

Object.defineProperty(Object2D.prototype, "bottom", {

    get: function () {
        return this.position.y + this.height/2;
    },

    set: function (value) {
    	this.position.y = value - this.height/2;
    }

});

Object.defineProperty(Object2D.prototype, "top", {

    get: function () {
        return this.position.y - this.height/2;
    },

    set: function (value) {
    	this.position.y = value + this.height/2;
    }

});

Object.defineProperty(Object2D.prototype, "right", {

    get: function () {
        return this.position.x + this.width/2;
    },

    set: function (value) {
    	this.position.x = value - this.width/2;
    }

});

Object.defineProperty(Object2D.prototype, "left", {

    get: function () {
        return this.position.x - this.width/2;
    },

    set: function (value) {
    	this.position.x = value + this.width/2;
    }

});