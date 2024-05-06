import { Document, Schema, model } from "mongoose";

export interface IPost {
    song: string,
    user: string,
    description: string,
    comments?: string[]
}

export interface IPostModel extends IPost, Document {};

const postSchema = new Schema<IPost>({
    song: {
        type: String,
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    description: {
        type: String,
        required: true
    },
    comments: [{
        type: Schema.Types.ObjectId,
        ref: "comments",
    }]
});

const postModel = model("posts", postSchema);

export const Posts = {
    createPost: function(newPost: IPost){
        return postModel
            .create(newPost)
            .then( post => {
                return post;
            })
            .catch( err => {
                throw new Error(err.message);
            }); 
    },
    getAllPosts: function() {
        return postModel
            .find()
            .populate("user", "userName")
            .populate("comments", ["comment", "username", "approved"])
            .then((posts: IPost) => {
                return posts;
            })
            .catch((err: Error) => {
                throw new Error(err.message);
            })
    },
    updatePostComments: function(postID: string, commentID: string) {
        return postModel
            .updateOne({_id: postID}, {$push: {"comments": commentID}})
            .then(() => {
                return this.getPostAfterUpdate(postID)
            })
            .catch((err: Error) => {
                throw new Error(err.message);
            })
    },
    getPostAfterUpdate: function(postID: string) {
        return postModel
            .findOne({_id: postID})
            .populate("comments", ["comment", "username", "approved"])
            .then((post: any) => {
                return post;
            })
            .catch((err: Error) => {
                throw new Error(err.message);
            });
    },
    getPostsByUserID: function(userId: string) {
        return postModel
            .find({user: userId})
            .populate("comments", ["comment", "username", "approved"])
            .populate("user", ["userName"])
            .then((users: any) =>{
                return users;
            })
            .catch((err: Error) => {
                throw new Error(err.message);
            });
    },
    deleteOwnPosts: function(postId: string) {
        return postModel
            .findOneAndDelete({ _id: postId })
            .then((removed: IPost) => {
                if (removed == null) {
                    throw new Error();
                }
                return "Deleted";
            })
            .catch((err: Error) => {
                throw new Error(err.message);
            });
    },
    getPostByID: function(postID: string) {
        return postModel
            .findOne({_id: postID})
            .then((post: any) => {
                return post;
            })
            .catch((err: Error) => {
                throw new Error(err.message);
            })
    },
    getPostsByUserList: function(userList: any) {
        console.log(userList);
        return postModel
            .find()
            .populate({
                path: 'user',
                match: {_id: {$in: userList}},
            })
            .populate("comments", ["comment", "username", "approved"])
            .then((posts: any) => {
                return posts;
            })
            .catch((err: Error) => {
                throw new Error(err.message);
            })    
    }
}