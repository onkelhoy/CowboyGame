var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var gameServer = require('./GameServer')(io);
var createRouter = require('./routes/create');
var gameRouter = require('./routes/game');


app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use('/', express.static('public'));

app.use('/', createRouter);
app.use('/game', gameRouter);


app.get('/gameLoss', function(req, res){
	res.render('defualt', {
		type: 'gameLoss',
		title: 'gameLoss'
	});
});
app.get('*', function(req, res){
	res.redirect('/');
});

var port = process.env.PORT || 3000;
server.listen(port, function(){
	console.log('listening on port: ' + port);
});