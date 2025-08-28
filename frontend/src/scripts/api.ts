let baseApiUrl = "https://comp313-402-team3-w25-production.up.railway.app";
// let baseApiUrl = "https://ts-backend.up.railway.app";

if (process.env.NODE_ENV === "development") {
  baseApiUrl = "http://localhost:3000";
}

export const apiURL = baseApiUrl;
