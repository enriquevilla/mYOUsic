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
    createComment : function(newComment) {
        return commentModel
            .create(newComment)
            .then(comment => {
                return comment;
            })
            .catch( err => {
                throw new Error(err.message);
            }); 
    }
}

module.exports = {
    Comments
};