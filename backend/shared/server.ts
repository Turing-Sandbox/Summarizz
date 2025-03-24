// server.ts

import express from "express";
import "./firebaseConfig";
import cors from "cors";
import contentRoutes from "../content-module/routes/contentRoutes";
import userRoutes from "../user-module/routes/userRoutes";
import commentRoutes from "../comment-module/routes/commentRoutes";
import searchRoutes from "../search-module/routes/searchRoutes";
import oauthRoutes from "../user-module/routes/oauthRoutes";

const app = express();
const port = 3000;

app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL,
      process.env.BACKEND_URL,
      process.env.NETLIFY_URL,
    ],
  })
);

app.use(express.json());

app.use("/comment", commentRoutes);
app.use("/user", userRoutes);
app.use("/content", contentRoutes);
app.use("/search", searchRoutes);
app.use("/oauth", oauthRoutes);

// Middleware to log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.get("/", (req, res) => {
  res.send("Server is Listening!");
});

app.listen(port, () => {
  console.log(`Express is listening at http://localhost:${port}`);
});
