import cors from "cors";
import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import { appRouter } from "./routes/index.js";
import { env } from "./config/env.js";
import { errorHandler, notFound } from "./middlewares/error.middleware.js";

export const app = express();

app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  })
);
app.use(express.json({ limit: "5mb" }));
app.use(cookieParser());

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use("/api", appRouter);

app.use(notFound);
app.use(errorHandler);
