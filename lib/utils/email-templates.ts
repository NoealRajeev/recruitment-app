import { publicEnv } from "../env.public";
import { env } from "../env.server";

// lib/email-templates.ts
export interface EmailTemplate {
  subject: string;
  text: string;
  html: string;
}

// Base styles for consistent email design
const baseEmailStyles = {
  fontFamily: "Arial, sans-serif",
  maxWidth: "600px",
  margin: "auto",
  padding: "20px",
  backgroundColor: "#ffffff",
  borderRadius: "8px",
  border: "1px solid #eee",
  color: "#333333",
};

const primaryColor = "#2C0053";
const secondaryColor = "#635372";
// const accentColor = "#ff6b35";
const lightBackground = "#f8f9fa";
const warningBackground = "#fff8e1";
const infoBackground = "#f0f8ff";

const headerTemplate = (title: string) => `
  <div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid ${primaryColor}; padding-bottom: 15px;">
    <img src="${env.NEXTAUTH_URL}/logo.png" alt="Findly Logo" style="max-height: 60px;">
    <h1 style="color: ${primaryColor}; margin-top: 10px; margin-bottom: 5px;">${title}</h1>
  </div>
`;

const footerTemplate = `
  <div style="border-top: 1px solid #eee; margin-top: 30px; padding-top: 20px; text-align: center;">
    <p style="color: ${primaryColor}; font-weight: bold; margin-bottom: 5px;">Best regards,</p>
    <p style="color: ${secondaryColor}; margin-top: 0;">The Findly Team</p>
    <img src="${env.NEXTAUTH_URL}/logo-small.png" alt="Findly Logo" style="max-height: 40px; margin-top: 20px;">
  </div>
`;

const actionButton = (text: string, url: string) => `
  <a href="${url}" 
     style="display: inline-block; padding: 12px 24px; 
            background-color: ${primaryColor}; color: white; 
            text-decoration: none; border-radius: 4px; 
            margin: 10px 0; font-weight: bold;">
    ${text}
  </a>
`;

// Document list for agency registration
const requiredDocumentsList = `
<ul style="padding-left: 20px; line-height: 1.6;">
  <li><strong>Business License</strong> - Copy of your agency's business registration/license</li>
  <li><strong>Insurance Certificate</strong> - Proof of professional liability insurance</li>
  <li><strong>ID Proof</strong> - Government-issued ID of primary contact</li>
  <li><strong>Address Proof</strong> - Utility bill or bank statement showing business address</li>
  <li><strong>Other Supporting Documents</strong> - Any additional certifications or permits</li>
</ul>
`;

export const getOtpEmailTemplate = (otp: string): EmailTemplate => ({
  subject: "Your One-Time Password (OTP) for Findly",
  text: `Hello,
  
Your One-Time Password (OTP) for verifying your email on Findly is: ${otp}

This code is valid for 5 minutes. If you did not request this, please ignore this email.

Thank you,
The Findly Team`,

  html: `
<div style="${Object.entries(baseEmailStyles)
    .map(([key, value]) => `${key}: ${value};`)
    .join("")}">
  ${headerTemplate("Findly Verification Code")}
  
  <p>Hello,</p>
  <p>Your One-Time Password (OTP) for verifying your email on <strong>Findly</strong> is:</p>
  
  <div style="text-align: center; margin: 20px 0;">
    <div style="display: inline-block; padding: 15px 30px; background-color: ${lightBackground}; 
                border-radius: 8px; font-size: 24px; font-weight: bold; color: ${primaryColor};">
      ${otp}
    </div>
  </div>
  
  <p>This code is valid for <strong>5 minutes</strong>.</p>
  <p>If you did not request this, you can safely ignore this email.</p>
  
  ${footerTemplate}
</div>
`,
});

