import { app } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./utils/logger.js";

app.listen(env.port, () => {
  logger.info("server_started", {
    url: `http://localhost:${env.port}`,
    nodeEnv: env.nodeEnv,
  });
});

process.on("uncaughtException", (error) => {
  logger.error("uncaught_exception", error);
});

process.on("unhandledRejection", (reason) => {
  logger.error("unhandled_rejection", { reason });
});
