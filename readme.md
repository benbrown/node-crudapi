# What if you could just generate an API based on a schema?

Define one or more schemas in your model, along with any additional methods you want attached to that schema.

CRUDAPI will create the Mongoose schema, a Node CRUD api, AND a browser API client library.

Both node and client versions of the objects defined in the model will have the same methods and will behave the same.

So something like,

var model = {
	users: { 
		username: {type:"string"},
		methods: {
			log: function() {
				console.log("This is ",this.username);
			}
		}
	}
};

will result in the ability to do this on the client side:

u = new users();
u.username ='benbrown';
u.save(function(err,saved_user) { saved_user.log(); });

in the background, u.save will call /api/users and POST the data set in the object into mongoose 

on the back end, it will look something like this:

u = new users(req.body);
u.save(function(err) {
	req.json({error:err,results:this.toObject()});
}