export const getAccountApprovalEmail = (
  email: string,
  password: string
): EmailTemplate => ({
  subject: "Your Findly Account Has Been Approved",
  text: `Hello,
  
Your Findly account has been approved and is now active. Here are your login credentials:

Email: ${email}
Temporary Password: ${password}

Please log in and change your password immediately for security reasons.

Login URL: ${env.NEXTAUTH_URL}/auth/login

Thank you,
The Findly Team`,

  html: `
<div style="${Object.entries(baseEmailStyles)
    .map(([key, value]) => `${key}: ${value};`)
    .join("")}">
  ${headerTemplate("Your Findly Account Is Ready")}
  
  <p>Hello,</p>
  <p>Your Findly account has been approved and is now active. Here are your login credentials:</p>
  
  <div style="background: ${lightBackground}; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${primaryColor};">
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Temporary Password:</strong> ${password}</p>
  </div>
  
  <p style="color: #d32f2f; font-weight: bold;">Please log in and change your password immediately for security reasons.</p>
  
  ${actionButton("Login to Findly", `${env.NEXTAUTH_URL}/auth/login`)}
  
  ${footerTemplate}
</div>
`,
});

export const getAdminOnboardingEmail = (
  name: string,
  email: string,
  password: string
): EmailTemplate => ({
  subject: `Welcome to Findly's Admin Team, ${name}!`,
  text: `Dear ${name},

Welcome to Findly's Admin Team!

We're excited to have you join us in managing and optimizing our recruitment platform. Below are your login credentials to access the admin dashboard:

Email: ${email}
Temporary Password: ${password}

First Steps:
1. Log in to the admin dashboard
2. Change your temporary password immediately
3. Review the admin handbook
4. Set up your profile and notification preferences

For any assistance, please contact our support team at support@findly.com.

Best regards,
The Findly Leadership Team`,

  html: `
<div style="${Object.entries(baseEmailStyles)
    .map(([key, value]) => `${key}: ${value};`)
    .join("")}">
  ${headerTemplate(`Welcome to Findly's Admin Team`)}

  <p>Dear ${name},</p>
  <p>We're excited to have you join us in managing and optimizing our recruitment platform.</p>
  
  <div style="background: ${lightBackground}; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${primaryColor};">
    <h3 style="margin-top: 0; color: ${primaryColor};">Your Login Credentials</h3>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Temporary Password:</strong> ${password}</p>
    ${actionButton("Access Admin Dashboard", `${env.NEXTAUTH_URL}/admin/login`)}
  </div>

  <h3 style="color: ${primaryColor};">First Steps</h3>
  <ol style="padding-left: 20px; line-height: 1.6;">
    <li>Log in and change your temporary password</li>
    <li>Review the admin handbook (attached)</li>
    <li>Set up your profile and notification preferences</li>
    <li>Familiarize yourself with the dashboard</li>
  </ol>

  <div style="background: ${warningBackground}; padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
    <h3 style="margin-top: 0; color: #d32f2f;">Security Reminders</h3>
    <ul style="padding-left: 20px;">
      <li>Never share your credentials</li>
      <li>Always log out from shared devices</li>
      <li>Report any suspicious activity immediately</li>
    </ul>
  </div>

  <p>For any assistance, please contact our support team at 
    <a href="mailto:support@findly.com" style="color: ${primaryColor}; font-weight: bold;">support@findly.com</a>.
  </p>

  ${footerTemplate}
</div>
`,
});

export const getAgencyCreationEmail = (
  agencyName: string,
  email: string,
  adminName: string,
  verificationLink: string
): EmailTemplate => ({
  subject: `Action Required: Verify Your Findly Agency Account`,
  text: `Dear ${agencyName},

Thank you for registering with Findly! Your agency account has been created by ${adminName} and is currently being reviewed by our team.

To complete your registration, please verify your email address by clicking the link below:
${verificationLink}

Please prepare the following documents for verification:
- Business License
- Insurance Certificate
- ID Proof
- Address Proof
- Other Supporting Documents

If you have any questions, please contact our support team at support@findly.com.

Thank you for choosing Findly.

Best regards,
The Findly Team`,

  html: `
<div style="${Object.entries(baseEmailStyles)
    .map(([key, value]) => `${key}: ${value};`)
    .join("")}">
  ${headerTemplate("Agency Registration in Progress")}
  
  <p>Dear ${agencyName},</p>
  <p>Thank you for registering with Findly! Your agency account has been created by ${adminName} and is currently being reviewed by our team.</p>
  
  <div style="background: ${lightBackground}; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${primaryColor};">
    <h3 style="margin-top: 0; color: ${primaryColor};">Action Required: Verify Your Email</h3>
    <p>Please click the button below to verify your email address:</p>
    ${actionButton("Verify Email Address", verificationLink)}
    <p style="font-size: 12px; color: #666;">Or copy this link to your browser: ${verificationLink}</p>
  </div>

  <h3 style="color: ${primaryColor};">Required Documents</h3>
  ${requiredDocumentsList}

  <div style="background: ${infoBackground}; padding: 16px; border-radius: 8px; margin: 20px 0;">
    <h3 style="margin-top: 0; color: ${primaryColor};">What Happens Next?</h3>
    <ol style="padding-left: 20px; line-height: 1.6;">
      <li>Complete email verification using the link above</li>
      <li>Submit all required documents through the portal</li>
      <li>Our team will review your submission</li>
      <li>You'll receive login credentials within 1-2 business days after approval</li>
    </ol>
  </div>

  <p>For any questions, please contact our support team at 
    <a href="mailto:support@findly.com" style="color: ${primaryColor}; font-weight: bold;">support@findly.com</a>.
  </p>

  ${footerTemplate}
</div>
`,
});

export const getAgencyWelcomeEmail = (
  agencyName: string,
  email: string,
  password: string,
  loginLink: string = `${env.NEXTAUTH_URL}/auth/login`
): EmailTemplate => ({
  subject: `Welcome to Findly, ${agencyName}! Your Agency Account is Ready`,
  text: `Dear ${agencyName},

Congratulations! Your agency account with Findly has been approved and is now active.

Here are your login credentials:
Email: ${email}
Temporary Password: ${password}

First Steps:
1. Log in to your dashboard
2. Change your temporary password immediately
3. Complete your agency profile
4. Review the agency handbook
5. Set up your recruitment preferences

For assistance, contact our support team at support@findly.com.

Best regards,
The Findly Team`,

  html: `
<div style="${Object.entries(baseEmailStyles)
    .map(([key, value]) => `${key}: ${value};`)
    .join("")}">
  ${headerTemplate("Welcome to Findly!")}
  
  <p>Dear ${agencyName},</p>
  <p>Congratulations! Your agency account with Findly has been approved and is now active.</p>
  
  <div style="background: ${lightBackground}; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${primaryColor};">
    <h3 style="margin-top: 0; color: ${primaryColor};">Your Login Credentials</h3>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Temporary Password:</strong> ${password}</p>
    ${actionButton("Access Agency Dashboard", loginLink)}
  </div>

  <h3 style="color: ${primaryColor};">Getting Started Guide</h3>
  <ol style="padding-left: 20px; line-height: 1.6;">
    <li><strong>First Login:</strong> Use the credentials above to access your dashboard</li>
    <li><strong>Security:</strong> Change your temporary password immediately</li>
    <li><strong>Profile:</strong> Complete your agency profile with all required details</li>
    <li><strong>Handbook:</strong> Review the attached agency handbook for guidelines</li>
    <li><strong>Preferences:</strong> Set up your recruitment and notification preferences</li>
  </ol>

  <div style="background: ${infoBackground}; padding: 16px; border-radius: 8px; margin: 20px 0;">
    <h3 style="margin-top: 0; color: ${primaryColor};">Need Help?</h3>
    <p>Our support team is ready to assist you with:</p>
    <ul style="padding-left: 20px; line-height: 1.6;">
      <li>Account setup questions</li>
      <li>Platform navigation</li>
    </ul>
    <p>Contact us at <a href="mailto:support@findly.com" style="color: ${primaryColor}; font-weight: bold;">support@findly.com</a></p>
  </div>

  ${footerTemplate}
