import bcrypt from "bcryptjs";
import { prisma } from "../../config/prisma.js";
import { hashToken, signAccessToken, signRefreshToken, verifyRefreshToken } from "../../utils/jwt.js";

const sanitizeUser = (user) => ({
  id: user.id,
  email: user.email,
  fullName: user.fullName,
  studentCode: user.studentCode,
  role: user.role,
});

export const register = async ({ email, fullName, studentCode, password, role }) => {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw { status: 400, message: "Email already exists" };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      fullName,
      studentCode,
      passwordHash,
      role,
    },
  });

  return sanitizeUser(user);
};

export const login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw { status: 401, message: "Invalid credentials" };
  }

  const matched = await bcrypt.compare(password, user.passwordHash);
  if (!matched) {
    throw { status: 401, message: "Invalid credentials" };
  }

  const payload = { sub: user.id, role: user.role, email: user.email };
  const accessToken = signAccessToken(payload);
  const refresh = signRefreshToken(payload);

  await prisma.refreshToken.create({
    data: {
      tokenHash: hashToken(refresh.token),
      userId: user.id,
      expiresAt: refresh.expiresAt,
    },
  });

  return {
    accessToken,
    refreshToken: refresh.token,
    user: sanitizeUser(user),
  };
};

export const refreshSession = async (refreshToken) => {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw { status: 401, message: "Invalid refresh token" };
  }

  const tokenHash = hashToken(refreshToken);
  const session = await prisma.refreshToken.findFirst({
    where: {
      tokenHash,
      userId: payload.sub,
      expiresAt: { gt: new Date() },
    },
    include: { user: true },
  });

  if (!session) {
    throw { status: 401, message: "Refresh session expired" };
  }

  const nextPayload = { sub: session.user.id, role: session.user.role, email: session.user.email };
  const accessToken = signAccessToken(nextPayload);
  const nextRefresh = signRefreshToken(nextPayload);

  await prisma.refreshToken.update({
    where: { id: session.id },
    data: {
      tokenHash: hashToken(nextRefresh.token),
      expiresAt: nextRefresh.expiresAt,
    },
  });

  return {
    accessToken,
    refreshToken: nextRefresh.token,
    user: sanitizeUser(session.user),
  };
};

export const logout = async (refreshToken) => {
  if (!refreshToken) {
    return;
  }

  const tokenHash = hashToken(refreshToken);
  await prisma.refreshToken.deleteMany({ where: { tokenHash } });
};
