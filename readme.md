# What if you could just generate an API based on a schema?

THIS IS AN EXPERIMENTAL PROTOTYPE AND IS NOT FEATURE COMPLETE OR SAFE FOR USE!!!

Define one or more schemas in your model, along with any additional methods you want attached to that schema.

node-crudapi will create the Mongoose schema, a Node RESTful CRUD api, AND a browser API client library.

Both node and client versions of the objects defined in the model will have the same methods and will behave the same.

## Using node-crudapi

In your Node app:

```
/// this defines the data model and any associated methods
var model = require("./public/model.js");

// this will create all the necessary CRUD api endpoints
require('./crudapi')(express_app,model,'/api',mongoose);
```

In your browser client Javascript:
```
<script src="model.js"></script>
<script src="crudapi_client.js"></script>
````

The *same* file, model.js, is included in both the Node app and the browser app. The node-crudapi module and its matching crudapi_client.js, once instantiated, will create all the necessary API endpoints AND client accessor objects.

## Dependencies

Node, Mongo, Express and Mongoose.

## Configuration

Edit public/model.js to represent the collections and fields your app requires.

Collections can be defined using standard Mongoose schema definition, with the addition the ability to define add-on methods and plugin hooks:

functions defined in _methods will be available in Node and in browser.

functions defined in _serverMethods will be available only in Node.

functions defined in _clientMethods will be available only in the browser.


## Hooks

presave(callback): called before an item is saved. callback must receive true to continue, or an error. handy for validation.

preremove(callback): called before an item is removed. handy for cleanup. callback must receive true to continue, or an error.

postload(callback): called after an item is loaded. can modify the this variable. callback must receive true to continue, or an error.

prequery: called before a query is executed. accepts a Mongoose query object, and expects a modified query object as a return value.

## Example

In models.js:

```
   var model = {
   		users: {
   			username: {type: 'String'},
   			email: {type: 'String'},
   			_methods: {
   				presave: function(cb) {
   					if (!this.email) {
   						cb.call(this, 'Validation failed.');
   						return;
   					}
   					if (!this.username) {
   						cb.call(this, 'Validation failed.');
   						return;
   					}
   					cb.call(this,true);
   				},
   				generateEmailLink: function() {
   					return '<a href="mailto:' + this.email + '">' + this.username +'</a>';
   				
   				}
   			}
   		}
   }
```

Will result in a Node-powered RESTful API with endpoints like:

```
GET /api/users - query collection

POST /api/users - create new user

GET /api/users/:id - retrieve user by id

DELETE /api/users/:id - delete user

PUT /api/users/:id - update user record by id
```


And will also result in browser-based objects, such that:

```

var u = new users();
u.username = 'ben';
u.email = 'ben@xoxco.com';
u.save(function(err,saved) {...});
u.generateEmailLink(); // call custom method

```

Calling u.save will:

1. Trigger the presave method in the browser, validating the data

2. Make an AJAX call to POST to /api/users

3. The presave method will be called by Node as well, revalidating the data

4. Data stored in mongoose


## Quirks

Since methods can be called on the server and in the browser, you need to be careful that you do not call anything that won't work in one of those contexts.

You can access other collections via the global.tables object.

```
global.tables.user.find({username:'ben',limit:5},function(err,results) {

});

```

