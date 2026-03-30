import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../config/prisma.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const progressRouter = Router();

const progressSchema = z.object({
  title: z.string().min(3),
  details: z.string().min(5),
  progress: z.number().min(0).max(100),
});

progressRouter.post(
  "/:topicId/entries",
  requireAuth,
  asyncHandler(async (req, res) => {
    const payload = progressSchema.parse(req.body);
    const entry = await prisma.topicProgress.create({
      data: {
        topicId: req.params.topicId,
        authorId: req.user.sub,
        ...payload,
      },
    });
    res.status(201).json(entry);
  })
);

progressRouter.get(
  "/:topicId/entries",
  requireAuth,
  asyncHandler(async (req, res) => {
    const entries = await prisma.topicProgress.findMany({
      where: { topicId: req.params.topicId },
      include: { author: { select: { fullName: true, role: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json(entries);
  })
);
