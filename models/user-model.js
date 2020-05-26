const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    userName : {
        type : String,
        required : true
    },
    password : {
        type : String,
        required: true
    },
    following: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    }],
    favorites: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "posts"
    }]
});

const userModel = mongoose.model("users", userSchema);

const Users = {
    createUser : function( newUser ){
        return userModel
            .find({userName: newUser.userName})
            .then(r => {
                if (r.length > 0) {
                    throw new Error("Username already taken.");
                } else {
                    return userModel.create( newUser )
                        .then( user => {
                            return user;
                        })
                        .catch(err => {
                            throw new Error(err.message)
                        })
                }
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
    },
    createFavorite: function(userId, postId){
        console.log("user:" + userId)
        console.log("post:" + postId)
        return userModel
            .updateOne({_id: userId}, {$push: {"favorites": postId}})
            .then(_ => {
                console.log(postId);
                return _
            })
            .catch(err => {
                throw new Error(err.message);
            });
    }
}

module.exports = {
    Users
};