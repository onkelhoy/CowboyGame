var Enemy = function(pos, name){
	var enemy = new Object(this);

	this.name = name;
	this.character = new Character(name, pos);

	this.update = function(){
		this.character.update();
	}
	this.standUp = function(){
		this.character.space = 1;
	}
	this.standDown = function(){
		this.character.space = 0;
	}
	this.render = function(){
		this.character.render();
	}
	return enemy;
}