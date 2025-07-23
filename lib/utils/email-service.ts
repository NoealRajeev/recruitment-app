/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/email-service.ts
import nodemailer from "nodemailer";
import { EmailTemplate } from "./email-templates";

// Type for email sending options
interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: Array<{
    filename: string;
    path: string;
    contentType?: string;
  }>;
}

// Create transporter instance
const transporter = nodemailer.createTransport({
  service: process.env.SMTP_SERVICE || "gmail",
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  from: process.env.SMTP_FROM,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: process.env.NODE_ENV === "production",
  },
});

// Verify connection configuration
transporter.verify((error) => {
  if (error) {
    console.error("SMTP connection error:", error);
  } else {
    console.log("SMTP server is ready to take our messages");
  }
});

/**
 * Send email with the provided options
 * @param options Email sending options
 * @returns Promise with message info or error
 */
export const sendEmail = async (options: EmailOptions): Promise<any> => {
  try {
    const mailOptions = {
      from: `"Findly" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      ...options,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Message sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

/**
 * Send email using a predefined template
 * @param template Email template object
 * @param to Recipient email address(es)
 * @param cc CC email address(es) (optional)
 * @param bcc BCC email address(es) (optional)
 * @param attachments Email attachments (optional)
 * @returns Promise with message info or error
 */
export const sendTemplateEmail = async (
  template: EmailTemplate,
  to: string | string[],
  cc?: string | string[],
  bcc?: string | string[],
  attachments?: Array<{
    filename: string;
    path: string;
    contentType?: string;
  }>
): Promise<any> => {
  return sendEmail({
    to,
    subject: template.subject,
    text: template.text,
    html: template.html,
    cc,
    bcc,
    attachments,
  });
};

/**
 * Send test email
 * @param to Recipient email address
 * @returns Promise with message info or error
 */
export const sendTestEmail = async (to: string): Promise<any> => {
  const testTemplate: EmailTemplate = {
    subject: "Findly SMTP Test Email",
    text: "This is a test email from Findly email service.",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
        <h2 style="color: #2C0053;">Findly SMTP Test</h2>
        <p>This email confirms that your Findly email service is working correctly.</p>
        <p style="color: #555; margin-top: 30px;">Best regards,<br/>Findly Team</p>
      </div>
    `,
  };

  return sendTemplateEmail(testTemplate, to);
};

/**
 * Send password reset email
 * @param email Recipient email address
 * @param resetUrl Password reset URL
 * @param userName User's name
 * @returns Promise with message info or error
 */
export const sendPasswordResetEmail = async (
  email: string,
  resetUrl: string,
  userName: string
): Promise<any> => {
  console.log("Sending password reset email to:", email);
  console.log("Reset URL:", resetUrl);
  console.log("User name:", userName);
  const resetTemplate: EmailTemplate = {
    subject: "Password Reset Request - Findly",
    text: `Hello ${userName},\n\nYou requested a password reset for your Findly account. Please click the following link to reset your password:\n\n${resetUrl}\n\nThis link will expire in 1 hour.\n\nIf you didn't request this password reset, please ignore this email.\n\nBest regards,\nFindly Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
        <h2 style="color: #2C0053;">Password Reset Request</h2>
        <p>Hello ${userName},</p>
        <p>You requested a password reset for your Findly account. Please click the button below to reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #2C0053; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a>
        </div>
        <p style="color: #666; font-size: 14px;">This link will expire in 1 hour.</p>
        <p style="color: #666; font-size: 14px;">If you didn't request this password reset, please ignore this email.</p>
        <p style="color: #555; margin-top: 30px;">Best regards,<br/>Findly Team</p>
      </div>
    `,
  };

  return sendTemplateEmail(resetTemplate, email);
};

export const emailService = {
  sendEmail,
  sendTemplateEmail,
  sendTestEmail,
  sendPasswordResetEmail,
  transporter,
};

export default emailService;
