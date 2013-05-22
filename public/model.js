var model = (function() {
	
	return {
		users: {
			username: {type: "String"},
			email: {type: "String"},
			stuff: [{name: {type: "String"},value:{type: "String"}}],

			_clientMethods: {},
			
			_serverMethods: {
				preremove: function() {
					
					console.log('Cleaning up user before deleting');
					var query = global.tables.posts.find({userId:this._id});
					query.exec(function(err,posts) {
						for (var x in posts) {
							posts[x].remove();
						}
					});	
					return true;			
				},
			},

			_methods: {
				log: function() {
					console.log('Logging user',this.username);
				},
				validator: function() {
					console.log('Validating!');
					if (!this.email) {
						console.log('Failed on email');
						return 'Email is required!';
					}
					if (!this.username) {
						console.log('Failed on username');
						return 'Username is required';
					}
					return true;
				},
				presave: function() {
					return this.validator();
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
				postload: function() {
					return "Sorry you can't access this post"; 
				},
				preremove: function() {
					console.log('REMOVING POST!');
					return true;
				}
			},
			_methods: { 
				presave: function() {
					if (!this.title) {
						return 'title is required';
					}
					if (!this.userId) {
						return 'userId is required';
					}
					
					return true;					
				}
			}
		}
	}
	
})();

// fix this
// this reports an error in the browser
module.exports = model;