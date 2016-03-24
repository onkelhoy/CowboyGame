var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var game = require('./GameServer')(io);


app.set('views',__dirname + '/views');
app.set('view engine', 'ejs');
app.use('/', express.static(__dirname + '/public'));

app.get('/', function(req, res){
	res.render('defualt', {
		type: 'create',
		title: 'create'
	});
});
app.get('/game/:name', function(req, res){
	res.render('defualt', {
		type: 'game',
		title: 'Game - '+req.params.name,
		name: req.params.name
	});
});
app.get('/gameLoss', function(req, res){
	res.render('defualt', {
		type: 'gameLoss',
		title: 'gameLoss'
	});
});
app.get('*', function(req, res){
	res.redirect('/');
});


server.listen(3000);