const mongoose = require("mongoose");

const tokenSchema = mongoose.Schema({
    token: {
        type: String,
        required: true
    }
});

const tokenModel = mongoose.model('token', tokenSchema);

const Token = {
    updateToken: function(newToken) {
        tokenModel
            .updateOne({}, {$set: {"token": newToken}})
            .then(_ => {
                return tokenModel
                    .findOne()
                    .then(token => {
                        return token;
                    })
                    .catch(err => {
                        throw new Error(err.message);
                    });
            })
            .catch( err => {
                throw new Error(err.message);
            }); 
    },
    getToken: function() {
        return tokenModel
            .find()
            .then(token => {
                return token;
            })
            .catch(err => {
                throw new Error(err.message)
            })
    }
}

module.exports = {
    Token
};