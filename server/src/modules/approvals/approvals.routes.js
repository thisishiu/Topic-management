import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../config/prisma.js";
import { allowRoles, requireAuth } from "../../middlewares/auth.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendDepartmentDecisionEmail, sendLecturerDecisionEmail } from "../../services/mail.service.js";

export const approvalsRouter = Router();

const approvalSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
  note: z.string().optional(),
});

approvalsRouter.get(
  "/lecturer/pending",
  requireAuth,
  allowRoles("LECTURER"),
  asyncHandler(async (req, res) => {
    const approvals = await prisma.lecturerApproval.findMany({
      where: {
        lecturerId: req.user.sub,
        status: "PENDING",
      },
      include: {
        topic: {
          include: {
            members: { include: { student: { select: { fullName: true, studentCode: true } } } },
            createdBy: { select: { fullName: true, email: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(approvals);
  })
);

approvalsRouter.get(
  "/department/pending",
  requireAuth,
  allowRoles("DEPARTMENT_HEAD", "ADMIN"),
  asyncHandler(async (req, res) => {
    const topics = await prisma.topic.findMany({
      where: {
        status: "LECTURER_APPROVED",
      },
      include: {
        supervisor: { select: { fullName: true, email: true } },
        createdBy: { select: { fullName: true, email: true } },
      },
      orderBy: { updatedAt: "desc" },
    });
    res.json(topics);
  })
);

approvalsRouter.get(
  "/topic/:topicId",
  requireAuth,
  asyncHandler(async (req, res) => {
    const [lecturer, department] = await Promise.all([
      prisma.lecturerApproval.findMany({
        where: { topicId: req.params.topicId },
        include: { lecturer: { select: { fullName: true, email: true } } },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.departmentApproval.findMany({
        where: { topicId: req.params.topicId },
        include: { reviewer: { select: { fullName: true, email: true } } },
        orderBy: { updatedAt: "desc" },
      }),
    ]);

    res.json({ lecturer, department });
  })
);

approvalsRouter.post(
  "/lecturer/:topicId",
  requireAuth,
  allowRoles("LECTURER"),
  asyncHandler(async (req, res) => {
    const payload = approvalSchema.parse(req.body);

    const topic = await prisma.topic.findUnique({
      where: { id: req.params.topicId },
      include: {
        createdBy: { select: { fullName: true, email: true } },
      },
    });

    if (!topic) {
      throw { status: 404, message: "Topic not found" };
    }

    const approval = await prisma.lecturerApproval.upsert({
      where: {
        topicId_lecturerId: {
          topicId: req.params.topicId,
          lecturerId: req.user.sub,
        },
      },
      update: payload,
      create: {
        topicId: req.params.topicId,
        lecturerId: req.user.sub,
        ...payload,
      },
    });

    await prisma.topic.update({
      where: { id: req.params.topicId },
      data: {
        status: payload.status === "APPROVED" ? "LECTURER_APPROVED" : "LECTURER_REJECTED",
      },
    });

    if (topic.createdBy.email) {
      await sendLecturerDecisionEmail({
        to: topic.createdBy.email,
        fullName: topic.createdBy.fullName,
        topicTitle: topic.title,
        status: payload.status,
        note: payload.note,
      });
    }

    res.json(approval);
  })
);

approvalsRouter.post(
  "/department/:topicId",
  requireAuth,
  allowRoles("DEPARTMENT_HEAD", "ADMIN"),
  asyncHandler(async (req, res) => {
    const payload = z
      .object({
        status: z.enum(["APPROVED", "REJECTED"]),
        note: z.string().optional(),
        suggestedPanel: z.array(z.string()).optional(),
      })
      .parse(req.body);

    const topic = await prisma.topic.findUnique({
      where: { id: req.params.topicId },
      include: {
        createdBy: { select: { fullName: true, email: true } },
      },
    });

    if (!topic) {
      throw { status: 404, message: "Topic not found" };
    }

    const approval = await prisma.departmentApproval.upsert({
      where: {
        topicId_reviewerId: {
          topicId: req.params.topicId,
          reviewerId: req.user.sub,
        },
      },
      update: payload,
      create: {
        topicId: req.params.topicId,
        reviewerId: req.user.sub,
        ...payload,
      },
    });

    await prisma.topic.update({
      where: { id: req.params.topicId },
      data: { status: payload.status === "APPROVED" ? "DEPARTMENT_APPROVED" : "DEPARTMENT_REVIEW" },
    });

    if (topic.createdBy.email) {
      await sendDepartmentDecisionEmail({
        to: topic.createdBy.email,
        fullName: topic.createdBy.fullName,
        topicTitle: topic.title,
        status: payload.status,
        note: payload.note,
        suggestedPanel: payload.suggestedPanel,
      });
    }

    res.json(approval);
  })
);
