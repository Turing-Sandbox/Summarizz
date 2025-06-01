import cors from "cors";
import { json, urlencoded } from "express";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import { env } from "./shared/config/environment";

export const appConfig = {
  middleware: {
    cors: cors({
      origin: [env.app.frontend!, env.app.backend!, env.app.netlify!],
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    }),
    // Lower default body-parser limits to mitigate DoS risk; adjust per-route as needed
    json: json({ limit: "2mb" }),
    urlencoded: urlencoded({ extended: true, limit: "2mb" }),
    helmet: helmet({
      contentSecurityPolicy: {
        directives: {
          ...helmet.contentSecurityPolicy.getDefaultDirectives(),
          "img-src": ["'self'", "http://localhost:3000", "data:"],
        },
      },
      crossOriginResourcePolicy: { policy: "cross-origin" },
    }),
    compression: compression(),
    cookieParser: cookieParser(),
  },
  rateLimiting: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: env.node.env === "development" ? 100000 : 100, // Limit each IP to 100 requests per windowMs
  },
};
