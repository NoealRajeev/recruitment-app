import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
// Lazy-load puppeteer to avoid issues in serverless environments
const getPuppeteer = async () => {
  const puppeteer = await import("puppeteer");
  return puppeteer.default || puppeteer;
};

function formatDate(dateStr: string | Date | null | undefined): string {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const labourId = searchParams.get("labourId");
    if (!labourId) {
      return new Response(JSON.stringify({ error: "Missing labourId" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Fetch labour profile and related data
    const labour = await prisma.labourProfile.findUnique({
      where: { id: labourId },
      include: {
        // Add relations if needed
      },
    });
    if (!labour) {
      return new Response(
        JSON.stringify({ error: "Labour profile not found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Prepare data for template
    const profileImage = labour.profileImage
      ? labour.profileImage.startsWith("http")
        ? labour.profileImage
        : `/uploads/${labour.profileImage}`
      : "https://via.placeholder.com/120x140?text=Photo";
    const name = labour.name || "-";
    const position = labour.jobRole || "-";
    const age = labour.age || "-";
    const gender = labour.gender || "-";
    const nationality = labour.nationality || "-";
    const contact = labour.phone || "-";
    const passportNumber = labour.passportNumber || "-";
    const passportExpiry = labour.passportExpiry
      ? formatDate(labour.passportExpiry)
      : "-";

    // HTML template
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>CV - ${name}</title>
        <style>
          @page { size: A4; margin: 0; }
          body { margin: 0; padding: 0; font-family: Arial, sans-serif; background: #fff; color: #222; font-size: 13px; }
          .container { width: 210mm; min-height: 297mm; padding: 32px 40px; box-sizing: border-box; }
          .header { display: flex; align-items: flex-start; margin-bottom: 8px; }
          .photo { width: 120px; height: 140px; object-fit: cover; border: 1px solid #bbb; margin-right: 32px; }
          .title { font-size: 2.2rem; font-weight: 700; color: #21759b; margin-bottom: 8px; }
          .details-table { border-collapse: collapse; width: 100%; margin-bottom: 8px; }
          .details-table td { border: 1px solid #222; padding: 4px 8px; }
          .details-table td.label { font-weight: 600; background: #f8f8f8; width: 120px; }
          .section-title { background: #d6e7fa; font-weight: 700; padding: 6px 8px; margin: 18px 0 0 0; font-size: 15px; }
          .list { margin: 0; padding-left: 18px; }
          .list li { margin-bottom: 2px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="${profileImage}" class="photo" alt="Photo" />
            <div style="flex:1;">
              <div class="title">${name}</div>
              <table class="details-table">
                <tr><td class="label">Position</td><td>${position}</td></tr>
                <tr><td class="label">Age</td><td>${age} Years</td></tr>
                <tr><td class="label">Gender</td><td>${gender}</td></tr>
                <tr><td class="label">Nationality</td><td>${nationality}</td></tr>
                <tr><td class="label">Contact No.</td><td>${contact}</td></tr>
              </table>
            </div>
          </div>

          <div class="section-title">Passport Details</div>
          <table class="details-table">
            <tr><td class="label">Passport No.</td><td>${passportNumber}</td></tr>
            <tr><td class="label">Expiry Date</td><td>${passportExpiry}</td></tr>
          </table>

          ${labour.experience ? `<div class="section-title">Experience</div><div>${labour.experience}</div>` : ""}

          ${labour.skills && labour.skills.length > 0 ? `<div class="section-title">Skills</div><ul class="list">${labour.skills.map((s: string) => `<li>${s}</li>`).join("")}</ul>` : ""}

          ${labour.education ? `<div class="section-title">Education</div><div>${labour.education}</div>` : ""}

          ${labour.languages && labour.languages.length > 0 ? `<div class="section-title">Languages</div><ul class="list">${labour.languages.map((l: string) => `<li>${l}</li>`).join("")}</ul>` : ""}
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

    const nodeBuffer = Buffer.isBuffer(pdfBuffer)
      ? pdfBuffer
      : Buffer.from(pdfBuffer);
    return new Response(new Uint8Array(nodeBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename=CV-${name.replace(/\s+/g, "_")}.pdf`,
      },
    });
  } catch (err) {
    console.error("CV PDF generation error:", err);
    return new Response(
      JSON.stringify({ error: "Failed to generate CV PDF" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
