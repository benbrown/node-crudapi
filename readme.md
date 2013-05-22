# What if you could just generate an API based on a schema?

THIS IS AN EXPERIMENTAL PROTOTYPE AND IS NOT FEATURE COMPLETE OR SAFE FOR USE!!!

Define one or more schemas in your model, along with any additional methods you want attached to that schema.

node-crudapi will create the Mongoose schema, a Node RESTful CRUD api, AND a browser API client library.

Both node and client versions of the objects defined in the model will have the same methods and will behave the same.

## Dependencies

Node, Mongo, Express and Mongoose.

## Configuration

Edit public/model.js to represent the collections and fields your app requires.

Methods can be added to the schema via:

functions defined in _methods will be available in Node and in browser.

functions defined in _serverMethods will be available only in Node.

functions defined in _clientMethods will be available only in the browser.

## Hooks

presave: called before an item is saved. return true to continue saving, or an error message to halt. handy for validation.

preremove: called before an item is removed. handy for cleanup. return true to continue, or an error message to halt.

postload: called after an item is loaded. return true to continue, or an error message to halt.

prequery: called before a query is executed. accepts a Mongoose query object, and expects a modified query object as a return value.