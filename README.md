# TopicFlow

Modular graduation-topic management platform using Express + React + Prisma + PostgreSQL.

## Stack

- Shared root package: dependencies and scripts for both server and client.
- Backend: Express REST API in `server/src/modules/*`.
- Frontend: React + Vite in `client/src/*`.
- Database: Prisma ORM with PostgreSQL.

## Setup

1. Copy `.env.example` to `.env` and update real values.
2. Run Prisma migration:

```bash
npm run prisma:migrate
```

3. Seed sample users and workflow data:

```bash
npm run prisma:seed
```

4. Start development:

```bash
npm run dev
```

## Main API groups

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/users`
- `GET/POST/PATCH /api/topics`
- `GET/POST /api/progress/:topicId/entries`
- `POST /api/approvals/lecturer/:topicId`
- `POST /api/approvals/department/:topicId`
- `GET/POST /api/forms/:topicId/scores`
- `GET/POST /api/uploads/:topicId/revision`
- `GET/POST /api/committees/:topicId`

## Seed Accounts

- admin@topicflow.edu (ADMIN)
- head@topicflow.edu (DEPARTMENT_HEAD)
- lecturer1@topicflow.edu (LECTURER)
- lecturer2@topicflow.edu (LECTURER)
- student1@topicflow.edu (STUDENT)
- student2@topicflow.edu (STUDENT)

Default password: Password123!

## SMTP Notifications

Set valid SMTP credentials in `.env` so these emails are sent automatically:

- Supervisor invitation when a student submits a topic with selected lecturer.
- Lecturer approval/rejection decision sent to student.
- Department approval/rejection decision sent to student.

## Session behavior

- Access token is stored in `sessionStorage` to survive page reload in same tab.
- Refresh token is in secure HttpOnly cookie.
- Silent refresh runs only if a session marker exists in current tab, preventing cross-tab session jump.
