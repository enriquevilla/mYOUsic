const mongoose = require("mongoose");

const commentSchema = mongoose.Schema({
    comment: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    approved: {
        type: Boolean,
        required: true
    }
});

const commentModel = mongoose.model('comments', commentSchema);

const Comments = {
    createComment : function( newComment ){
        return commentModel
            .create( newComment )
            .then( comment => {
                return comment;
            })
            .catch( err => {
                throw new Error( err.message );
            }); 
    },
    getCommentsOfPost: async function(comments){
        //comments = object ids
        let allResults = [];
        for (let ObjectId of comments) {
            const comments = await postModel.find({user: ObjectId})
                                            .then(coms => {return coms})
                                            .catch(err => {throw new Error(err.message)});
            for (let c of comments) {
                allResults += c;
            }
        }
        return allResults;
    }
}

module.exports = {
    Comments
};