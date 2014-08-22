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
			position : new Vec2(-120,-120),
			width : 100,
			height : 100,
			color : "#00f",
			angularFriction : 0.5,
			friction : new Vec2(0.5,0.5),
			inertiaMoment : 125,
		});
		PR = pr;
		game.world.add(pr);
		
		pr.addMouseControl(
			1,
			function(x,y){
				pr.forces = [
					{
						point : new Vec2(x-pr.position.x,y-pr.position.y).rotate(-pr.rotation),
						force : new Vec2(0,0),
						permanent : true,
						id : "controlForce",
					}
				];
			},
			function(){
				for(var i = 0; i < pr.forces.length; i++){
					if(pr.forces[i].id == "controlForce")
						pr.forces.splice(i,1);
				}
			},
			function(x,y){
				pr.forces[0].force.set(x-pr.position.x, y-pr.position.y);
			}
		);
		
		var pr2 = new PhysicsRectangle({
			position : new Vec2(0,0),
			width : 500,
			height : 10,
			color : "#f00",
			angularFriction : 0.5,
			friction : new Vec2(0.5,0.5),
			inertiaMoment : 125,
		});
		game.world.add(pr2);
		PR2 = pr2;/*
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