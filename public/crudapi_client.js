			// defined for node module compatibility
			var module = {exports: {}};
					
			var API_PREFIX = '/api';
			

		// this function is where all the action happens
		// loop over the tables in the model, creating matching accessor objects
		// and setting them into the global context				
		function crudapi_client(model) {
			window.global = {tables:[]}; // match node syntax
			for (var table in model) {
				
				window[table] = function(data) { if (data) { this.data(data); } };
				window[table].prototype = new api_obj(table,model[table]);
				window.global.tables[table] = new window[table]();
				
			}				
		}
		
		function crudapi_docs(model,el) {
		
			var markup = '<h2>CRUDAPI Log</h2>';
			
			markup = markup + '<p>Created accessor objects for ' + Object.keys(global.tables).length + ' data collections.</p>';
			
			markup = markup + '<dl>';
			for (var table in model) {
				
				markup = markup + '<dt>' + table +'</dt>';
				markup = markup + '<dd><p>var x = new ' +table + '();<br/>';
				for (var field in model[table]) {
					
					if (field[0]!='_') {
						markup = markup + 'x.'+field+'= $value; // $value is a ' + model[table][field].type + '<br/>';
					}			
				}
				
				
				
				markup = markup + '</p><h4>CRUD methods</h4>';				
				markup = markup + '<p>x.save(function(err,saved_obj) {...});<br/>';
				markup = markup + 'x.get($id,function(err,obj) {... });<br />';
				markup = markup + 'x.remove(function(err,obj) { ... });</p>';
				
				

				markup = markup + '<h4>List methods</h4>';				
				markup = markup + '<p>global.tables.'+table+'.find({name:val,name:val,offset:0,limit:20},function(err,results) { ... });</p>';
				
				markup = markup + '<h4>User Defined Methods</h4><p>';
				if (model[table]._methods) {
					for (var method in model[table]._methods) {
						markup = markup + 'x.' + method +'();<br/>';						
					}
				}				
				if (model[table]._clientMethods) {
					for (var method in model[table]._clientMethods) {
						markup = markup + 'x.' + method +'();<br/>';						
					}
				}				
				markup = markup + '</p>';
				
			}
			
			markup = markup + '</dl>';
			
			$(el).append(markup);
			
		}
		
		function crudapi_yesman(cb) {
			cb.call(this,true);
		}
		


			var api_obj = function(table,schema) {
			
					this.table = table;
					this.schema = schema;
				
/*
// this doesn't work for some scope reason
				for (var field in this.schema) {
					(function(that,field,schema) {
	
						that.__defineGetter__(field, function(){
					        return this.data[field];
					    });
			
					    that.__defineSetter__(field, function(val){
					       this.data[field] = val;
					    });
					 })(this,field,this.schema[field]);
				}
*/
				
					if (this.schema._methods) {
						for (var method in this.schema._methods) {
							this[method] = this.schema._methods[method];		
						}
					}
					if (this.schema._clientMethods) {
						for (var method in this.schema._clientMethods) {
							this[method] = this.schema._clientMethods[method];		
						}
					}

				return this;
				
			}
			
			api_obj.prototype.get = function(id,cb) {
				
				var that = this;
				$.ajax({
					url: API_PREFIX+'/' + this.table + '/' + id,
					type: 'get',
					dataType: 'json',
					success: function(json) {
						if (json.error) {
							console.log('ERROR',json.error);
						} else {
							console.log('GET SUCCESS',json);
							for (var field in json.result) {
								that[field] = json.result[field];
							}
						}
							
						if (cb) cb.call(that,json.error,new window[that.table]().data(json.result));

					}
				});
				return this;
				
			}
			
			api_obj.prototype.data = function(incoming) {
				if (incoming) {
					console.log('Stuffing data');
					for (var field in incoming) {
						this[field] = incoming[field];
					}
					return this;
								
				} else {
					console.log('GETTING DATA');

					var res = {};
					for (var field in this.schema) {
						if (this.schema[field].type=='ObjectId') {
							if (this[field] && this[field]._id) {
								res[field] = this[field]._id;
							}
						} else {
							res[field] = this[field];
						}
					}
					
					res._id = this._id;
				
					console.log('Done with data extraction');
					return res;	
				}
			
			}
			
			
			api_obj.prototype.find = function(params,callback) {
								
				$.ajax({
					url: API_PREFIX + '/' + this.table,
					type: 'get',
					data: params,
					success: function(json) {
						if (callback) {
							callback.call(null,json.error,json.result);
						}
					}
				});
							
			}
			
			api_obj.prototype.save = function(cb) {
				console.log('ABOUT TO SAVE');				
				var that = this;
				data =  that.data();
				console.log('Got data');
				
				var caller = this.presave ? this.presave : crudapi_yesman;

				caller.call(this,function(res) {
				
					if (!(res===true)) {
						alert(res);
					} else {
										
						var request = {
							
								dataType: 'json',
								data: data,
								success: function(json) {
									if (json.error) {
										console.log('ERROR',json.error);	
										alert(json.error);
									} else {
										console.log('SAVE SUCCESS',json);
										for (var field in json.result) {
											that[field] = json.result[field];
										}
									}
									if (cb) cb.call(that,json.error,new window[that.table]().data(json.result));
								}
							
						};
						
						
					
						if (this._id) {
							// use the UPDATE method
							request.type='put';
							request.url = API_PREFIX + '/' + this.table + '/' + this._id;					
						} else {
							// use the CREATE method
							request.type='post';
							request.url = API_PREFIX + '/' + this.table;
						}
						$.ajax(request);
					}
					
				
				})
				
			return this;
		}


			
			api_obj.prototype.remove = function(cb) {
				console.log('ABOUT TO REMOVE');				
				$.ajax({
						url: API_PREFIX+'/' + this.table +'/'+this._id,
						type: 'delete',
						dataType: 'json',
						data: data,
						success: function(json) {
							if (json.error) {
								console.log('ERROR',json.error);	
							} else {
								console.log('REMOVE SUCCESS',json);
							}

							if (cb) cb.call(that,json.error,json.result);
						}

				}); 
			return this;

		}



