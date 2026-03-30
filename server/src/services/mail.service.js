import nodemailer from "nodemailer";
import { env } from "../config/env.js";

const hasSmtpConfig = Boolean(env.smtpEnabled && env.smtpHost && env.smtpUser && env.smtpPass && env.smtpFrom);

const transporter = hasSmtpConfig
  ? nodemailer.createTransport({
      host: env.smtpHost,
      port: env.smtpPort,
      secure: env.smtpPort === 465,
      auth: {
        user: env.smtpUser,
        pass: env.smtpPass,
      },
    })
  : null;

const sendMail = async ({ to, subject, html }) => {
  if (!transporter) {
    return;
  }

  try {
    await transporter.sendMail({
      from: env.smtpFrom,
      to,
      subject,
      html,
    });
  } catch (error) {
    // Notification failure should not block approval workflow.
    // eslint-disable-next-line no-console
    console.warn("Email send failed:", error.message);
  }
};

export const sendLecturerDecisionEmail = async ({ to, fullName, topicTitle, status, note }) => {
  const decisionText = status === "APPROVED" ? "approved" : "rejected";
  await sendMail({
    to,
    subject: `Lecturer ${decisionText} your topic proposal`,
    html: `
      <h2>Topic Review Update</h2>
      <p>Hello ${fullName},</p>
      <p>Your topic <strong>${topicTitle}</strong> was ${decisionText} by the selected lecturer.</p>
      <p>Note: ${note || "No additional note"}</p>
      <p>Please login to TopicFlow to see details.</p>
    `,
  });
};

export const sendDepartmentDecisionEmail = async ({ to, fullName, topicTitle, status, note, suggestedPanel }) => {
  const decisionText = status === "APPROVED" ? "approved" : "rejected";
  const panelText = suggestedPanel?.length ? suggestedPanel.join(", ") : "N/A";
  await sendMail({
    to,
    subject: `Department ${decisionText} your topic`,
    html: `
      <h2>Department Decision</h2>
      <p>Hello ${fullName},</p>
      <p>Your topic <strong>${topicTitle}</strong> was ${decisionText} by department reviewers.</p>
      <p>Note: ${note || "No additional note"}</p>
      <p>Suggested panel/reviewer list: ${panelText}</p>
      <p>Please login to TopicFlow for next actions.</p>
    `,
  });
};

export const sendSupervisorInvitationEmail = async ({ to, lecturerName, topicTitle, studentName }) => {
  await sendMail({
    to,
    subject: "New supervision request for topic review",
    html: `
      <h2>New Topic Supervision Request</h2>
      <p>Hello ${lecturerName},</p>
      <p>Student ${studentName} submitted a topic and selected you as supervisor.</p>
      <p>Topic title: <strong>${topicTitle}</strong></p>
      <p>Please login to TopicFlow to approve or reject this request.</p>
    `,
  });
};
