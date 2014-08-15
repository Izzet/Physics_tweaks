function Matrix (arrOfArr){
	Array.call(this);
	if(arrOfArr && arrOfArr.length){
		var  maxRows;
		for(var i = 0; i < arrOfArr.length; i++){
			maxRows = arrOfArr[i].length;
			this[i] = [];
			for(var j = 0; j < maxRows;j++){
				this[i][j] = arrOfArr[i][j] === undefined ? 0 : arrOfArr[i][j];
			};
		};
	}
	else
		this[0] = [0];
};

Matrix.prototype.iterate = function ( f ){
	if(f === undefined)
		return;
	for(var i = 0; i < this.length();i++){
		for(var j = 0; j < this[i].length;j++){
			f(this, [i,j]);
		};
	};
	return this;
};

Matrix.prototype.multiplyScalar = function ( s ){
	var _this = this;
	this.iterate(function (matrix,coordinates){
		matrix[coordinates[0]][coordinates[1]] = matrix[coordinates[0]][coordinates[1]]*s;
	});
};

Matrix.prototype.multiply = function ( matrix ){
	var product;
	if(matrix instanceof Vec2){
		if(this[0].length != 2)
			return false;
		if(this.length() == 2){
			product = new Vec2();
			product.x = this[0][0]*matrix.x+this[0][1]*matrix.y;
			product.y = this[1][0]*matrix.x+this[1][1]*matrix.y;
			return product;
		}
		else{
			var m = this.vectorToMatrix(matrix);console.log(m);
			return this.multiply(m);
		}
	}
	if(matrix instanceof Matrix){
		if(this[0].length != matrix.length())
			return false;
		product = new Matrix().generateEmptyMatrix(this.length(), matrix[0].length);
		var _this = this;
		product.iterate(function (pm, coordinates){
			var sum = 0;
			for(var i = 0; i < _this[0].length; i++){
				sum += _this[coordinates[0]][i]*matrix[i][coordinates[1]];
			};
			pm[coordinates[0]][coordinates[1]] = sum;
		});
		return product;
	}
	return false;
};

Matrix.prototype.length = function (){
	var l = 0;
	while(this[l]){
		l++;
	}
	return l;
};

Matrix.prototype.get = function (x,y){
	return this[x][y];
};

Matrix.prototype.generateEmptyMatrix = function (rows, columns){
	var m = new Matrix();
	for(var i = 0; i < rows; i++){
		m[i] = [];
		for(var j = 0; j < columns; j++){
			m[i][j] = 0;
		};
	};
	return m;
};

Matrix.prototype.vectorToMatrix = function ( v ){
	var m = new Matrix().generateEmptyMatrix(2,1);
	m[0][0] = v.x;
	m[1][0] = v.y;
	return m;
};

Matrix.prototype.generateRotationMatrix = function ( alpha ){
	var m = new Matrix().generateEmptyMatrix(2,2);
	m[0][0] = Math.cos(alpha);
	m[0][1] = -Math.sin(alpha);
	m[1][0] = Math.sin(alpha);
	m[1][1] = Math.cos(alpha);
	return m;
};