</div>
`,
});

// New template for document submission confirmation
export const getAgencyDocumentsSubmittedEmail = (
  agencyName: string,
  adminName: string
): EmailTemplate => ({
  subject: `Documents Received - ${agencyName} Account Verification`,
  text: `Dear ${agencyName},

Thank you for submitting your documents for Findly agency verification. We have received the following documents:

- Business License
- Insurance Certificate
- ID Proof
- Address Proof
- Other Supporting Documents

Our verification team will review your submission within 1-2 business days. Once approved, you will receive your login credentials via email.

Please check your email frequently during this period. If we need any additional information, we will contact you.

If you have any questions, please contact ${adminName} or our support team at support@findly.com.

Thank you for your patience.

Best regards,
The Findly Team`,

  html: `
<div style="${Object.entries(baseEmailStyles)
    .map(([key, value]) => `${key}: ${value};`)
    .join("")}">
  ${headerTemplate("Documents Received")}
  
  <p>Dear ${agencyName},</p>
  <p>Thank you for submitting your documents for Findly agency verification.</p>
  
  <div style="background: ${lightBackground}; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${primaryColor};">
    <h3 style="margin-top: 0; color: ${primaryColor};">Documents Received</h3>
    ${requiredDocumentsList}
  </div>

  <div style="background: ${infoBackground}; padding: 16px; border-radius: 8px; margin: 20px 0;">
    <h3 style="margin-top: 0; color: ${primaryColor};">Next Steps</h3>
    <ol style="padding-left: 20px; line-height: 1.6;">
      <li>Our verification team will review your submission</li>
      <li>This process typically takes <strong>1-2 business days</strong></li>
      <li>You'll receive login credentials via email once approved</li>
      <li>Check your email frequently during this period</li>
    </ol>
  </div>

  <div style="background: ${warningBackground}; padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
    <h3 style="margin-top: 0; color: #d32f2f;">Important Note</h3>
    <p>If we need any additional information during verification, we will contact you via email.</p>
  </div>

  <p>If you have any questions, please contact ${adminName} or our support team at 
    <a href="mailto:support@findly.com" style="color: ${primaryColor}; font-weight: bold;">support@findly.com</a>.
  </p>

  <p style="color: ${primaryColor}; font-weight: bold; text-align: center; margin: 30px 0 20px;">
    Thank you for your patience during the verification process.
  </p>
  
  ${footerTemplate}
