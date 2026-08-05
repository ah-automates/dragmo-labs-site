import { Resend } from "resend";

import { siteConfig } from "@/lib/data";
import type { ContactFormValues } from "@/lib/contact-schema";

const ACCENT = "#1e7bff";

/**
 * Built lazily so a missing key surfaces as a handled send failure in the route
 * rather than a crash while the module graph is still loading.
 */
function getClient(): Resend | null {
  const key = process.env.RESEND_API;
  return key ? new Resend(key) : null;
}

export function isEmailConfigured(): boolean {
  return Boolean(
    process.env.RESEND_API &&
      process.env.CONTACT_TO_EMAIL &&
      process.env.CONTACT_FROM_EMAIL,
  );
}

/** Names and messages are free text, so every interpolation has to be escaped. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Preserves the sender's paragraph breaks without allowing any other markup. */
function toHtmlParagraphs(value: string): string {
  return escapeHtml(value).replace(/\r?\n/g, "<br />");
}

type Row = { label: string; value: string };

/**
 * The homepage renders the compact variant, which has no interest or budget
 * field, so those arrive empty and must not print as bare labels.
 */
function buildRows(values: ContactFormValues): Row[] {
  return (
    [
      { label: "Name", value: values.name },
      { label: "Company", value: values.company },
      { label: "Email", value: values.email },
      { label: "Phone", value: values.phone },
      { label: "Interest", value: values.interest },
      { label: "Budget", value: values.budget },
    ] satisfies Row[]
  ).filter((row) => row.value.trim() !== "");
}

function notificationText(values: ContactFormValues): string {
  const width = 9;
  const rows = buildRows(values)
    .map((row) => `${(row.label + ":").padEnd(width)}${row.value}`)
    .join("\n");

  return `${rows}\n${"-".repeat(46)}\n${values.message}\n`;
}

function notificationHtml(values: ContactFormValues): string {
  const rows = buildRows(values)
    .map(
      (row) => `
        <tr>
          <td style="padding:6px 16px 6px 0;color:#6b7280;font-size:13px;white-space:nowrap;vertical-align:top;">${escapeHtml(row.label)}</td>
          <td style="padding:6px 0;color:#111827;font-size:14px;">${escapeHtml(row.value)}</td>
        </tr>`,
    )
    .join("");

  return shell(`
    <h1 style="margin:0 0 4px;font-size:18px;font-weight:700;color:#111827;">New enquiry</h1>
    <p style="margin:0 0 20px;font-size:13px;color:#6b7280;">Reply to this email to respond to ${escapeHtml(values.name)} directly.</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">${rows}</table>
    <div style="margin:20px 0;border-top:1px solid #e5e7eb;"></div>
    <div style="font-size:14px;line-height:1.6;color:#111827;">${toHtmlParagraphs(values.message)}</div>
  `);
}

function autoReplyHtml(values: ContactFormValues): string {
  return shell(`
    <h1 style="margin:0 0 16px;font-size:18px;font-weight:700;color:#111827;">Thanks for reaching out</h1>
    <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#374151;">Hi ${escapeHtml(values.name.split(" ")[0] || values.name)},</p>
    <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#374151;">
      We have your message. A senior strategist will review your details and reply
      within one business day.
    </p>
    <div style="margin:20px 0;border-top:1px solid #e5e7eb;"></div>
    <p style="margin:0 0 8px;font-size:12px;color:#6b7280;">For reference, this is what you sent:</p>
    <div style="font-size:13px;line-height:1.6;color:#6b7280;">${toHtmlParagraphs(values.message)}</div>
  `);
}

function autoReplyText(values: ContactFormValues): string {
  return [
    `Hi ${values.name.split(" ")[0] || values.name},`,
    "",
    "We have your message. A senior strategist will review your details and reply within one business day.",
    "",
    "For reference, this is what you sent:",
    "",
    values.message,
    "",
    `- ${siteConfig.name}`,
    siteConfig.url,
    "",
  ].join("\n");
}

/** Shared wrapper. Inline styles and tables only, for mail client support. */
function shell(body: string): string {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:24px;background:#f4f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;width:100%;border-collapse:collapse;background:#ffffff;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;">
      <tr><td style="height:3px;background:${ACCENT};font-size:0;line-height:0;">&nbsp;</td></tr>
      <tr><td style="padding:28px 32px;">${body}</td></tr>
      <tr>
        <td style="padding:16px 32px;border-top:1px solid #e5e7eb;background:#fafafa;font-size:12px;color:#9ca3af;">
          ${escapeHtml(siteConfig.name)} &middot; ${escapeHtml(siteConfig.tagline)}
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

/**
 * Resend reports API errors in the response body rather than throwing, so the
 * result has to be inspected explicitly or failures pass silently.
 */
async function send(payload: {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo: string;
}): Promise<void> {
  const client = getClient();
  const from = process.env.CONTACT_FROM_EMAIL;

  if (!client || !from) {
    throw new Error("Email is not configured.");
  }

  const { error } = await client.emails.send({ from, ...payload });

  if (error) {
    throw new Error(`${error.name}: ${error.message}`);
  }
}

/** Goes to the team inbox. Reply-To is the sender, so Reply reaches the lead. */
export async function sendContactNotification(
  values: ContactFormValues,
): Promise<void> {
  const to = process.env.CONTACT_TO_EMAIL;
  if (!to) throw new Error("CONTACT_TO_EMAIL is not set.");

  await send({
    to,
    subject: `[${siteConfig.name}] New enquiry — ${values.name}`,
    html: notificationHtml(values),
    text: notificationText(values),
    replyTo: values.email,
  });
}

/** Confirmation to the person who submitted, mirroring the on-site copy. */
export async function sendContactAutoReply(
  values: ContactFormValues,
): Promise<void> {
  await send({
    to: values.email,
    subject: `Thanks for reaching out to ${siteConfig.name}`,
    html: autoReplyHtml(values),
    text: autoReplyText(values),
    replyTo: siteConfig.email,
  });
}
