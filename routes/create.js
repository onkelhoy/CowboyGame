(function(){
	"user strict";
    var express = require('express');
    var routes = express.Router();

	routes.get('/', function(req, res){
		res.render('defualt', {
			type: 'create',
			title: 'create'
		});
	});
	
    module.exports = routes;
}());