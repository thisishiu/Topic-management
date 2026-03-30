import { Router } from "express";
import { prisma } from "../../config/prisma.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const usersRouter = Router();

usersRouter.get(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const role = req.query.role;
    const users = await prisma.user.findMany({
      where: role ? { role } : undefined,
      select: { id: true, fullName: true, email: true, role: true, studentCode: true },
      orderBy: { createdAt: "desc" },
    });

    res.json(users);
  })
);
