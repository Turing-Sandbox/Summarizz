// server.ts

import express from "express";
import "./firebaseConfig";
import cors from "cors";
import contentRoutes from "../content-module/routes/contentRoutes";
import userRoutes from "../user-module/routes/userRoutes";
import commentRoutes from "../comment-module/routes/commentRoutes";

const app = express();
const port = 5000;
app.use(cors());
app.use(express.json());

app.use("/comment", commentRoutes);
app.use("/user", userRoutes);
app.use("/content", contentRoutes);

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
