const mongoose = require("mongoose");

const postSchema = mongoose.Schema({
    song: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    description: {
        type: String,
        required: true
    },
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "comments",
    }]
})

const postModel = mongoose.model("posts", postSchema);

const Posts = {
    createPost : function(newPost){
        return postModel
        .create(newPost)
        .then( user => {
            return user;
        })
        .catch( err => {
            throw new Error( err.message );
        }); 
    },
    getAllPosts: function() {
        return postModel
            .find()
            .then(posts => {
                return posts;
            })
            .catch(err => {
                throw new Error(err.message);
            })
    },
    getPostsByFollowing: function(following) {
        // following = object ids
        let allResults = [];
        for (let ObjectId of following) {
            const postsByUser = await postModel.find({user: ObjectId})
                                                .then(posts => {return posts})
                                                .catch(err => {throw new Error(err.message)});
            for (let post of postsByUser) {
                allResults += post;
            }
        }
        return allResults;
    }
}

module.exports = {
    Posts
}