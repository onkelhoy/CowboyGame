(function(){
	"user strict";
    var express = require('express');
    var routes = express.Router();


	routes.use('/', express.static('public'));
	routes.get('/', function(req, res){
		res.redirect('/');
	});

	routes.get('/:name', function(req, res){

		res.render('defualt', {
			type: 'game',
			title: 'Game - '+req.params.name,
			name: req.params.name
		});
	});

    module.exports = routes;
}());