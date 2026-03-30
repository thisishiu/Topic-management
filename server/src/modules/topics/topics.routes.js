import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../config/prisma.js";
import { allowRoles, requireAuth } from "../../middlewares/auth.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendSupervisorInvitationEmail } from "../../services/mail.service.js";

export const topicsRouter = Router();

const createTopicSchema = z.object({
  title: z.string().min(5),
  description: z.string().min(10),
  proposalFileUrl: z.string().optional(),
  fields: z.array(z.string()).min(1),
  supervisorId: z.string().optional(),
  memberStudentCodes: z.array(z.string()).min(1).max(2),
});

topicsRouter.post(
  "/",
  requireAuth,
  allowRoles("STUDENT"),
  asyncHandler(async (req, res) => {
    const payload = createTopicSchema.parse(req.body);
    const students = await prisma.user.findMany({ where: { studentCode: { in: payload.memberStudentCodes } } });

    if (students.length !== payload.memberStudentCodes.length) {
      throw { status: 400, message: "Some student codes are invalid" };
    }

    const topic = await prisma.topic.create({
      data: {
        title: payload.title,
        description: payload.description,
        proposalFileUrl: payload.proposalFileUrl,
        fields: payload.fields,
        createdById: req.user.sub,
        supervisorId: payload.supervisorId,
        members: {
          create: students.map((student) => ({ studentId: student.id, studentCode: student.studentCode || "N/A" })),
        },
        lecturerApprovals: payload.supervisorId
          ? {
              create: {
                lecturerId: payload.supervisorId,
              },
            }
          : undefined,
      },
      include: {
        members: true,
        supervisor: { select: { id: true, fullName: true, email: true } },
        createdBy: { select: { fullName: true } },
      },
    });

    if (topic.supervisor?.email) {
      await sendSupervisorInvitationEmail({
        to: topic.supervisor.email,
        lecturerName: topic.supervisor.fullName,
        topicTitle: topic.title,
        studentName: topic.createdBy.fullName,
      });
    }

    res.status(201).json(topic);
  })
);

topicsRouter.get(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const topics = await prisma.topic.findMany({
      include: {
        members: { include: { student: { select: { id: true, fullName: true, studentCode: true } } } },
        supervisor: { select: { id: true, fullName: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(topics);
  })
);

topicsRouter.patch(
  "/:topicId",
  requireAuth,
  allowRoles("LECTURER", "DEPARTMENT_HEAD", "ADMIN"),
  asyncHandler(async (req, res) => {
    const topic = await prisma.topic.update({
      where: { id: req.params.topicId },
      data: {
        title: req.body.title,
        status: req.body.status,
        reviewerLecturerId: req.body.reviewerLecturerId,
      },
    });

    res.json(topic);
  })
);
