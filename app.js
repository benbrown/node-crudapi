var express = require('express');
var mongoose = require('mongoose');
var hbs = require('hbs');


var API_PREFIX = '/api';

/// this defines 
var model = require("./public/model.js");

var app = express();
app.configure(function(){
  app.set('views', __dirname + '/views');
 
  app.set('view engine', 'hbs');
  app.use(express.limit(10*1024*1024));
  app.use(express.bodyParser({maxFieldsSize: 10*1024*1024}));
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: '03oijqwlfkjlfkjlk' }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.get('/',function(req,res) {
	console.log(model);
	res.json(model);
});


var generator = (function(app,model) {
	
	for (var table in model) {
		
		(function(table,schema) {
			app.get(API_PREFIX+'/' + table,function(req,res) {
				
				console.log('Running a get on /'+table);
				res.json(schema);
				
			});

			app.get(API_PREFIX+'/' + table+'/:id',function(req,res) {
				
				console.log('Running a get on /'+table);
				res.json({id:req.param('id')});
				
			});


			app.post(API_PREFIX+'/' + table,function(req,res) {
				
				console.log('Running a post on /'+table);
				console.log(req.body);
				res.json(req.body);
				
			});

		})(table,model[table]);
		
	}
	
	
})(app,model);





app.listen(process.env.PORT || 3000);
