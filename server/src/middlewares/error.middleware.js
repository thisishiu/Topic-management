import { logger } from "../utils/logger.js";

export const notFound = (req, res) => {
  logger.warn("route_not_found", {
    method: req.method,
    path: req.originalUrl,
  });
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
};

export const errorHandler = (err, req, res, next) => {
  void next;
  const status = err.status || 500;
  const message = err.message || "Internal server error";

  logger.error("request_error", {
    method: req.method,
    path: req.originalUrl,
    status,
    message,
    stack: err.stack,
  });

  res.status(status).json({ message });
};
