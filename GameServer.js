module.exports = function(io){
	io.on('connection', function(client){
		console.log(client.id + " connected");
		client.on('create', createGame(io));
	});
}

function createGame(io){
	var name = '/game-'+this.id;
	var nsp = io.of(name);
	nsp.on('connection', function(){
		gameConnect(nsp, name);
	});
}

function gameConnect(nsp, name){
	
	socket.on('disconnect', function(){
		if(socket.id == this.host){
			console.log('host left the game');

		}
		console.log(socket.id + " left the game");
	});
}