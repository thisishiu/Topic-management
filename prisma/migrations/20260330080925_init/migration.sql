-- CreateEnum
CREATE TYPE "Role" AS ENUM ('STUDENT', 'LECTURER', 'DEPARTMENT_HEAD', 'ADMIN');

-- CreateEnum
CREATE TYPE "TopicStatus" AS ENUM ('PENDING_LECTURER', 'LECTURER_REJECTED', 'LECTURER_APPROVED', 'DEPARTMENT_REVIEW', 'DEPARTMENT_APPROVED', 'IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "studentCode" TEXT,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'STUDENT',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Topic" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "proposalFileUrl" TEXT,
    "fields" TEXT[],
    "status" "TopicStatus" NOT NULL DEFAULT 'PENDING_LECTURER',
    "createdById" TEXT NOT NULL,
    "supervisorId" TEXT,
    "reviewerLecturerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TopicMember" (
    "id" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "studentCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TopicMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TopicProgress" (
    "id" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "progress" INTEGER NOT NULL,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TopicProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LecturerApproval" (
    "id" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "lecturerId" TEXT NOT NULL,
    "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LecturerApproval_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DepartmentApproval" (
    "id" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "note" TEXT,
    "suggestedPanel" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DepartmentApproval_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScoreForm" (
    "id" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "feedback" TEXT NOT NULL,
    "signatureUrl" TEXT,
    "pdfUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScoreForm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UploadedRevision" (
    "id" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UploadedRevision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommitteeAssignment" (
    "id" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "lecturerId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommitteeAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TopicMember_topicId_studentId_key" ON "TopicMember"("topicId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "LecturerApproval_topicId_lecturerId_key" ON "LecturerApproval"("topicId", "lecturerId");

-- CreateIndex
CREATE UNIQUE INDEX "DepartmentApproval_topicId_reviewerId_key" ON "DepartmentApproval"("topicId", "reviewerId");

-- CreateIndex
CREATE UNIQUE INDEX "CommitteeAssignment_topicId_lecturerId_role_key" ON "CommitteeAssignment"("topicId", "lecturerId", "role");

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopicMember" ADD CONSTRAINT "TopicMember_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopicMember" ADD CONSTRAINT "TopicMember_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopicProgress" ADD CONSTRAINT "TopicProgress_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopicProgress" ADD CONSTRAINT "TopicProgress_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LecturerApproval" ADD CONSTRAINT "LecturerApproval_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LecturerApproval" ADD CONSTRAINT "LecturerApproval_lecturerId_fkey" FOREIGN KEY ("lecturerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DepartmentApproval" ADD CONSTRAINT "DepartmentApproval_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DepartmentApproval" ADD CONSTRAINT "DepartmentApproval_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScoreForm" ADD CONSTRAINT "ScoreForm_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScoreForm" ADD CONSTRAINT "ScoreForm_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UploadedRevision" ADD CONSTRAINT "UploadedRevision_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UploadedRevision" ADD CONSTRAINT "UploadedRevision_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommitteeAssignment" ADD CONSTRAINT "CommitteeAssignment_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommitteeAssignment" ADD CONSTRAINT "CommitteeAssignment_lecturerId_fkey" FOREIGN KEY ("lecturerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
