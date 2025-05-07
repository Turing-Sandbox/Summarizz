import express from "express";
import "./firebaseConfig";
import cors from "cors";
import contentRoutes from "../content-module/routes/contentRoutes";
import userRoutes from "../user-module/routes/userRoutes";
import commentRoutes from "../comment-module/routes/commentRoutes";
import searchRoutes from "../search-module/routes/searchRoutes";
import oauthRoutes from "../user-module/routes/oauthRoutes";
import notificationRoutes from "../notification-module/routes/notificationsRouter";
import subscriptionRoutes from "../subscription-module/routes/subscriptionRoutes";
import webhookRoutes from "../subscription-module/routes/webhookRoutes";
import { logger } from "./loggingHandler";
import cookieParser from "cookie-parser";

const app = express();
const port = 3000;

app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL,
      process.env.BACKEND_URL,
      process.env.NETLIFY_URL,
    ],
    credentials: true,
  })
);

app.use(cookieParser());

// Parse JSON requests, but use raw body for webhook routes
app.use((req, res, next) => {
  if (req.originalUrl === "/stripe/webhook") {
    next();
  } else {
    express.json()(req, res, next);
  }
});

// Middleware to log all requests
app.use((req, _, next) => {
  logger.http(`${req.method} ${req.url}`);
  next();
});

app.use("/comment", commentRoutes);
app.use("/user", userRoutes);
app.use("/content", contentRoutes);
app.use("/search", searchRoutes);
app.use("/oauth", oauthRoutes);
app.use("/notifications", notificationRoutes);
app.use("/subscription", subscriptionRoutes);
app.use("/stripe", webhookRoutes);

app.get("/", (_, res) => {
  res.send("Server is Listening!");
});

app.listen(port, () => {
  logger.http(`Express is listening at http://localhost:${port}`);
});
