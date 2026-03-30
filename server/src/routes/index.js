import { Router } from "express";
import { authRouter } from "../modules/auth/auth.routes.js";
import { usersRouter } from "../modules/users/users.routes.js";
import { topicsRouter } from "../modules/topics/topics.routes.js";
import { progressRouter } from "../modules/progress/progress.routes.js";
import { approvalsRouter } from "../modules/approvals/approvals.routes.js";
import { formsRouter } from "../modules/forms/forms.routes.js";
import { uploadsRouter } from "../modules/uploads/uploads.routes.js";
import { committeesRouter } from "../modules/committees/committees.routes.js";

export const appRouter = Router();

appRouter.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

appRouter.use("/auth", authRouter);
appRouter.use("/users", usersRouter);
appRouter.use("/topics", topicsRouter);
appRouter.use("/progress", progressRouter);
appRouter.use("/approvals", approvalsRouter);
appRouter.use("/forms", formsRouter);
appRouter.use("/uploads", uploadsRouter);
appRouter.use("/committees", committeesRouter);
