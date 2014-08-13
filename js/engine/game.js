function Game(width, height, canvas){
	this.width = width;
	this.height = height;

	canvas.width = width;
	canvas.height = height;
	
	canvas.style.position = "absolute";
	canvas.style.left = (window.innerWidth - width)/2 + "px";
	canvas.style.top = (window.innerHeight - height)/2 + "px";

	this.renderer = new CanvasRenderer(this.width, this.height, canvas);
	this.loader = new Loader();
	
	this.world = new World({
		width: this.width,
		height: this.height,
		game: this
	});
	this.eventhandler = new Eventhandler(canvas, this.world);

	this.canvas = canvas;

	this.raf = null;

	this.time = Date.now();
	
	this.currentLevelSrc = "";
	this.currentLevel = {};

	// nefunguje < 1
	this.simulationSpeed = 1;

	this.paused = false;
}

Game.prototype.start = function() {
	this.paused = false;
	this.time = Date.now();
	this.update();
};

Game.prototype.stop = function() {
	this.paused = true;
};

Game.prototype.update = function() {
	stats.begin();
	var _this = this;
	var now = Date.now();
	var dt = now - this.time;
	this.time = now;
	if(!this.paused){
		this.raf = requestAnimationFrame(function(){
			_this.update();
		});
		this.eventhandler.loop();
		for(var i=0;i<this.simulationSpeed;i++){
			this.world.tick(dt/1000);
		}
	}
	this.renderer.render(this.world);
	stats.end();
};

Game.prototype.clear = function() {
	this.world.children = [];
	this.world.camera.position.x = this.world.camera.position.y = 0;
	this.world.camera.scale.x = this.world.camera.scale.y = 1;
};

Game.prototype.levelLoad = function (src, callback){
	this.clear();
	if(src == this.currentLevelSrc){
		this.currentLevel.preload(this);
		this.currentLevel.afterload(this);
	}
	else{
		this.loader.load({
			"level" : src,
		},function (){
			game.currentLevelSrc = src;
			game.currentLevel = game.loader.get("level");
			game.currentLevel.preload(game);
			if(Object.keys(game.currentLevel.assets).length){
				game.loader.load(game.currentLevel.assets, function (){
					for(var name in game.currentLevel.assets){
						game.currentLevel.assets[name] = game.loader.get(name);
					};
					game.currentLevel.afterload(game);
					callback();
				});
			}
			else{
				game.currentLevel.afterload(game);
				callback();
			}
		});
	}
};
