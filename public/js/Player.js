var Player = function(pos, name){
	var player = new Object(this);

	this.name = name;
	this.character = new Character(pos);

	return player;
}