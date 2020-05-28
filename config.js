const DBURL = process.env.DBURL || "mongodb://localhost/musicAppdb";
const PORT = process.env.PORT || "8080";
const SECRET_TOKEN = process.env.SECRET_TOKEN;
const SPOTIFY_KEY = process.env.SPOTIFY_KEY;
module.exports = {DBURL, PORT, SECRET_TOKEN, SPOTIFY_KEY};