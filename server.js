const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const {DBURL, PORT} = require("./config");
const app = express();
const jsonParser = bodyParser.json();

app.use(express.static("public"));

app.listen(PORT, () => {
    console.log("Server running on localhost:8080");
    new Promise((resolve, reject) => {
        mongoose.connect(DBURL, {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true}, (err) => {
            if (err) {
                reject(err);
            } else {
                console.log("Connected to db successfully");
                return resolve();
            }
        });
    })
    .catch(err => {
        mongoose.disconnect();
        console.log(err);
    });
});