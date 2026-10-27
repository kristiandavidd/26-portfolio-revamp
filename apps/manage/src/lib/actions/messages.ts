"use server";

import { prisma } from "@repo/db";
import { isEchoConfigured, sendEmail } from "@repo/integrations";
import { requireSession } from "@/lib/auth";
import { errorMessage, fail, finish, text } from "@/lib/forms";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const STATUSES = new Set(["new", "read", "replied", "archived"]);

export async function updateMessageStatus(formData: FormData) {
  await requireSession();

  const id = text(formData, "id");
  const status = text(formData, "status", "new");
  if (!STATUSES.has(status)) {
    await fail(formData, "Unknown message status.");
  }

  try {
    await prisma.contactMessage.update({ where: { id }, data: { status } });
  } catch (error) {
    await fail(formData, errorMessage(error));
  }

  await finish(formData, "Message updated.");
}

export async function replyToMessage(formData: FormData) {
  await requireSession();

  const id = text(formData, "id");
  const subject = text(formData, "subject");
  const body = text(formData, "body");

  if (!subject || !body) {
    await fail(formData, "A reply needs a subject and a body.");
  }

  const message = await prisma.contactMessage.findUnique({ where: { id } });
  if (!message) {
    return fail(formData, "That message no longer exists.");
  }

  if (!isEchoConfigured()) {
    return fail(
      formData,
      "Echo is not configured. Set ECHO_API_URL and ECHO_API_KEY.",
    );
  }

  try {
    const html = `<div style="font-family:system-ui,sans-serif;line-height:1.6">${escapeHtml(
      body,
    ).replace(/\n/g, "<br />")}</div>`;

    await sendEmail({
      to: message.email,
      subject,
      html,
      from: process.env.ECHO_FROM_EMAIL || undefined,
    });
    await prisma.$transaction([
      prisma.emailLog.create({
        data: {
          contactMessageId: message.id,
          kind: "reply",
          toEmail: message.email,
          subject,
          status: "sent",
        },
      }),
      prisma.contactMessage.update({
        where: { id: message.id },
        data: { status: "replied" },
      }),
    ]);
  } catch (error) {
    await fail(formData, errorMessage(error));
  }

  await finish(formData, "Reply sent through Echo.");
}

export async function sendTestEmail(formData: FormData) {
  await requireSession();

  const to = text(formData, "to");
  const subject = text(formData, "subject", "Echo test");
  const body = text(formData, "body", "This is a test from the content panel.");

  if (!to) {
    await fail(formData, "A recipient is required.");
  }

  if (!isEchoConfigured()) {
    return fail(
      formData,
      "Echo is not configured. Set ECHO_API_URL and ECHO_API_KEY.",
    );
  }

  try {
    await sendEmail({
      to,
      subject,
      html: `<div style="font-family:system-ui,sans-serif;line-height:1.6">${escapeHtml(
        body,
      ).replace(/\n/g, "<br />")}</div>`,
      from: process.env.ECHO_FROM_EMAIL || undefined,
    });

    await prisma.emailLog.create({
      data: { kind: "test", toEmail: to, subject, status: "sent" },
    });
  } catch (error) {
    await fail(formData, errorMessage(error));
  }

  await finish(formData, "Test email sent through Echo.");
}
