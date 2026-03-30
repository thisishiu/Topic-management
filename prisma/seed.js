import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const passwordHash = await bcrypt.hash("Password123!", 10);

async function upsertUser({ email, fullName, role, studentCode }) {
  return prisma.user.upsert({
    where: { email },
    update: {
      fullName,
      role,
      studentCode,
      passwordHash,
      active: true,
    },
    create: {
      email,
      fullName,
      role,
      studentCode,
      passwordHash,
      active: true,
    },
  });
}

async function main() {
  const admin = await upsertUser({
    email: "admin@topicflow.edu",
    fullName: "Admin User",
    role: "ADMIN",
  });

  const departmentHead = await upsertUser({
    email: "head@topicflow.edu",
    fullName: "Department Head",
    role: "DEPARTMENT_HEAD",
  });

  const lecturerSeedInput = [
    { email: "thiennd@hcmute.edu.vn", major: "QLCN" },
    { email: "thiennd@hcmute.edu.vn", major: "QLCN" },
    { email: "thiennd@hcmute.edu.vn", major: "QLCN" },
    { email: "thienise@gmail.com", major: "QLCN" },
    { email: "thiennd@hcmute.edu.vn", major: "ECom" },
    { email: "thienise@gmail.com", major: "QLCN" },
    { email: "thienise@gmail.com", major: "QLCN" },
    { email: "ise.thien@gmail.com", major: "QLCN" },
    { email: "ise.thien@gmail.com", major: "QLCN" },
    { email: "ise.thien@gmail.com", major: "Logistics" },
    { email: "ise.thien@gmail.com", major: "Logistics" },
  ];

  const majorsByEmail = lecturerSeedInput.reduce((acc, item) => {
    if (!acc[item.email]) {
      acc[item.email] = new Set();
    }
    acc[item.email].add(item.major);
    return acc;
  }, {});

  const lecturerAccounts = [];
  for (const [email, majorSet] of Object.entries(majorsByEmail)) {
    const baseName = email.split("@")[0];
    const majorText = Array.from(majorSet).join(", ");
    const fullName = `${baseName} (${majorText})`;

    const lecturer = await upsertUser({
      email,
      fullName,
      role: "LECTURER",
    });

    lecturerAccounts.push(lecturer);
  }

  if (lecturerAccounts.length < 2) {
    throw new Error("Seed requires at least 2 lecturers to create committee assignments.");
  }

  const [lecturer1, lecturer2] = lecturerAccounts;

  const student1 = await upsertUser({
    email: "student1@topicflow.edu",
    fullName: "John Student",
    role: "STUDENT",
    studentCode: "S230001",
  });

  const student2 = await upsertUser({
    email: "student2@topicflow.edu",
    fullName: "Emma Student",
    role: "STUDENT",
    studentCode: "S230002",
  });

  await prisma.topic.deleteMany({});

  const topic = await prisma.topic.create({
    data: {
      title: "AI-assisted Thesis Review Workflow",
      description: "Build an end-to-end workflow for proposal review, progress tracking, and committee governance.",
      fields: ["AI", "Software Engineering", "Workflow"],
      proposalFileUrl: "https://example.com/proposal.pdf",
      status: "PENDING_LECTURER",
      createdById: student1.id,
      supervisorId: lecturer1.id,
      members: {
        create: [
          { studentId: student1.id, studentCode: student1.studentCode },
          { studentId: student2.id, studentCode: student2.studentCode },
        ],
      },
      lecturerApprovals: {
        create: {
          lecturerId: lecturer1.id,
          status: "PENDING",
        },
      },
      progresses: {
        create: [
          {
            title: "Requirement Draft",
            details: "Initial requirement set completed and shared with supervisor.",
            progress: 20,
            authorId: student1.id,
          },
        ],
      },
    },
  });

  await prisma.departmentApproval.upsert({
    where: {
      topicId_reviewerId: {
        topicId: topic.id,
        reviewerId: departmentHead.id,
      },
    },
    update: {
      status: "PENDING",
      note: "Awaiting lecturer approval before department review.",
      suggestedPanel: [lecturer2.fullName],
    },
    create: {
      topicId: topic.id,
      reviewerId: departmentHead.id,
      status: "PENDING",
      note: "Awaiting lecturer approval before department review.",
      suggestedPanel: [lecturer2.fullName],
    },
  });

  await prisma.committeeAssignment.createMany({
    data: [
      { topicId: topic.id, lecturerId: lecturer1.id, role: "Supervisor" },
      { topicId: topic.id, lecturerId: lecturer2.id, role: "Reviewer" },
    ],
    skipDuplicates: true,
  });

  console.log("Seed completed successfully.");
  console.log("Default password for all seeded users: Password123!");
  console.log({
    admin: admin.email,
    departmentHead: departmentHead.email,
    lecturers: lecturerAccounts.map((item) => item.email),
    student: student1.email,
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
