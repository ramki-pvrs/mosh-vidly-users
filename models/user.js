//model steps
//require node modules
//create object schema 
//create object model using that schema
//add validation function to validate user input
   //coming in api calls url params - joi validation and not dB validation

//export it to calling module, e.g. index.js

const config = require('config');
const jwt = require('jsonwebtoken');

const mongoose = require('mongoose');
const Joi = require('joi');

console.log(typeof Joi);

//create user schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 255
    },
    email: {
        type: String,
        required: true,
        unique: true,
        minlength: 10,
        maxlength: 255
    },
    password: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 2048
    }
});

//add a method to userSchema to generate jwt token
//generateAuthToken is the method name for user object
//the function takes params

//because you are using this._id, you cannot convert RHS functio() to arrow function
//because in arrow function, this refers to the calling function  and not the object
//we are interested in, in this case user object

//YOU SHOULD NOT USE arrow function for a method which is part of a object
//you should create arrow function when it is standalone function




userSchema.methods.generateAuthToken = function() {
    //jwt token payload, user object only with user id
    const token = jwt.sign({
        _id: this._id
    }, config.get('jwtPrivateKey')); //this jwtPrivateKey is not secret key but from config 
    return token;
}



//create model
const User = mongoose.model('User', userSchema);

//the user object passed comes from api url params
function validateUser(user) {
    //key:value pairs from api url params

    const user_schema = Joi.object({
        name: Joi.string().min(3).max(255).required(),
        email: Joi.string().min(10).max(255).required().email(),
        password: Joi.string().min(8).max(12).required()
    });

    return user_schema.validate(user);
    
}

module.exports.userSchema = userSchema;
module.exports.User = User;
module.exports.validate = validateUser;
