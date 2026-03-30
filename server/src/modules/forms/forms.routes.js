import { Router } from "express";
import { z } from "zod";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { prisma } from "../../config/prisma.js";
import { allowRoles, requireAuth } from "../../middlewares/auth.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const formsRouter = Router();

const scoreSchema = z.object({
  score: z.number().min(0).max(10),
  feedback: z.string().min(3),
  signatureUrl: z.string().optional(),
});

const pdfDir = path.join(process.cwd(), "uploads", "pdf");
fs.mkdirSync(pdfDir, { recursive: true });

formsRouter.post(
  "/:topicId/scores",
  requireAuth,
  allowRoles("LECTURER", "DEPARTMENT_HEAD", "ADMIN"),
  asyncHandler(async (req, res) => {
    const payload = scoreSchema.parse(req.body);
    const pdfName = `score-${req.params.topicId}-${Date.now()}.pdf`;
    const pdfPath = path.join(pdfDir, pdfName);

    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream(pdfPath));
    doc.fontSize(16).text("Topic Evaluation Form");
    doc.moveDown();
    doc.fontSize(12).text(`Topic ID: ${req.params.topicId}`);
    doc.text(`Score: ${payload.score}`);
    doc.text(`Feedback: ${payload.feedback}`);
    doc.text(`Signature: ${payload.signatureUrl || "N/A"}`);
    doc.end();

    const scoreForm = await prisma.scoreForm.create({
      data: {
        topicId: req.params.topicId,
        authorId: req.user.sub,
        score: payload.score,
        feedback: payload.feedback,
        signatureUrl: payload.signatureUrl,
        pdfUrl: `/uploads/pdf/${pdfName}`,
      },
    });

    res.status(201).json(scoreForm);
  })
);

formsRouter.get(
  "/:topicId/scores",
  requireAuth,
  asyncHandler(async (req, res) => {
    const scores = await prisma.scoreForm.findMany({
      where: { topicId: req.params.topicId },
      include: { author: { select: { fullName: true, role: true } } },
      orderBy: { createdAt: "desc" },
    });

    res.json(scores);
  })
);
