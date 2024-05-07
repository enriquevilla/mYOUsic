const DBPORT = process.env.DBPORT || ":27017";
const DBNAME = process.env.DB || "mYOUsicDB";
export const DBURL = process.env.DBURL || `mongodb://localhost${DBPORT}/${DBNAME}`;
export const PORT = process.env.PORT || "8080";
export const SECRET_TOKEN = process.env.SECRET_TOKEN || "<your spotify client secret>";
export const SPOTIFY_KEY = process.env.SPOTIFY_KEY || "<your spotify client ID>";
export const PRODUCTION_MODE = process.env.PRODUCTION_MODE || true;