import cors from "cors";
import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import { appRouter } from "./routes/index.js";
import { env } from "./config/env.js";
import { errorHandler, notFound } from "./middlewares/error.middleware.js";
import { requestLogger } from "./utils/logger.js";

export const app = express();

const allowedOrigins = env.clientUrls;

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (curl/Postman) and same-origin server calls.
    if (!origin) {
      callback(null, true);
      return;
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "5mb" }));
app.use(cookieParser());
app.use(requestLogger);

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use("/api", appRouter);

app.use(notFound);
app.use(errorHandler);