</div>
`,
});

export const getVisaNotificationEmail = (
  labourName: string,
  companyName: string,
  jobTitle: string,
  visaDownloadUrl: string
): EmailTemplate => ({
  subject: `Your Visa is Ready - ${companyName}`,
  text: `Dear ${labourName},

Great news! Your visa has been printed and is ready. You have been approved for the position of ${jobTitle} at ${companyName}.

Your visa document is attached to this email. Please download and save it securely.

Important Next Steps:
1. Download and save your visa document
2. Review all visa details carefully
3. Contact your recruitment agency for travel arrangements
4. Ensure all travel documents are in order

If you have any questions, please contact your recruitment agency or ${companyName}.

Best regards,
The ${companyName} Team`,

  html: `
<div style="${Object.entries(baseEmailStyles)
    .map(([key, value]) => `${key}: ${value};`)
    .join("")}">
  ${headerTemplate("Your Visa is Ready!")}
  
  <p>Dear ${labourName},</p>
  <p>Great news! Your visa has been printed and is ready. You have been approved for the position of <strong>${jobTitle}</strong> at <strong>${companyName}</strong>.</p>
  
  <div style="background: ${lightBackground}; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${primaryColor};">
    <h3 style="margin-top: 0; color: ${primaryColor};">Visa Document</h3>
    <p>Your visa document is attached to this email. Please download and save it securely.</p>
    ${actionButton("Download Visa", visaDownloadUrl)}
  </div>

  <h3 style="color: ${primaryColor};">Important Next Steps</h3>
  <ol style="padding-left: 20px; line-height: 1.6;">
    <li><strong>Download and save</strong> your visa document securely</li>
    <li><strong>Review all visa details</strong> carefully for accuracy</li>
    <li><strong>Contact your recruitment agency</strong> for travel arrangements</li>
    <li><strong>Ensure all travel documents</strong> are in order</li>
  </ol>

  <div style="background: ${warningBackground}; padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
    <h3 style="margin-top: 0; color: #d32f2f;">Important Reminders</h3>
    <ul style="padding-left: 20px;">
      <li>Keep your visa document safe and accessible</li>
      <li>Make copies of all important documents</li>
      <li>Follow all travel guidelines provided by your agency</li>
    </ul>
  </div>

  <p>If you have any questions, please contact your recruitment agency or 
    <a href="mailto:hr@${companyName.toLowerCase().replace(/\s+/g, "")}.com" style="color: ${primaryColor}; font-weight: bold;">${companyName}</a>.
  </p>

  ${footerTemplate}
