var model = (function() {
	
	return {
		users: {
			username: {type: "String"},
			email: {type: "String"},
			stuff: [{name: {type: "String"},value:{type: "String"}}],

			_clientMethods: {},
			
			_serverMethods: {
				preremove: function(cb) {
					
					console.log('Cleaning up user before deleting');
					var query = global.tables.posts.find({userId:this._id});
					query.exec(function(err,posts) {
						for (var x in posts) {
							posts[x].remove();
						}
					});	
					cb.call(this,true);	
				},
			},

			_methods: {
				log: function() {
					console.log('Logging user',this.username);
				},
				validator: function(cb) {
					console.log('Validating!');
					if (!this.email) {
						console.log('Failed on email');
						cb.call(this,'Email is required!');
						return;
					}
					if (!this.username) {
						console.log('Failed on username');
						cb.call(this,'Username is required');
						return;
					}
					if (this.isNew || !this._id) {
						var that = this;
						global.tables.users.find(
							{email: this.email},
							function(err,res) { 
								if (res.length>0) { 
									cb.call(that,'User with this email already exists');
								 } else {
									 cb.call(that,true);
								 } 
						    }
						);					
					} else {
						cb.call(this,true);
					}
				},
				presave: function(cb) {
					this.validator(cb);
				},
   				generateEmailLink: function() {
   					return '<a href="mailto:' + this.email + '">' + this.username +'</a>';
   				}
			}
		},
		posts: {
			title: {type: "String"},
			body: {type: "String"},
			userId: {type: 'ObjectId', ref: 'users'},
			_serverMethods: {
				prequery: function(query) {
					query.populate('userId');
					return query;
				},
				postload: function(cb) {
					// do something to test or modify this object?
					this.title=this.title.toUpperCase();
					cb.call(this,true);
//					cb.call(this,"Sorry you can't access this post");
				},
				preremove: function(cb) {
					console.log('REMOVING POST!');
					cb.call(this,true);
				}
			},
			_methods: { 
				presave: function(cb) {
					if (!this.title) {
						cb.call(this,'title is required');
						return;
					}
					if (!this.userId) {
						cb.call(this, 'userId is required');
						return;
					}
					
					cb.call(this,true);
				}
			}
		}
	}
	
})();

// fix this
// this reports an error in the browser
module.exports = model;