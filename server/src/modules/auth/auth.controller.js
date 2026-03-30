import { z } from "zod";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { login, logout, refreshSession, register } from "./auth.service.js";

const registerSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(3),
  studentCode: z.string().optional(),
  password: z.string().min(6),
  role: z.enum(["STUDENT", "LECTURER", "DEPARTMENT_HEAD", "ADMIN"]).default("STUDENT"),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1).optional(),
});

const cookieConfig = {
  httpOnly: true,
  sameSite: "lax",
  secure: false,
};

export const registerHandler = asyncHandler(async (req, res) => {
  const payload = registerSchema.parse(req.body);
  const user = await register(payload);
  res.status(201).json({ user });
});

export const loginHandler = asyncHandler(async (req, res) => {
  const payload = loginSchema.parse(req.body);
  const result = await login(payload);

  res.cookie("refresh_token", result.refreshToken, cookieConfig);
  res.json({ accessToken: result.accessToken, refreshToken: result.refreshToken, user: result.user });
});

export const refreshHandler = asyncHandler(async (req, res) => {
  const payload = refreshSchema.parse(req.body || {});
  const token = payload.refreshToken || req.cookies.refresh_token;
  if (!token) {
    return res.status(401).json({ message: "Missing refresh token" });
  }

  const result = await refreshSession(token);
  res.cookie("refresh_token", result.refreshToken, cookieConfig);
  return res.json({ accessToken: result.accessToken, refreshToken: result.refreshToken, user: result.user });
});

export const logoutHandler = asyncHandler(async (req, res) => {
  const payload = refreshSchema.parse(req.body || {});
  await logout(payload.refreshToken || req.cookies.refresh_token);
  res.clearCookie("refresh_token", cookieConfig);
  res.status(204).send();
});
