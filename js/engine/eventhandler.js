function Eventhandler( dom, world ) {
        var _this = this;

        this.dom = dom;
        this.setOffset();

	this.world = world;
	
        this.keys = {};
        this.mouses = {};

        this.mouse = {
            x: 0,
            y: 0,
            dx:0,
            dy:0,
            locked:false,
            lockElement:false,
            sensitivity: 0.005,
        };

        document.body.addEventListener( "keydown", function(ev){ _this.keyboardhandler(ev); }, true );
        document.body.addEventListener( "keyup", function(ev){ _this.keyboardhandler(ev); }, true );

        dom.addEventListener( "mousemove", function(ev){ _this.mousehandler(ev); }, true );
        dom.addEventListener( "mousedown", function(ev){ _this.mousehandler(ev); }, true );
        dom.addEventListener( "mouseup", function(ev){ _this.mousehandler(ev); }, true );
        dom.addEventListener( "contextmenu", function(ev){ _this.mousehandler(ev); }, true );

        // window.addEventListener('focus', function() {
        //     document.title = 'focused';
        // });

        // window.addEventListener('blur', function() {
        //     document.title = 'not focused';
        // });

        // mouse lock
        document.addEventListener('pointerlockchange', function(ev){ _this.pointerLockChange(ev); }, false);
        document.addEventListener('mozpointerlockchange', function(ev){ _this.pointerLockChange(ev); }, false);
        document.addEventListener('webkitpointerlockchange', function(ev){ _this.pointerLockChange(ev); }, false);
}

Eventhandler.prototype.setOffset = function() {
    this.offset = {
        top: this.dom.offsetTop,
        left: this.dom.offsetLeft,
    };
};

function Key(keydown, keyup, continuous) {
        this.keydown    = [];
        this.keyup      = [];
        this.continuous = [];
        this.down       = false;

        this.add(keydown, "keydown");
        this.add(keyup, "keyup");
        this.add(continuous, "continuous");
}
Key.prototype.add = function(func, type){
        if(typeof(func) == "function")
                this[type].push(func);
};
Key.prototype.exec = function(type){
        if (this[type].length === 0)
                return;

        for(var i in this[type]){
                this[type][i]();
        }
};

function Mouse(mousedown, mouseup, continuous) {
        this.mousedown  = [];
        this.mouseup    = [];
        this.continuous = [];

        this.add(mousedown, "mousedown");
        this.add(mouseup, "mouseup");
        this.add(continuous, "continuous");

        this.down = false;
}
Mouse.prototype.add = function(func, type){
        if(typeof(func) == "function")
                this[type].push(func);
};
Mouse.prototype.exec = function(type, x, y){
        if (this[type].length === 0)
                return;
        for(var i in this[type]){
                this[type][i](x, y, type);
        }
};

