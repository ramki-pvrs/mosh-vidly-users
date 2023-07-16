//routes/users.js 
//require modules
    //router object is the critical one from express
    //note that in js even a function is a object
//require user model 
//GEt, POST, PUT, DELETE api routes

const auth = require('../middlewares/auth');

const config = require('config');
const jwt = require('jsonwebtoken');

const _ = require('lodash'); //Lodash is better version of underscore, may utils functions in js
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

const {User, validate} = require('../models/user');

//const mongo_connection = await mongoose.createConnection("mongodb+srv://ramkinode:ramkinode@cluster0.qoqsp.mongodb.net/vidly?retryWrites=true&w=majority").asPromise();
//const session = await mongo_connection.startSession();


//get all users; request, response
//GET api request and node middlewares processing the request
//sequentially and last middleware responding

//oberver that auth middleware function is added to the below route handler
//now if you send request from clien without x-auth-token header
//it will fail
//for success
//from Postman
//GET request to http://192.168.40.128:3012/api/users
//with header key = x-auth-token
//and value = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NGE5NzQ3OTY0MTk3NDA5OTY5Zjg4ZDUiLCJpYXQiOjE2ODkwOTQ1MTF9.8jFXRWM5C4Nr0N21kDMibtulEHjpcaIfIxfSR2l_vgo
//this is nothing but a valid x-auth-token using another POST request
//http://192.168.40.128:3012/api/auth
//with post body with valid email id and password
//{
 // "email" : "sunitha@test.com",
  //"password": "test1234test"
//}

//OBSERVE auth as middleware funcion in below get route
//it comes from middlewares/auth
router.get('/', auth, async(req, res) => {

    //if you want only authenticated users to use this api
    //you shd check for jwt token
    //jwt token should be in dB against that user and on auth, 
    //client should send jwt t

    //OOAD Information Expert principle
    //Chef cooks, waiter serves food, they have their own job and ownership cut out

    //logic to have only authenticated users is like
    //const token = req.header('x-auth-token') //expect json web token stored in this header
    //if(!token) res.status(401)

    //but you dont want the above logic in every route handler but move it to a middleware
    //middleware with next() so that once token is validated, flow moves to next middleware 
    //in node express web  app terms


    
    const users = await User
        .find()
        .sort('name');

    res.send(users);
});

//for POST
//creating a new user
//so validate first the received body which is a user object (Joi validation)

//req contains request body and request parameters
//res is what you send back when this api is called from remote
router.post('/', async(req, res) => {

    const session = await mongoose.startSession();

    const { error } = validate(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    //email being  unique, if any one user already exist with that email send error back
    let user = await User.findOne({email: req.body.email});
    //console.log(user);
    if(user) return res.status(400).send(`User with email ${req.body.email} already registered.`);  

    //from request body form the new user object

    /*
    const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password
    });
    */
    //_.pick gives sub-set of objet req.body
    //better coding stype instead of above commented block

    const newUser = new User(_.pick(req.body, ['name', 'email', 'password']));


    //salt is 
    //imagine password is 1234 -> hashed is abcd
    //hackers can hash some popular passwords and if they get abcd, 
    //they get the password 1234

    //instead you add a salt alone with hash
    //it is like adding some prefix or suffix to hashed password
    // so abcd becomes dfdfdfdf(abcd) or (abcd)dfdfdfdf
    //so even if hacker guess abcd, they can not guess salt


    const salt = await bcrypt.genSalt(10);
    newUser.password = await bcrypt.hash(newUser.password, salt);


    //newUser = await newUser.save();

    //https://mongoosejs.com/docs/transactions.html

    
    await mongoose.connection.transaction(async function setRank(session) {
        //newUser.name = 'Captain';
        await newUser.save({ session });
        newUser.isNew; // false
        console.log(`INSIDE newUser.isNew; = ${newUser.isNew}`);
      
        // Throw an error to abort the transaction
        //throw new Error('Oops!');

        //res.send(newUser);
        //you can send sub-set of object attributes back to client
        //instead of doing like below one by one
        //you can use Lodash pick method, which is underscore.pick

        //res.send({
          //name: user.name,
          //email: user.email
        //});

        //by picking, you avoid sending password back to user
        //res.send(_.pick(newUser, ['_id', 'name', 'email']));

        //after jwt tutorial, added these lines
        //to send jwt token in header

        //On POST http://192.168.0.117:3012/api/users

        /*
          {
              "name": "Sunitha7",
              "email": "sunitha7@test.com",
              "password": "test1234test"
          }
        */

          //in Postman response Header you will see x-auth-token header with jwt token value
        //const token = jwt.sign({
            //_id: newUser._id
        //}, config.get('jwtPrivateKey')); //this jwtPrivateKey is not secret key but from config 
  
        const token = newUser.generateAuthToken();
        res.header('x-auth-token', token).send(_.pick(newUser, ['_id', 'name', 'email']));

        //OOAD Principle : Information Expert Priciple
        //instead of handling jwt token gen in multiple places
        //ask where it shd be handled, who is the owner
        //chef cooks in the kitchen; server serves food outside
        //each of them are owners of their respective processes
        //so jwt token relates to user, so it shd be in user module
        //user object shd have a method then to generate jwt token


        //



      }, { readPreference: 'primary' }).catch((err) => {
        console.log(err);
        console.log(`Catch newUser.isNew; = ${newUser.isNew}`);
        res.send("New user is not created!");
      });
      
      // true, `transaction()` reset the document's state because the
      // transaction was aborted.
      newUser.isNew; //RAMKI: it is not showing true here but undefined
      console.log(`OUTSIDE newUser.isNew; = ${newUser.isNew}`);
      
    

      /*
      
      // starting session on mongoose default connection
    //const session = await mongoose.startSession();
    //https://stackoverflow.com/questions/53435616/how-to-use-mongodb-transaction-using-mongoose
    mongoose.connection.transaction(async function executor(session) {
      try {
        // creating 3 collections in isolation with atomicity
        //const price = new Price(priceSchema);
        //const variant = new Variant(variantSchema);
        //const item = new Item(itemSchema);
        throw new Error('Oops!');
       
        await newUser.save({ session });
        //await variant.save({ session });
        // throw new Error("opps some error in transaction");  
        //return await item.save({ session });
        res.send(newUser);
      } catch (err) {
        console.log(err);
        res.send("New user is not created!");
      }
     });
     */
    session.endSession()

    


    
});


module.exports = router;