function ParticleSystem(options, particle, emit){
	Object2D.call(this, options);

	this.particleOptions = particle === undefined ? {} : particle;
	this.emitOptions = emit === undefined ? {} : emit;
	this.emiting = emit.emiting === undefined ? false : emit.emiting;

	this.particles = [];
	this.toSpawn = 0;

	this.particleCap = 500;
};

ParticleSystem.prototype = Object.create( Object2D.prototype );

ParticleSystem.prototype.render = function(ctx) {
	var now = new Date().getTime();

	ctx.save();
	ctx.translate(this.position.x, this.position.y);

	var amount = this.particles.length;
	var len = amount;
	if(amount > this.particleCap){
		this.particles.splice(0, amount-this.particleCap);
		len = this.particleCap;
	}

	for (var i = len-1; i >= 0; i--){
		if( this.particles[i].life < now - this.particles[i].creationTime ){
			this.particles.splice(i, 1);

			i--;
			continue;
		}
		this.particles[i].render(ctx);
		this.particles[i].update();
	};
	ctx.restore();
};

ParticleSystem.prototype.emit = function(amount) {
	var amount = amount === undefined ? 1 : amount;
	var randomize = this.emitOptions.randomize === undefined ? {} : this.emitOptions.randomize;
	var options = this.particleOptions === undefined ? {} : this.particleOptions;
	for (var y = 0; y < amount; y++){
		for(var i in randomize){
			options[i] = randomize[i]();
		}
		var constructor = this.particleOptions.type === undefined ? Particle : this.particleOptions.type;
		var particle = new constructor(this.particleOptions);
		particle.parent = this;
		this.particles.push( particle );
	};
};

ParticleSystem.prototype.tick = function (){
	if(this.emiting){
		this.toSpawn += this.emitOptions.amount;
	}
	if(this.toSpawn > 1 && this.emiting){
		this.emit(Math.floor(this.toSpawn));
		this.toSpawn -= Math.floor(this.toSpawn);
	}
};
