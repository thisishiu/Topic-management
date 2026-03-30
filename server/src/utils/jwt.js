import crypto from "crypto";
import jwt from "jsonwebtoken";
import dayjs from "dayjs";
import { env } from "../config/env.js";

export const signAccessToken = (payload) => jwt.sign(payload, env.jwtAccessSecret, { expiresIn: env.jwtAccessExpires });

export const signRefreshToken = (payload) => {
  const token = jwt.sign(payload, env.jwtRefreshSecret, { expiresIn: `${env.jwtRefreshExpiresDays}d` });
  const expiresAt = dayjs().add(env.jwtRefreshExpiresDays, "day").toDate();
  return { token, expiresAt };
};

export const verifyAccessToken = (token) => jwt.verify(token, env.jwtAccessSecret);

export const verifyRefreshToken = (token) => jwt.verify(token, env.jwtRefreshSecret);

export const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");