</div>
`,
});

export const travelDocumentsUploadedTemplate = ({
  labourName,
  clientName,
  travelDate,
  documentsCount,
}: {
  labourName: string;
  clientName: string;
  travelDate: string;
  documentsCount: number;
}): string => `
<div style="${Object.entries(baseEmailStyles)
  .map(([key, value]) => `${key}: ${value};`)
  .join("")}">
  ${headerTemplate("Travel Documents Uploaded")}
  
  <p>Dear ${clientName},</p>
  <p>Great news! Travel documents have been uploaded for <strong>${labourName}</strong> and they are ready for travel to Qatar.</p>
  
  <div style="background: ${lightBackground}; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${primaryColor};">
    <h3 style="margin-top: 0; color: ${primaryColor};">Travel Information</h3>
    <p><strong>Labour Name:</strong> ${labourName}</p>
    <p><strong>Travel Date:</strong> ${travelDate}</p>
    <p><strong>Documents Uploaded:</strong> ${documentsCount} documents</p>
  </div>

  <h3 style="color: ${primaryColor};">Documents Included</h3>
  <ul style="padding-left: 20px; line-height: 1.6;">
    <li>Flight Ticket</li>
    <li>Passport</li>
    <li>Medical Certificate</li>
    <li>Police Clearance</li>
    <li>Employment Contract</li>
    <li>Visa Document</li>
    <li>Additional Travel Documents</li>
  </ul>

  <div style="background: ${infoBackground}; padding: 16px; border-radius: 8px; margin: 20px 0;">
    <h3 style="margin-top: 0; color: ${primaryColor};">Next Steps</h3>
    <ol style="padding-left: 20px; line-height: 1.6;">
      <li>Review all uploaded documents</li>
      <li>Confirm travel arrangements</li>
      <li>Prepare for arrival and onboarding</li>
      <li>Contact the recruitment agency for any questions</li>
    </ol>
  </div>

  <div style="background: ${warningBackground}; padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
    <h3 style="margin-top: 0; color: #d32f2f;">Important Reminders</h3>
    <ul style="padding-left: 20px;">
      <li>Ensure all documents are valid and up-to-date</li>
      <li>Keep copies of all travel documents</li>
      <li>Follow all travel guidelines and requirements</li>
    </ul>
  </div>

  <p>If you have any questions about the travel arrangements or documents, please contact your recruitment agency.</p>

  ${footerTemplate}
