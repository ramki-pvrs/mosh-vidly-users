
//this is a router module, similar as users.js

const config = require('config');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
//there is a underscore symbol in next line, which is const variable type
//representing lodash module
const _ = require('lodash');

//you dont need validate function from user
//because for auth, you need only email and password
//so a new validate at the end of this file
const {User} = require('../models/user');
const mongoose = require('mongoose');
const express = require('express');
const Joi = require('joi');
const router = express.Router();


//ERROR: got 404, 
//for some reason couple of tiems stopped the app with Ctrl+c
//then it was some spelling mistake in validateAuth function below
//also the joi.schema changes were required


//Potman post req body
//http://192.168.0.117:3012/api/auth
/*


{
    "email" : "sunitha@test.com",
    "password": "test1234test"
}

*/


router.post('/', async(req, res) => {

    //console.log("inside auth post req");

    //validate that user entered valid email and password
    //while registering, else throw error
    const { error } = validateAuth(req.body);

    if (error) return res.status(400).send(error.details[0].message);

    //console.log(req.body.email);

    //to auth, user should exist already
    let user = await User.findOne({email: req.body.email});

    //if user with that enetered email id does not exist,
    //send error back to the user who is trying to get authenticated

    //observe the ! symbole before user !user
    if(!user) return res.status(400).send("Invalid email id or password");

    const validPassword = await bcrypt.compare(req.body.password, user.password);


    if(!validPassword) return res.status(400).send("Invalid email id or password");

    //res.send(true);

    //JSON Web Token (JWT)
    //long string that identifies the user
    //like driver license or passport of an individual

    //Client ------>   login ----> Server
    //Client <------  JWT <----- Server
    //next time when client accesses one of the server apis, use JWT
    //client stores JWT tokens, time bound
    //webapp - React JWT in local storage
    //mobile app - similar options based on React or other framework
    //https://jwt.io

    //JWT - 3 parts - Header - Payload - Secret Key
    //Secret Key is available only in Server - private key
    //node module name is jsonwebtoken


    //const token = jwt.sign({
        //_id: user._id
    //}, 'jwtPrivateKey'); //should not be storing private key like this in production

    //you need config module to store env vars 
    //npm install config

    //config folder in VIDLY_USERS 
    //default.json
    //custom-environment-variables.json
    //{
    //"jwtPrivateKey": "vidlyUsers_jwtPrivateKey"
    //}

    //in terminal export vidlyUsers_jwtPrivateKey=mySecretKey

    //if you run node index.js now and in Postman make a auth request
    //you shd see again a generated jwt token in POSTMAN response section

     //OOAD Principle : Information Expert Priciple
        //instead of handling jwt token gen in multiple places
        //ask where it shd be handled, who is the owner
        //chef cooks in the kitchen; server serves food outside
        //each of them are owners of their respective processes
        //so jwt token relates to user, so it shd be in user module
        //user object shd have a method then to generate jwt token


        //in user model make a chagne


    //const token = jwt.sign({
        //_id: user._id
    //}, config.get('jwtPrivateKey')); //this jwtPrivateKey is not secret key but from config 

    const token = user.generateAuthToken();
    
    res.send(token); 

    //in Postman on POST of email and password for auth
    //you will see response like
    //eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NGE5NzQ3OTY0MTk3NDA5OTY5Zjg4ZDUiLCJpYXQiOjE2ODg4NzMxNjd9.oDuzy4RTpxr7R4AV_HtHkKuCczBiqQOS3ekbB4dGbvw




});


//you need a specific validate function in auth
//only with email and password

function validateAuth(req) {
    //key:value pairs from api url params

    const schema = Joi.object({
        email: Joi.string().min(10).max(255).required().email(),
        password: Joi.string().min(8).max(12).required()
    });

    return schema.validate(req);
    
}


module.exports = router;

