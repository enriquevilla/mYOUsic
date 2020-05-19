const DBURL = process.env.DBURL || "mongodb://localhost/musicAppdb";
const PORT = process.env.PORT || "8080";
const SECRET_TOKEN = process.env.PORT || "secret";
module.exports = {DBURL, PORT, SECRET_TOKEN};