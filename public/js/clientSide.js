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
	startGame(function(){ init(); });
});
socket.on('gameconnect', function(data){//connect to game
	USERNAME = data.name;
	POS = data.pos;
});

socket.on('host', function(data){//connect to game
	enemy = new Enemy(data.pos, data.name);
	startGame(function(){ init(); });
});

socket.on('youWin', function(){
	$('#winner').text(player.name);
	resetGame();
});
socket.on('enemyWin', function(){
	$('#winner').text(enemy.name);
	resetGame();
});
socket.on('standDown', function(){
	if(enemy != null) enemy.standDown();
});
socket.on('standUp', function(){
	if(enemy != null) enemy.standUp();
});
socket.on('playerLeave', function(){
	//reset game
	showError(enemy.name + ' left the game', function() {});
	enemy = null;
});