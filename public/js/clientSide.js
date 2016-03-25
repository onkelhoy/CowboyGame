socket.on('hostLeft', function(){
	showError('Host left the game!', function(){
		window.location.href = "/gameLoss";
	});
});
socket.on('full', function(){
	showError('Game is full', function(){
		window.location.href = "/";
	});
});
socket.on('newPlayer', function(data){//add second player
	enemy = new Enemy(data.pos, data.name);
});
socket.on('gameconnect', function(data){//connect to game
	USERNAME = data.name;
	POS = data.pos;
	init();
});

socket.on('host', function(data){//connect to game
	enemy = new Enemy(data.pos, data.name);
});


socket.on('standDown', function(){
	if(enemy != null) enemy.standDown();
});
socket.on('standUp', function(){
	if(enemy != null) enemy.standUp();
});
socket.on('playerLeave', function(){
	//reset game
	showError(enemy.name + ' left the game');
	enemy = null;
});