// lib/notifications.ts
import { Resend } from "resend";
import { log } from "./logger";

const resend = new Resend(process.env.RESEND_API_KEY);

type EmailParams = {
  to: string;
  subject: string;
  template: string;
  data: Record<string, unknown>;
};

export async function sendEmailNotification(params: EmailParams) {
  try {
    // Get template based on params.template
    const template = await getEmailTemplate(params.template, params.data);

    const { error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || "no-reply@yourdomain.com",
      to: params.to,
      subject: params.subject,
      html: template,
    });

    if (error) {
      throw new Error(error.message);
    }
  } catch (error) {
    log.error("Email sending failed", {
      error: error instanceof Error ? error.message : "Unknown email error",
      recipient: params.to,
    });
    throw error;
  }
}

async function getEmailTemplate(templateName: string, data: any) {
  // Implement your template rendering logic here
  // Could use React email, Handlebars, or other templating
  switch (templateName) {
    case "company-status-update":
      return `
        <div>
          <h1>Company Status Update</h1>
          <p>Dear Client,</p>
          <p>The status of your company <strong>${data.companyName}</strong> has been updated to <strong>${data.newStatus}</strong>.</p>
          <p><strong>Reason:</strong> ${data.reason}</p>
          <p>If you have any questions, please contact ${data.contactEmail}.</p>
        </div>
      `;
    default:
      throw new Error(`Unknown template: ${templateName}`);
  }
}
