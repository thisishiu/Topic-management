import dotenv from "dotenv";

dotenv.config();

// const clientUrlsRaw = process.env.CLIENT_URLS || process.env.CLIENT_URL || "";
const clientUrls = [
  "http://localhost:5173",
  "https://main.d1savvtfphnnz5.amplifyapp.com",
  "https://d2l4od5b2m6u5x.cloudfront.net"
];

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 5000),
  clientUrl: process.env.CLIENT_URL,
  clientUrls,
  logLevel: (process.env.LOG_LEVEL || "info").toLowerCase(),
  logToFile:
    String(process.env.LOG_TO_FILE || (process.env.NODE_ENV === "production" ? "true" : "false")).toLowerCase() ===
    "true",
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  jwtAccessExpires: process.env.JWT_ACCESS_EXPIRES || "15m",
  jwtRefreshExpiresDays: Number(process.env.JWT_REFRESH_EXPIRES_DAYS || 14),
  smtpEnabled: String(process.env.SMTP_ENABLED || "false").toLowerCase() === "true",
  smtpHost: process.env.SMTP_HOST,
  smtpPort: Number(process.env.SMTP_PORT || 587),
  smtpUser: process.env.SMTP_USER,
  smtpPass: process.env.SMTP_PASS,
  smtpFrom: process.env.SMTP_FROM,
};
