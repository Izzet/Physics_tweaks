{
	assets : {
		
	},
	preload : function (game){
		
	},
	afterload : function (game){
		var pozadi = new GUILabel({
			color : "#E8E8E8",
			width : game.canvas.width,
			height : game.canvas.height,
		});
		game.world.add(pozadi);
		
		var pr = new PhysicsRectangle({
			position : new Vec2(-50,-50),
			width : 100,
			height : 100,
			color : "#00f",
			angularFriction : 2,
		});
		PR = pr;
		game.world.add(pr);
		
		pr.addMouseControl(
			1,
			function(x,y){console.log("new force");
				pr.forces = [
					{
						point : new Vec2(x-pr.position.x,y-pr.position.y).rotate(-pr.rotation),
						force : new Vec2(0,0),
					}
				];
			},
			function(){
				pr.forces = [];
			},
			function(x,y){
				pr.forces[0].force.set(x-pr.position.x, y-pr.position.y);
			}
		);
		
		/*var pr2 = new PhysicsRectangle({
			position : new Vec2(0,0),
			width : 10,
			height : 10,
			color : "#00f",
		});
		game.world.add(pr2);
		PR2 = pr2;
		var pr3 = new PhysicsRectangle({
			position : new Vec2(50,-50),
			width : 10,
			height : 10,
			color : "#00f",
		});
		game.world.add(pr3);
		PR3 = pr3;*/
	},
}