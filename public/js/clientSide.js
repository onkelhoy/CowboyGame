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

});
socket.on('gameconnect', function(data){//connect to game
	USERNAME = data.name;
	POS = data.pos;
	init();
});

socket.on('host', function(data){//connect to game
	USERNAME = data.name;
	POS = data.pos;
	init();
});