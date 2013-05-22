module.exports = function(app,model,API_PREFIX,mongoose) {
	
	global.tables = {};
	
	for (var table in model) {
		
		(function(table,schema) {
		
			var fields={};
			for (var field in schema) {
				if (field!='methods' && field!='_serverMethods' && field!='_clientMethods' && field!='_methods') {
					fields[field] = schema[field];
				}
			}
		
			var mongoose_schema = new mongoose.Schema(fields);		
			
			for (var method in schema._methods) {
				mongoose_schema.methods[method] = schema._methods[method];


			}
			for (var method in schema._serverMethods) {
				mongoose_schema.methods[method] = schema._serverMethods[method];
			}
			
			if (mongoose_schema.methods.presave) {
				mongoose_schema.pre('save',function(next) {
					var results = this.presave();
					if (!(results===true)) {
						next(new Error(results));
					} else {
						next();
					}
				});
			}			
			
			if (mongoose_schema.methods.preremove) {
				mongoose_schema.pre('remove',function(next) {
					var results = this.preremove();
					if (!(results===true)) {
						next(new Error(results));
					} else {
						next();
					}
				});
			}			

			global.tables[table] = mongoose.model(table,mongoose_schema);		


			// COLLECTION LIST
			// GET to /api/<collection> will list items
			// can optionally specify limit, offset, sort
			// can optionally specify 
			app.get(API_PREFIX + '/' + table,function(req,res) {
				var query = global.tables[table].find();
				var limit = req.param('limit',20);
				var offset = req.param('offset',0);
				
				query.limit(limit);
				query.skip(offset);

				
				//set up conditions of query
				for (var p in req.query) {
					if (p=='limit' || p=='offset') {
						continue;
					}
					console.log('setting up condition',p,req.query[p]);
					query.where(p,req.query[p]);
					
				}

				if (schema._serverMethods && schema._serverMethods.prequery) {
					query = schema._serverMethods.prequery(query); 
				}		
				
				query.exec(function(err,results) {
					
					if (err) {
						res.json({error:err.message});
					} else {
						res.json({error:null,result:results});
					}
					
				});				
								
				
				
			});


			// CREATE
			// POST to /api/<collection> creates a new item
			// This can also be used to update an existing item
			app.post(API_PREFIX+'/' + table,function(req,res) {
				
				console.log('Running a post on /'+table);
				
				if (req.body._id) {
	
					var query = global.tables[table].findOne({'_id': req.body._id});
					query.exec(function(err,obj) {
						
						if (!obj) {
							res.json({error:'Cannot find object'});
						} else {
							for (var field in req.body) {
								obj[field] = req.body[field];
							}

							obj.save(function(err) {
								//obj.log();
								if (err) {
									err = err.message;
								}
	
								res.json({error:err,result:obj.toObject()});
							});		
						}				
					})

					
				} else {
					var obj = new global.tables[table](req.body);
					console.log('SAVING');

					obj.save(function(err) {
						console.log('SAVED');
						if (err) {
							err = err.message;
						}
						res.json({error:err,result:obj.toObject()});
					});
				}
				
			});

			// UPDATE
			// PUT /api/<collection>/<id> will retrieve that item	
			app.put(API_PREFIX+'/' + table+'/:id',function(req,res) {
			
				console.log('Running an UPDATE on '+table);

				var query = global.tables[table].findOne({'_id': req.param('id')});
				query.exec(function(err,obj) {
					
					if (!obj) {
						res.json({error:'Cannot find object'});
					} else {
						for (var field in req.body) {
							obj[field] = req.body[field];
						}
	
						obj.save(function(err) {
							//obj.log();
							if (err) {
								err = err.message;
							}
	
							res.json({error:err,result:obj.toObject()});
						});		
					}				
				})
				
			});

			// RETRIEVE
			// GET /api/<collection>/<id> will retrieve that item	
			app.get(API_PREFIX+'/' + table+'/:id',function(req,res) {

				console.log('Running a get on /'+table,req.param('id'));
				
				var query = global.tables[table].findOne({'_id': req.param('id')});
				if (schema._serverMethods && schema._serverMethods.prequery) {
					query = schema._serverMethods.prequery(query); 
				}				
				query.exec(function(err,obj) {
					//obj.log();
					if (!obj) {
						res.json({error:'Cannot find object'});						
					} else {
						if (obj.postload) {
							var hook_results = obj.postload();
							if (!(hook_results===true)) {
								res.json({error:hook_results,result:null});
								return;
							}
						}
						res.json({error:err,result:obj.toObject()});
					}
				});
				
			});
			
			// DELETE
			// DELETE /api/<collection>/<id> will delete the item
			app.delete(API_PREFIX+'/' + table+'/:id',function(req,res) {
				
				console.log('Running a delete on /'+table);
					var query = global.tables[table].findOne({'_id': req.param('id')});
					query.exec(function(err,obj) {
						obj.remove(function(err) {
							
							if (err) {
								err = err.message;
							}
							res.json({error:err,result:obj.toObject()});
							
						});					
							
					});
				
			});


		})(table,model[table]);
		
	}
	
}