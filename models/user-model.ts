import { Document, Schema, model } from "mongoose";

export interface IUser {
    userName: string;
    password: string;
    following?: Schema.Types.ObjectId[];
    favorites?: Schema.Types.ObjectId[];
}

export interface IUserModel extends IUser, Document {}

const userSchema = new Schema<IUser>({
    userName : {
        type : String,
        required : true
    },
    password : {
        type : String,
        required: true
    },
    following: [{
        type: Schema.Types.ObjectId,
        ref: "users"
    }],
    favorites: [{
        type: Schema.Types.ObjectId,
        ref: "posts"
    }]
});

const userModel = model("users", userSchema);

export const Users = {
    createUser: function(newUser: IUser){
        return userModel
            .find({userName: newUser.userName})
            .then((res: string[]) => {
                if (res.length > 0) {
                    throw new Error("Username already taken.");
                } else {
                    return userModel.create(newUser)
                        .then((user: IUser) => {
                            return user;
                        })
                        .catch((err: Error) => {
                            throw new Error(err.message)
                        })
                }
            })
            .catch((err: Error) => {
                throw new Error(err.message);
            }); 
    },
    getUserByUserName: function(userName: string){
        return userModel
            .findOne({ userName })
            .populate("following", "_id")
            .then((user: any) => {
                return user;
            })
            .catch((err: Error) => {
                throw new Error( err.message );
            }); 
    },
    createFavorite: function(username: string, postId: string){
        return userModel
            .updateOne({userName: username}, {$push: {"favorites": postId}})
            .then(() => {
                console.log(postId);
                return;
            })
            .catch((err: Error) => {
                throw new Error(err.message);
            });
    },
    removeFavorite: function(username: string, postID: string) {
        return userModel
            .updateOne({userName: username}, {$pull: {favorites: postID}})
            .then(() => {
                return;
            })
            .catch((err: Error) => {
                throw new Error(err.message);
            })
    },
    removeFavoritesFromAll: function(postID: string) {
        return userModel
            .updateMany({}, {$pull: {favorites: postID}})
            .then(() => {
                return;
            })
            .catch((err: Error) => {
                throw new Error(err.message);
            })
    },
    getFavoritesByUsername: function(username: string) {
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
            .then((user: any) => {
                return user;
            })
            .catch((err: Error) => {
                throw new Error(err.message);
            })
    },
    followUser: function(username: string, userToFollowID: string) {
        return userModel
            .updateOne({userName: username}, {$push: {following: userToFollowID}})
            .then(() => {
                return;
            })
            .catch((err: Error) => {
                throw new Error(err.message);
            })
    },
    unfollowUser: function(username: string, userToUnfollowID: string) {
        return userModel
            .updateOne({userName: username}, {$pull: {following: userToUnfollowID}})
            .then(() => {
                return;
            })
            .catch((err: Error) => {
                throw new Error(err.message);
            })
    },
    getFollowingByUsername: function(username: string) {
        return userModel
            .findOne({userName: username})
            .populate("following", ["userName"])
            .then((followed: any) => {
                return followed;
            })
            .catch((err: Error) => {
                throw new Error(err.message);
            });
    }
}