var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var game = require('./GameServer')(io);


app.use('/', express.static(__dirname + '/public'));
app.get('/', function(req, res){
	res.render()
});
app.get('/game', function(req, res){
	res.sendfile('html/game.html');
});
app.get('/gameLoss', function(req, res){
	res.sendfile('html/gameLoss.html');
});
app.get('*', function(req, res){
	res.redirect('/');
});


server.listen(3000);