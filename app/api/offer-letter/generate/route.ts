// API route to generate an offer letter PDF for a given labour and job role
// GET /api/offer-letter/generate?labourId=...&jobRoleId=...
// Returns: PDF file (A4) matching the provided template

import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
// Lazy-load puppeteer to avoid issues in serverless environments
const getPuppeteer = async () => {
  const puppeteer = await import("puppeteer");
  return puppeteer.default || puppeteer;
};

// Map ContractDuration enum to user-friendly string
function formatContractDuration(duration: string | null | undefined): string {
  switch (duration) {
    case "ONE_MONTH":
      return "1 Month";
    case "THREE_MONTHS":
      return "3 Months";
    case "SIX_MONTHS":
      return "6 Months";
    case "ONE_YEAR":
      return "1 Year";
    case "TWO_YEARS":
      return "2 Years";
    case "THREE_YEARS":
      return "3 Years";
    case "FIVE_PLUS_YEARS":
      return "5+ Years";
    default:
      return duration || "-";
  }
}

// Capitalize and format ticketFrequency
function formatTicketFrequency(freq: string | null | undefined): string {
  if (!freq) return "-";
  // Replace underscores with spaces, lowercase, then capitalize first letter
  const s = freq.replace(/_/g, " ").toLowerCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// Format health insurance
function formatHealthInsurance(insurance: string | null | undefined): string {
  if (!insurance) return "-";
  if (insurance.trim().toLowerCase() === "asperlaw") {
    return "Provided as per Qatar labor laws.";
  }
  return "Provided By Company";
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const labourId = searchParams.get("labourId");
    const jobRoleId = searchParams.get("jobRoleId");

    if (!labourId || !jobRoleId) {
      return new Response(
        JSON.stringify({ error: "Missing labourId or jobRoleId" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Fetch data from DB
    const assignment = await prisma.labourAssignment.findFirst({
      where: { labourId, jobRoleId },
      include: {
        labour: true,
        jobRole: {
          include: {
            requirement: {
              include: { client: true },
            },
          },
        },
      },
    });
    if (!assignment) {
      return new Response(JSON.stringify({ error: "Assignment not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    const { labour, jobRole } = assignment;
    const { requirement } = jobRole;
    const { client } = requirement;

    // Fetch OfferLetterDetails for the requirement
    const offerLetterDetails = await prisma.offerLetterDetails.findUnique({
      where: { requirementId: requirement.id },
    });
    if (
      !offerLetterDetails ||
      !offerLetterDetails.workingHours ||
      !offerLetterDetails.workingDays ||
      !offerLetterDetails.leaveSalary ||
      !offerLetterDetails.endOfService ||
      !offerLetterDetails.probationPeriod
    ) {
      return new Response(
        JSON.stringify({
          error:
            "Offer letter details are missing. Please ask the client to fill in working hours, working days, leave salary, end of service, and probation period for this requirement.",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Fetch the client user for logo
    const clientUser = await prisma.user.findUnique({
      where: { id: client.userId },
      select: { profilePicture: true },
    });
    const logoUrl = clientUser?.profilePicture || "/assets/Logo-black.png";

    // Prepare props for the template
    const props = {
      date: new Date().toLocaleDateString("en-GB"),
      name: labour.name,
      position: jobRole.title,
      passportNumber: labour.passportNumber,
      contractPeriod: formatContractDuration(jobRole.contractDuration),
      workingHours: offerLetterDetails.workingHours,
      workingDays: offerLetterDetails.workingDays,
      basicSalary: jobRole.basicSalary?.toString() || "-",
      foodAllowance: jobRole.foodProvidedByCompany
        ? "Provided by company"
        : jobRole.foodAllowance?.toString() || "0",
      transportationAllowance: jobRole.transportationProvidedByCompany
        ? "Provided by company"
        : jobRole.transportationAllowance?.toString() || "0",
      accommodationAllowance: jobRole.housingProvidedByCompany
        ? "Provided by company"
        : jobRole.housingAllowance?.toString() || "0",
      mobileAllowance: jobRole.mobileProvidedByCompany
        ? "Provided by company"
        : jobRole.mobileAllowance?.toString() || "0",
      otherAllowance: jobRole.otherAllowance?.toString() || "0",
      total: (
        (jobRole.basicSalary || 0) +
        (jobRole.foodAllowance || 0) +
        (jobRole.mobileAllowance || 0) +
        (jobRole.otherAllowance || 0)
      ).toString(),
      tickets: formatTicketFrequency(jobRole.ticketFrequency),
      leaveSalary: offerLetterDetails.leaveSalary,
      healthInsurance: formatHealthInsurance(jobRole.healthInsurance),
      endOfService: offerLetterDetails.endOfService,
      probationPeriod: offerLetterDetails.probationPeriod,
      companyName: client.companyName,
      logoUrl,
      startDate: jobRole.startDate
        ? new Date(jobRole.startDate).toLocaleDateString("en-GB")
        : "-",
      workLocation: formatTicketFrequency(jobRole.workLocations) || "-",
      salaryCurrency: jobRole.salaryCurrency || "QAR",
    };

    // HTML template string for the offer letter (A4 size, inline styles)
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Offer Letter ${props.name} </title>
        <style>
          @page { size: A4; margin: 0; }
          body { margin: 0; padding: 0; font-family: Arial, sans-serif; background: #fff; color: #222; font-size: 13px; }
          .container { width: 210mm; min-height: 297mm; padding: 32px 40px; box-sizing: border-box; }
          .header { display: flex; align-items: center; margin-bottom: 8px; }
          .logo { width: 80px; height: 80px; object-fit: contain; margin-right: 24px; }
          .company { font-size: 12px; color: #888; }
          .date { text-align: right; font-size: 13px; }
          .title { text-align: center; font-weight: 700; text-decoration: underline; margin: 16px 0 8px 0; }
          .section-title { background: #e9f1fa; font-weight: 700; padding: 4px 8px; margin-bottom: 0; font-size: 13px; }
          .table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
          .table td { padding: 0; }
          .total-row td { font-weight: 700; font-size: 15px; }
          .signature-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
          .signature-table td { text-align: center; font-style: italic; font-weight: 700; }
          .footer { display: flex; justify-content: space-between; align-items: center; font-size: 12px; }
          .red { color: #b00; font-weight: 700; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="${props.logoUrl}" alt="Company Logo" class="logo" />
            <div class="date" style="margin-left: auto; text-align: right;">Date: - ${props.date}</div>
          </div>
          <h2 class="title">JOB OFFER</h2>
          <div style="margin-bottom: 12px;"><span style="font-weight: 700;">To:</span> ${props.name}</div>
          <div style="margin-bottom: 12px;"><span style="font-weight: 700;">Position</span>: ${props.position}</div>
          <div style="margin-bottom: 12px;"><span style="font-weight: 700;">Passport Number</span>: ${props.passportNumber}</div>
          <div style="margin-bottom: 16px;">It is my pleasure to offer you some possible employment in our company in accordance with the terms and conditions stated herein.</div>
          <div class="section-title">Contract Details</div>
          <table class="table">
            <tbody>
              <tr><td>Contract Period</td><td>: ${props.contractPeriod}</td></tr>
              <tr><td>Start Date</td><td>: ${props.startDate}</td></tr>
              <tr><td>Work Location</td><td>: ${props.workLocation}</td></tr>
              <tr><td>Working Hours</td><td>: ${props.workingHours}</td></tr>
              <tr><td>Working Days</td><td>: ${props.workingDays}</td></tr>
            </tbody>
          </table>
          <div class="section-title">Compensation Package</div>
          <table class="table">
            <tbody>
              <tr><td>Basic Salary</td><td>: ${props.basicSalary} ${props.salaryCurrency}</td></tr>
              <tr><td>Food Allowance</td><td>: ${props.foodAllowance === "Provided by company" ? props.foodAllowance : props.foodAllowance + " " + props.salaryCurrency}</td></tr>
              <tr><td>Transportation Allowance</td><td>: ${props.transportationAllowance === "Provided by company" ? props.transportationAllowance : props.transportationAllowance + " " + props.salaryCurrency}</td></tr>
              <tr><td>Accommodation Allowance</td><td>: ${props.accommodationAllowance === "Provided by company" ? props.accommodationAllowance : props.accommodationAllowance + " " + props.salaryCurrency}</td></tr>
              <tr><td>Mobile Allowance</td><td>: ${props.mobileAllowance === "Provided by company" ? props.mobileAllowance : props.mobileAllowance + " " + props.salaryCurrency}</td></tr>
              <tr><td>Other allowance</td><td>: ${props.otherAllowance + " " + props.salaryCurrency}</td></tr>
              <tr class="total-row"><td>Total</td><td>: ${props.total} ${props.salaryCurrency}</td></tr>
            </tbody>
          </table>
          <div class="section-title">Other Benefit</div>
          <table class="table">
            <tbody>
              <tr><td>Tickets</td><td>: ${props.tickets}</td></tr>
              <tr><td>Leave Salary</td><td>: ${props.leaveSalary}</td></tr>
              <tr><td>Health Insurance</td><td>: ${props.healthInsurance}</td></tr>
              <tr><td>End of Service</td><td>: ${props.endOfService}</td></tr>
            </tbody>
          </table>
          <div class="section-title">Performance</div>
          <table class="table" style="margin-bottom: 16px;">
            <tbody>
              <tr><td>Probation Period</td><td>: ${props.probationPeriod}</td></tr>
            </tbody>
          </table>
          <div style="margin: 32px 0 16px 0;">Yours truly,</div>
          <table class="signature-table">
            <tbody>
              <tr>
                <td>Company Signature</td>
                <td>Employee Acceptance</td>
              </tr>
            </tbody>
          </table>
          <div class="footer">
            <div>
              Authorized Signatory<br />
              <span class="red">(Client Acceptance Through Findly)</span><br />
              Date : ${props.date}
            </div>
            <div class="red">Employee Finger Stamp</div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Generate PDF with Puppeteer
    const puppeteer = await getPuppeteer();
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox"],
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });
    await browser.close();

    // Ensure pdfBuffer is a Node.js Buffer for the Response
    const nodeBuffer = Buffer.isBuffer(pdfBuffer)
      ? pdfBuffer
      : Buffer.from(pdfBuffer);
    return new Response(new Uint8Array(nodeBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename=OfferLetter-${labour.name.replace(/\s+/g, "_")}.pdf`,
      },
    });
  } catch (err) {
    console.error("Offer letter PDF generation error:", err);
    return new Response(JSON.stringify({ error: "Failed to generate PDF" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
