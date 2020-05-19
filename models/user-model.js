const mongoose = require( 'mongoose' );

const songSchema = mongoose.Schema({
    name : {
        type : String,
        required : true
    },
    href: {
        type : String,
        required: true
    }

});

const userSchema = mongoose.Schema({
    userName : {
        type : String,
        required : true
    },
    password : {
        type : String,
        required: true
    },
    favSongs:[songSchema]
});

const userModel = mongoose.model( 'user', userSchema );

const Users = {
    createUser : function( newUser ){
        return userModel
                .create( newUser )
                .then( user => {
                    return user;
                })
                .catch( err => {
                    throw new Error( err.message );
                }); 
    },
    getUserByUserName: function( userName ){
        return userModel
                .findOne( { userName } )
                .then( user => {
                    return user;
                })
                .catch( err => {
                    throw new Error( err.message );
                }); 
    }
}

module.exports = {
    Users
};