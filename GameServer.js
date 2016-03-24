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
				nsp.host = client.id;
			}
			else if(clients == 2){
				//tell the host
			}
			else {
				//dont connect!
				client.emit('full');
			}

			gameConnect(nsp, name, client);
		});
		socket.emit('open', gamename);
	} else socket.emit('taken'); 
}

function gameConnect(nsp, name, socket){

	socket.on('connectToGame', function(name){
		//tell host
		var clients = nsp.server.eio.clientsCount;
		var pos = Math.round(Math.random());
		if(clients == 2){
			pos = 1 - nsp.hostPos;
			socket.broadcast.emit('newPlayer', {name: name, pos: pos});
			socket.emit('host', {name: nsp.hostName, pos: nsp.hostPos});
		}
		else {
			nsp.hostName = name;
			nsp.hostPos = pos;
		}
		socket.emit('gameconnect', {name: name, pos: pos});
	});
	socket.on('disconnect', function(){
		if(this.id == nsp.host){
			nsp.emit('hostLeft');
			delete _io.nsps[nsp.name];
		}
	});
}