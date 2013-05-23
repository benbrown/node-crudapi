var express = require('express');
var mongoose = require('mongoose');
var hbs = require('hbs');

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;


var app = express();
app.configure(function(){
  app.set('views', __dirname + '/public');
 
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
	res.render('index');
});



/// this defines the data model and any associated methods
var model = require("./public/model.js");

// this will create all the necessary CRUD api endpoints
require('./crudapi')(app,model,'/api',mongoose);


mongoose.connect(process.env.MONGOLAB_URI || 'mongodb://localhost:27017/mingle');
var db = mongoose.connection;
db.on('error', function callback(err) { console.log('INGEST: Error connecting to mongo',err); });
db.once('open', function callback () {
	app.listen(process.env.PORT || 3000);

});
