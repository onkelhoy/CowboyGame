var Player = function(pos, name){
	var player = new Object(this);

	this.name = name;
	this.current = 0;
	this.character = new Character(pos);

	this.update = function(){
		if(keys.space == 1 && this.current == 0){
			this.current = 1;
			socket.emit('standUp');
		}
		if(keys.space == 0 && this.current == 1){
			this.current = 0;
			socket.emit('standDown');
		}

		this.character.space = keys.space;
		this.character.update();
	}
	this.render = function(){
		this.character.render();
	}
	return player;
}