//node v8 Google Engine - run time environment
//npm is node package manager
//npm init
//node is for api request processing
//request processing is by middlewares, system and custom middlewares 
//- note next() for next middleware till last middleware completes the request processing


//07-July-2023 - notes after a long pause
//you route your HTTP POST, GET, PUT requests to node apis
//there is a model schema, model for every resource 
//on receiving POST of a resource, (like user) validate it against pre-defined model
//to ensure received object is per api spec


//in vs code open VIDLY-USERS folder from documents/mosh

//make sure you have connected current IP address in your mongo db cloud instance
//make sure you know your ubuntu ip address in VmWare player and the port number 
//at the end of this index.js file

//open New Terminal is VS Code using Terminal tab on top
//cmd node index.js

//In Postman POST request to
//http://192.168.0.117:3012/api/users
//Body - raw - JSON 

//send the below
/*
{
    "name":"Suniitha",
    "email": "sunitha@test.com",
    "password": "test1234test"
}

//you should see valid error for sunithatest.com 
//and after creating with sunitha@test.com that user already registered
*/

//Lodash is better version of underscore
//Loadash for utility functions working with strings, arrays and other stuff


//joi password complexity


const config = require('config');
const mongoose = require('mongoose');
const express = require('express');

//users router object from routes
const users = require('./routes/users');
const auth = require('./routes/auth');
//console.log("auth router object is ");
//console.log(users);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true}));

//users is a router object from above
app.use('/api/users', users);
app.use('/api/auth', auth);


if(!config.get('jwtPrivateKey')) {
    console.log("FATAL : No jwy key defined");
    process.exit(1); //0 is success
}

//connect method returns a Promise

mongoose.connect("mongodb+srv://ramkinode:ramkinode@cluster0.qoqsp.mongodb.net/vidly?retryWrites=true&w=majority")
 .then(() => console.log("Connected to cloud mongo"))
 .catch(err => console.log("Could not connect to Mongodb", err));


/*
const mongo_connection =  async function() {
    return await mongoose.createConnection("mongodb+srv://ramkinode:ramkinode@cluster0.qoqsp.mongodb.net/vidly?retryWrites=true&w=majority").asPromise();
}

const session =  async function() {
    return mongo_connection.startSession();
}

console.log(typeof session);

*/

//const mongo_connection = mongoose.createConnection("mongodb+srv://ramkinode:ramkinode@cluster0.qoqsp.mongodb.net/vidly?retryWrites=true&w=majority");
//const session = mongo_connection.startSession();


const port = process.env.PORT || 3012;
app.listen(port, ()=>console.log(`vidly user app listening on port ${port}`));


