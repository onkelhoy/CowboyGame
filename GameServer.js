var _io;
module.exports = function(io){
	_io = io;
	io.on('connection', function(client){
		client.on('create', function(name){
			createGame(name, client);
		});
	});
}

function createGame(gamename, socket){
	var name = '/game-'+gamename;
	if(_io[name] == undefined){
		var nsp = _io.of(name);
		nsp.gamename = gamename;

		nsp.on('connection', function(client){
			var clients = nsp.server.eio.clientsCount;
			if(clients == 1) {
				console.log("HOST FOUND");
				nsp.host = client.id;
			}

			gameConnect(nsp, name, client);
		});
		socket.emit('open', gamename);
	} else socket.emit('taken'); 
}

function gameConnect(nsp, name, socket){
	
	socket.on('disconnect', function(){
		if(this.id == nsp.host){
			nsp.emit('hostLeft');
			delete _io.nsps[nsp.name];
		}
	});
}