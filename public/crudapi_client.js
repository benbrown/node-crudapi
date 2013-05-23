			// defined for node module compatibility
			var module = {exports: {}};
					
			var API_PREFIX = '/api';
			

		// this function is where all the action happens
		// loop over the tables in the model, creating matching accessor objects
		// and setting them into the global context				
		function crudapi_client(model) {
			window.crudapi=[];
			window.global = {tables:[]}; // match node syntax
			for (var table in model) {
				
				window.crudapi[table] = window[table] = function() {};
				window[table].prototype = new api_obj(table,model[table]);
				window.global.tables[table] = new window[table]();
				
			}				
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
							
							if (cb) cb.call(that,new window[that.table]().data(json.result));
						}

					}
				});
				
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
					success: function(results) {
						if (callback) {
							callback.call(null,results.result);
						}
					}
				});
							
			}
			
			api_obj.prototype.save = function(cb) {
				console.log('ABOUT TO SAVE');				
				var that = this;
				data =  that.data();
				console.log('Got data');
				if (this.presave) {
					var hook_results = this.presave();
					if (!(hook_results===true)) {
						alert(hook_results);
						return;
					}
				}
				
				var request = {
					
						dataType: 'json',
						data: data,
						success: function(json) {
							if (json.error) {
								console.log('ERROR',json.error);	
							} else {
								console.log('SAVE SUCCESS',json);
								for (var field in json.result) {
									that[field] = json.result[field];
								}
								if (cb) cb.call(that,new window[that.table]().data(json.result));
							}
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
								if (cb) cb.call(that);
							}
						}

				}); 
		}



