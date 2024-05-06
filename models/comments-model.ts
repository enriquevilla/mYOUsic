import { Document, Schema, model } from "mongoose";

export interface IComment {
    comment: string;
    username: string;
    approved: boolean
}

export interface ICommentModel extends IComment, Document {}

const commentSchema = new Schema({
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

const commentModel = model('comments', commentSchema);

export const Comments = {
    createComment: function(newComment: IComment) {
        return commentModel
            .create(newComment)
            .then(comment => {
                return comment;
            })
            .catch(err => {
                throw new Error(err.message);
            }); 
    },
    approveComment: function(commentID: string) {
        return commentModel
            .updateOne({_id: commentID}, {$set: {approved: true}})
            .then(() => {
                return;
            })
            .catch((err: Error) => {
                throw new Error(err.message);
            })
    },
    deleteComment: function(commentID: string) {
        return commentModel
            .deleteOne({_id: commentID})
            .then(() => {
                return;
            })
            .catch((err: Error) => {
                throw new Error(err.message);
            })
    }
}