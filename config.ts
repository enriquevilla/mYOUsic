const DBPORT = ":27017";
export const DBURL = process.env.DBURL || `mongodb://localhost${DBPORT}/mYOUsicDB`;
export const PORT = process.env.PORT || "8080";
export const SECRET_TOKEN = process.env.SECRET_TOKEN || "secret";
export const SPOTIFY_KEY = process.env.SPOTIFY_KEY || "";