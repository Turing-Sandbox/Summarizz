// server.ts

import express from "express";
import userRoutes from '../user-module/routes/userRoutes';
import commentRoutes from "../comment-module/routes/commentRoutes";
import "./firebaseConfig";

const app = express();

app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", "default-src 'self'; script-src 'self' http://localhost:3000; connect-src 'self' http://localhost:3000;");
  next();
});

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
