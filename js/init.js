function statsInit(){
	window.stats = new Stats();
	stats.setMode(1); // 0: fps, 1: ms

	// Align top-left
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.left = '0px';
	stats.domElement.style.top = '0px';

	$("body").append( stats.domElement );

	return stats;

	// stats.begin();
	// stats.end();
}

function datguiInit(){
	window.gui = new dat.GUI();

	return gui;
}

var game;

$(document).ready(function(){
	// datguiInit();

	var canvas = document.createElement("canvas");
	$("body").append(canvas);
	
	statsInit();

	game = new Game(700, 500, canvas);
	
	game.start();
	
	game.score = 0;
	
	game.levelLoad("./js/levels/main.js", function (){});
});
