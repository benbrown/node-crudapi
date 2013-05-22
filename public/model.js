var model = (function() {
	
	return {
		users: {
			username: {type: "String"},
			email: {type: "Stirng"},
			methods: {
				log: function() {
					console.log('Logging user',this.username);
				}	
				
			}
		},
		posts: {
			title: {type: "String"},
			body: {type: "String"}
		}
	}
	
})();

module.exports = model;