Eventhandler.prototype.addKeyboardControl = function(_key, down, up, continuous) {
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

Eventhandler.prototype.addMouseControl = function(which, down, up, continuous) {
        if(!this.mouseControls[ which ])
                this.mouseControls[ which ] = new Mouse( down, up, continuous );
        else{
                this.mouseControls[ which ].add(down, "mousedown");
                this.mouseControls[ which ].add(up, "mouseup");
                this.mouseControls[ which ].add(continuous, "continuous");
        }
        
};

Eventhandler.prototype.keyboardhandler = function(e) {
        var keycode = e.keyCode;
	var type = e.type;
	// var kChar = String.fromCharCode(keycode);
	if(this.keys[keycode]){
		if(this.keys[keycode].down)
			this.keys[keycode].continuous = (type == "keydown");
		this.keys[keycode].down = (type == "keydown");
		this.keys[keycode].up = (type == "keyup");
	}
	else{
		this.keys[keycode] = {
			down : type == "keydown",
			up : type == "keyup",
			continuous : false,
		};
	}
	/*if( this.keyboardControls[ keycode ]){
                if( type == "keydown" && this.keyboardControls[ keycode ].down )
                        return;
                this.keyboardControls[ keycode ].down = (type == "keydown");
                //this.keyboardControls[ keycode ].exec(type);
        }
         else{
                 console.log([type, keycode, String.fromCharCode(keycode)]);
         }*/
};

Eventhandler.prototype.mousehandler = function(e) {
        var which = e.which,
                type = e.type;


        e.preventDefault();
        if(type == "contextmenu"){
            return;
        }

        var x = 0,
            y = 0;

        if(this.mouse.locked){
            x = e.movementX   ||
                e.mozMovementX    ||
                e.webkitMovementX ||
                0;
            y = e.movementY   ||
                e.mozMovementY    ||
                e.webkitMovementY ||
                0;
            // bug firefoxu
            if(type != "mousemove" && e.mozMovementX !== undefined){
                x = 0;
                y = 0;
            }
        }
        else {
            x = e.clientX - this.offset.left;
            y = e.clientY - this.offset.top;
        }
        if(type == "mousemove"){
		this.updateMouseXY(x,y);
		if(this.mouses[0])
			this.mouses[0].down = true;
		else{
			this.mouses[0] = {
				down : true,
				up : false,
				continuous : false,
			};
		}
		if(this.mouses[which].up){
			this.world.handleMouseEvent(which, "mouseup", this.mouse.x, this.mouse.y);
			this.mouses[which].up = false;
		}
		if(this.mouses[which].down){
			this.world.handleMouseEvent(which, "mousedown", this.mouse.x, this.mouse.y);
			this.mouses[which].down = false;
		}
		return;
        }
	
	if(this.mouses[which]){
		this.mouses[which].down = (type == "mousedown");
		this.mouses[which].up = (type == "mouseup");
		if(this.mouses[which].down){
			this.mouses[which].continuous = true;
		}
	}
	else{
		this.mouses[which] = {
			down : type=="mousedown",
			up : type == "mouseup",
			continuous : false,
		};
	}
	
	if(this.mouses[which].up){
		this.world.handleMouseEvent(which, "mouseup", this.mouse.x, this.mouse.y);
		this.mouses[which].up = false;
		this.mouses[which].continuous = false;
	}
	if(this.mouses[which].down){
		this.world.handleMouseEvent(which, "mousedown", this.mouse.x, this.mouse.y);
		this.mouses[which].up = false;
	}
	
        /*if( this.mouseControls[ which ] ){
                if( type == "mousedown" || (this.mouses[ which ].down && type == "mousemove") ){
                        this.mouseControls[ which ].down = true;
                }
                else {
                        this.mouseControls[ which ].down = false;
                }
                if(type != "mousemove"){
                        this.mouseControls[ which ].exec(type, this.mouse);
                }

                if( (which === 0 && this.mouseControls[ which ]) || (this.mouseControls[ which ].down === false && type == "mousemove") ){
                        this.mouseControls[ 0 ].exec("mousedown", this.mouse);
                }
        }
        else{
                // console.log([which,type]);
        }*/
};
Eventhandler.prototype.updateMouseXY = function(x,y) {
    if(this.mouse.locked){
        this.mouse.x += x;
        this.mouse.y += y;
        this.mouse.dx = x;
        this.mouse.dy = y;
    }
    else {
        this.mouse.dx = x - this.mouse.x;
        this.mouse.dy = y - this.mouse.y;
        this.mouse.x = x;
        this.mouse.y = y;
    }
};
Eventhandler.prototype.loop = function(world) {
	for(var keyChar in this.keys){
		if(this.keys[keyChar].up){
			this.world.handleKeyEvent(keyChar, "keyup");
			this.keys[keyChar].up = false;
		}
		if(this.keys[keyChar].down)
			this.world.handleKeyEvent(keyChar, "keydown");
		if(this.keys[keyChar].continuous)
			this.world.handleKeyEvent(keyChar, "continuous");
	};
	for(var which in this.mouses){
		if(this.mouses[which].continuous){
			this.world.handleMouseEvent(which, "continuous", this.mouse.x, this.mouse.y);
		}
	};
        /*for(var k in this.keyboardControls){
                if( this.keyboardControls[ k ].down ){
                        this.keyboardControls[ k ].exec("continuous");
                }
        }
        for(var m in this.mouseControls){
                if( this.mouseControls[ m ].down ){
                        this.mouseControls[ m ].exec("continuous", this.mouse);
                }
        }
        if(this.mouseControls[0])
                this.mouseControls[0].exec("mousedown", this.mouse);

        if(this.mouse.locked){
            this.mouse.dx = 0;
            this.mouse.dy = 0;
        }*/
};

Eventhandler.prototype.resetControls = function() {
    this.keyboardControls = {};
    this.mouseControls = {};
};

Eventhandler.prototype.lockMouse = function(element) {
    element.onclick = function(){
        this.requestPointerLock = element.requestPointerLock || this.mozRequestPointerLock || this.webkitRequestPointerLock;
        this.requestPointerLock();
    };
    this.mouse.lockElement = element;
};

Eventhandler.prototype.pointerLockChange = function(e) {
    var locked = document.pointerLockElement === this.mouse.lockElement || document.mozPointerLockElement === this.mouse.lockElement || document.webkitPointerLockElement === this.mouse.lockElement;
    this.mouse.locked = locked;
};