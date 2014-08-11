function Loader(){
	this.cache = {};

	this.toLoad = 0;
	this.loaded = 0;
	this.loading = false;

	this.imageExts = ["jpg", "jpeg", "png", "gif", "bmp", "webp"];
	this.soundExts = ["wav", "ogg", "mp3", "acc", "webm"];
	this.jsonExts = ["json"];
	this.scriptExts = ["js"]

	var _this = this;
}

Loader.prototype.loadOne = function(src, name, callback) {
	var _this = this;
	var srcArray = src.split(".");
	var ext = srcArray[srcArray.length-1].toLowerCase();

	if(this.imageExts.indexOf(ext) > -1){
		this.cache[name] = new Image();
		this.cache[name].onload = callback;
		this.cache[name].src = src;
	}
	else if(this.soundExts.indexOf(ext) > -1){
		this.cache[name] = new Audio();
		$(this.cache[name]).on("loadeddata", callback)
		this.cache[name].src = src;
	}
	else if(this.jsonExts.indexOf(ext) > -1){
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function () {
			if ( xhr.readyState === xhr.DONE ) {
				if ( xhr.status === 200 || xhr.status === 0 ) {
					if ( xhr.responseText ) {
						_this.cache[name] = JSON.parse( xhr.responseText );
						callback();
					}
				}
			}
		};
		xhr.open( "GET", src, true );
		xhr.send( null );
	}
	else if(this.scriptExts.indexOf(ext) > -1){
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function () {
			if ( xhr.readyState === xhr.DONE ) {
				if ( xhr.status === 200 || xhr.status === 0 ) {
					if ( xhr.responseText ) {
						_this.cache[name] = eval("(function(){return "+ xhr.responseText +";})();");
						callback();
					}
				}
			}
		};
		xhr.open( "GET", src, true );
		xhr.send( null );
	}

	return this.cache[name];
};

Loader.prototype.load = function(assets, callback) {
	var _this = this;
	if(!this.loading){
		this.toLoad = 0;
		this.loading = true;
		for(var i in assets){
			this.loadOne(assets[i], i, function(){
				_this.loaded++;
				if(_this.loaded >= _this.toLoad){
					_this.loading = false;
					callback(_this);
					_this.loaded = 0;
				}
			});
			this.toLoad++;
		}
	}
	else {
		console.log("loading already in progress");
	}

	return this.cache;
};

Loader.prototype.get = function(name) {
	return this.cache[name];
};

Loader.prototype.reset = function() {
	this.loading = false;
	this.cache = {};
	this.toLoad = 0;
	this.loaded = 0;
};