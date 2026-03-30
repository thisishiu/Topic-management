import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../config/prisma.js";
import { allowRoles, requireAuth } from "../../middlewares/auth.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const committeesRouter = Router();

committeesRouter.post(
  "/:topicId",
  requireAuth,
  allowRoles("DEPARTMENT_HEAD", "ADMIN"),
  asyncHandler(async (req, res) => {
    const payload = z
      .array(
        z.object({
          lecturerId: z.string(),
          role: z.string().min(3),
        })
      )
      .parse(req.body);

    await prisma.committeeAssignment.deleteMany({ where: { topicId: req.params.topicId } });
    const created = await prisma.committeeAssignment.createMany({
      data: payload.map((item) => ({
        topicId: req.params.topicId,
        lecturerId: item.lecturerId,
        role: item.role,
      })),
    });

    res.status(201).json({ count: created.count });
  })
);

committeesRouter.get(
  "/:topicId",
  requireAuth,
  asyncHandler(async (req, res) => {
    const committee = await prisma.committeeAssignment.findMany({
      where: { topicId: req.params.topicId },
      include: { lecturer: { select: { fullName: true, email: true } } },
      orderBy: { createdAt: "asc" },
    });

    res.json(committee);
  })
);
