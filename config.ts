const DBPORT = process.env.DBPORT || ":27017";
const DBNAME = process.env.DB || "mYOUsicDB";
export const DBURL = process.env.DBURL || `mongodb://localhost${DBPORT}/${DBNAME}`;
export const PORT = process.env.PORT || "8080";
export const SECRET_TOKEN = process.env.SECRET_TOKEN || "secret";
export const SPOTIFY_KEY = process.env.SPOTIFY_KEY || "ZTZiOWUwNDdjMjY1NGFmZDgzYTUyZDVkNjY2NmM2NzI6YjRmMmNhNmQxNmM0NDRhYmIxODg0MzQ5MjQ5N2MwNjc=";
export const PRODUCTION_MODE = process.env.PRODUCTION_MODE || true;