// server.ts

import express from "express";
import userRoutes from '../user-module/routes/userRoutes';
import commentRoutes from "../comment-module/routes/commentRoutes";
import "./firebaseConfig";

const app = express();

app.use(express.json());
app.use('/api', userRoutes);  // Prefix your routes with '/api' if desired
app.use('/api', commentRoutes);
const port = 3000;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Express is listening at http://localhost:${port}`);
});
