import fs from "fs";
import path from "path";
import { env } from "../config/env.js";

const logDir = path.join(process.cwd(), "logs");
if (env.logToFile) {
  fs.mkdirSync(logDir, { recursive: true });
}

const levelWeight = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

function shouldLog(level) {
  const current = levelWeight[env.logLevel] ?? levelWeight.info;
  const target = levelWeight[level] ?? levelWeight.info;
  return target <= current;
}

function toSerializableMeta(meta) {
  if (!meta) {
    return undefined;
  }

  if (meta instanceof Error) {
    return {
      name: meta.name,
      message: meta.message,
      stack: meta.stack,
    };
  }

  return meta;
}

async function writeLog(level, payload) {
  if (!env.logToFile) {
    return;
  }

  const line = `${JSON.stringify(payload)}\n`;
  const appLogPath = path.join(logDir, "app.log");
  await fs.promises.appendFile(appLogPath, line, "utf8");

  if (level === "error") {
    const errorLogPath = path.join(logDir, "error.log");
    await fs.promises.appendFile(errorLogPath, line, "utf8");
  }
}

function emit(level, message, meta) {
  if (!shouldLog(level)) {
    return;
  }

  const payload = {
    ts: new Date().toISOString(),
    level,
    message,
    meta: toSerializableMeta(meta),
  };

  const line = JSON.stringify(payload);
  if (level === "error") {
    // eslint-disable-next-line no-console
    console.error(line);
  } else {
    // eslint-disable-next-line no-console
    console.log(line);
  }

  writeLog(level, payload).catch(() => {
    // eslint-disable-next-line no-console
    console.error("{\"level\":\"error\",\"message\":\"Failed to write log file\"}");
  });
}

export const logger = {
  error: (message, meta) => emit("error", message, meta),
  warn: (message, meta) => emit("warn", message, meta),
  info: (message, meta) => emit("info", message, meta),
  debug: (message, meta) => emit("debug", message, meta),
};

export const requestLogger = (req, res, next) => {
  const start = process.hrtime.bigint();

  res.on("finish", () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1_000_000;
    logger.info("http_request", {
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: Number(durationMs.toFixed(2)),
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });
  });

  next();
};