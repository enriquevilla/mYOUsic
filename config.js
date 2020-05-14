const DBURL = process.env.DBURL || "mongodb://localhost/inventorydb";
const PORT = process.env.PORT || "8080";

module.exports = {DBURL, PORT};