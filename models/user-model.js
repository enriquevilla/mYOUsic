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
            .populate("following", "_id")
            .then( user => {
                return user;
            })
            .catch( err => {
                throw new Error( err.message );
            }); 
    },
    createFavorite: function(username, postId){
        return userModel
            .updateOne({userName: username}, {$push: {"favorites": postId}})
            .then(_ => {
                console.log(postId);
                return _
            })
            .catch(err => {
                throw new Error(err.message);
            });
    },
    removeFavorite: function(username, postID) {
        return userModel
            .updateOne({userName: username}, {$pull: {favorites: postID}})
            .then(_ => {
                return _;
            })
            .catch(err => {
                throw new Error(err.message);
            })
    },
    removeFavoritesFromAll: function(postID) {
        return userModel
            .updateMany({}, {$pull: {favorites: postID}})
            .then(_ => {
                return _;
            })
            .catch(err => {
                throw new Error(err.message);
            })
    },
    getFavoritesByUsername: function(username) {
        return userModel
            .findOne({userName: username})
            .populate({
                path: 'favorites',
                populate: {
                  path: 'user'
                }
            })
            .populate({
                path: 'favorites',
                populate: {
                  path: 'comments'
                }
            })
            .then(user => {
                return user;
            })
            .catch(err => {
                throw new Error(err.message);
            })
    },
    followUser: function(username, userToFollowID) {
        return userModel
            .updateOne({userName: username}, {$push: {following: userToFollowID}})
            .then(_ => {
                return _;
            })
            .catch(err => {
                throw new Error(err.message);
            })
    },
    unfollowUser: function(username, userToUnfollowID) {
        return userModel
            .updateOne({userName: username}, {$pull: {following: userToUnfollowID}})
            .then(_ => {
                return _;
            })
            .catch(err => {
                throw new Error(err.message);
            })
    },
    getFollowingByUsername: function(username) {
        return userModel
            .findOne({userName: username})
            .populate("following", ["userName"])
            .then(followed => {
                return followed;
            })
            .catch(err => {
                throw new Error(err.message);
            });
    }
}

module.exports = {
    Users
};