</div>
`;
export const getStageReminderEmail = ({
  recipientName,
  profileName,
  stageLabel,
  stageStatus,
  lastUpdated,
  recipientType,
}: {
  recipientName: string;
  profileName: string;
  stageLabel: string;
  stageStatus: string;
  lastUpdated: string;
  recipientType: "client" | "agency";
}): EmailTemplate => ({
  subject: `Action Required: ${profileName}'s ${stageLabel} Stage`,
  text: `Dear ${recipientName},

This is a reminder that ${profileName}'s ${stageLabel} stage has been pending for more than 3 days.

Current Status: ${stageStatus}
Last Updated: ${lastUpdated}

Please take the necessary action to move this profile to the next stage.

You can view the recruitment tracker here: ${publicEnv.NEXT_PUBLIC_APP_URL}/dashboard/${recipientType}/recruitment

Best regards,
The Findly Recruitment Team`,

  html: `
<div style="${Object.entries(baseEmailStyles)
    .map(([key, value]) => `${key}: ${value};`)
    .join("")}">
  ${headerTemplate("Stage Update Reminder")}
  
  <p>Dear ${recipientName},</p>
  <p>This is a reminder that <strong>${profileName}</strong>'s <strong>${stageLabel}</strong> stage has been pending for more than 3 days.</p>
  
  <div style="background: ${lightBackground}; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${primaryColor};">
    <h3 style="margin-top: 0; color: ${primaryColor};">Current Stage Details</h3>
    <p><strong>Stage:</strong> ${stageLabel}</p>
    <p><strong>Current Status:</strong> ${stageStatus}</p>
    <p><strong>Last Updated:</strong> ${lastUpdated}</p>
  </div>

  <div style="background: ${warningBackground}; padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
    <h3 style="margin-top: 0; color: #d32f2f;">Action Required</h3>
    <p>Please take the necessary action to move this profile to the next stage of the recruitment process.</p>
    ${actionButton(
      "View Recruitment Tracker",
      `${publicEnv.NEXT_PUBLIC_APP_URL}/dashboard/${recipientType}/recruitment`
    )}
  </div>

  <div style="background: ${infoBackground}; padding: 16px; border-radius: 8px; margin: 20px 0;">
    <h3 style="margin-top: 0; color: ${primaryColor};">Need Help?</h3>
    <p>If you have any questions about this stage or the next steps:</p>
    <ul style="padding-left: 20px; line-height: 1.6;">
      <li>Review the stage requirements in the recruitment tracker</li>
      <li>Contact our support team at <a href="mailto:support@findly.com" style="color: ${primaryColor}; font-weight: bold;">support@findly.com</a></li>
      <li>Check the help documentation for this stage</li>
    </ul>
  </div>

  ${footerTemplate}
</div>
`,
});

export const getPasswordResetEmail = ({
  recipientName,
  resetLink,
  expiryHours = 24,
}: {
  recipientName: string;
  resetLink: string;
  expiryHours?: number;
}): EmailTemplate => ({
  subject: "Password Reset Request",
  text: `Dear ${recipientName},

You requested a password reset for your Findly account. Please click the link below to reset your password:

${resetLink}

This link will expire in ${expiryHours} hours. If you didn't request this, please ignore this email.

Best regards,
The Findly Team`,

  html: `
<div style="${Object.entries(baseEmailStyles)
    .map(([key, value]) => `${key}: ${value};`)
    .join("")}">
  ${headerTemplate("Password Reset Request")}
  
  <p>Dear ${recipientName},</p>
  <p>You requested a password reset for your Findly account. Please click the button below to reset your password:</p>
  
  <div style="text-align: center; margin: 20px 0;">
    ${actionButton("Reset Password", resetLink)}
  </div>
  
  <p style="text-align: center; font-size: 14px; color: ${secondaryColor};">
    This link will expire in ${expiryHours} hours.
  </p>
  
  <div style="background: ${warningBackground}; padding: 16px; border-radius: 8px; margin: 20px 0;">
    <p style="margin: 0; color: #d32f2f;">
      <strong>Important:</strong> If you didn't request this password reset, please ignore this email or contact our support team.
    </p>
  </div>
  
  ${footerTemplate}
</div>
`,
});
