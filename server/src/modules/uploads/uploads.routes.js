import { Router } from "express";
import fs from "fs";
import path from "path";
import multer from "multer";
import { prisma } from "../../config/prisma.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const uploadsRouter = Router();

const uploadDir = path.join(process.cwd(), "uploads", "revisions");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`);
  },
});

const upload = multer({ storage });

uploadsRouter.post(
  "/:topicId/revision",
  requireAuth,
  upload.single("file"),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "Missing file" });
    }

    const revision = await prisma.uploadedRevision.create({
      data: {
        topicId: req.params.topicId,
        authorId: req.user.sub,
        fileUrl: `/uploads/revisions/${req.file.filename}`,
        note: req.body.note,
      },
    });

    res.status(201).json(revision);
  })
);

uploadsRouter.get(
  "/:topicId/revision",
  requireAuth,
  asyncHandler(async (req, res) => {
    const revisions = await prisma.uploadedRevision.findMany({
      where: { topicId: req.params.topicId },
      include: { author: { select: { fullName: true, role: true } } },
      orderBy: { createdAt: "desc" },
    });

    res.json(revisions);
  })
);
