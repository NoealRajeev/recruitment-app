import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import prisma from "@/lib/prisma";
import * as XLSX from "xlsx";

// Add the lazy-load getPuppeteer function
const getPuppeteer = async () => {
  const puppeteer = await import("puppeteer");
  return puppeteer.default || puppeteer;
};

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { reportType, format, filters } = await request.json();
    const { role } = session.user;

    let reportData: any = {};
    let reportTitle = "";
    let fileName = "";

    // Generate report data based on role and type
    switch (role) {
      case "RECRUITMENT_ADMIN":
        reportData = await generateAdminReport(reportType);
        reportTitle = `Admin ${capitalizeFirstLetter(reportType)} Report`;
        fileName = `admin-${reportType}-${new Date().toISOString().split("T")[0]}`;
        break;

      case "CLIENT_ADMIN":
        reportData = await generateClientReport(
          reportType,
          filters,
          session.user.id
        );
        reportTitle = `Client ${capitalizeFirstLetter(reportType)} Report`;
        fileName = `client-${reportType}-${new Date().toISOString().split("T")[0]}`;
        break;

      case "RECRUITMENT_AGENCY":
        reportData = await generateAgencyReport(
          reportType,
          filters,
          session.user.id
        );
        reportTitle = `Agency ${capitalizeFirstLetter(reportType)} Report`;
        fileName = `agency-${reportType}-${new Date().toISOString().split("T")[0]}`;
        break;

      default:
        return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Generate report in requested format
    if (format === "excel") {
      return generateExcelReport(reportData, fileName);
    }
    return generatePDFReport(reportData, reportTitle, fileName);
  } catch (error) {
    console.error("Report generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}

function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

async function generateAdminReport(reportType: string) {
  switch (reportType) {
    case "comprehensive":
      return {
        summary: await getAdminSummary(),
        requirements: await getAdminRequirements(),
        clients: await getAdminClients(),
        agencies: await getAdminAgencies(),
        labour: await getAdminLabour(),
      };

    case "analytics":
      return {
        performance: await getAdminPerformance(),
        trends: await getAdminTrends(),
        metrics: await getAdminMetrics(),
      };

    case "system":
      return {
        systemHealth: await getSystemHealth(),
        auditLogs: await getAuditLogs(),
        notifications: await getNotificationStats(),
      };

    default:
      throw new Error("Invalid report type");
  }
}

async function generateClientReport(
  reportType: string,
  filters: unknown,
  userId: string
) {
  switch (reportType) {
    case "comprehensive":
      return {
        summary: await getClientSummary(userId),
        requirements: await getClientRequirements(userId),
        labour: await getClientLabour(userId),
      };

    case "labour":
      return {
        deployed: await getClientDeployedLabour(userId),
        active: await getClientActiveLabour(userId),
        pending: await getClientPendingLabour(userId),
      };

    case "requirements":
      return {
        requirements: await getClientRequirements(userId),
        status: await getClientRequirementsStatus(userId),
      };

    default:
      throw new Error("Invalid report type");
  }
}

async function generateAgencyReport(
  reportType: string,
  filters: unknown,
  userId: string
) {
  switch (reportType) {
    case "comprehensive":
      return {
        summary: await getAgencySummary(userId),
        profiles: await getAgencyProfiles(userId),
        assignments: await getAgencyAssignments(userId),
      };

    case "profiles":
      return {
        profiles: await getAgencyProfiles(userId),
        status: await getAgencyProfileStatus(userId),
      };

    case "deployment":
      return {
        deployed: await getAgencyDeployed(userId),
        success: await getAgencySuccessRate(userId),
      };

    default:
      throw new Error("Invalid report type");
  }
}

// Admin Data Functions
async function getAdminSummary() {
  const [
    totalRequirements,
    totalClients,
    totalAgencies,
    totalLabour,
    completedRequirements,
  ] = await Promise.all([
    prisma.requirement.count(),
    prisma.client.count(),
    prisma.agency.count(),
    prisma.labourProfile.count(),
    prisma.requirement.count({ where: { status: "COMPLETED" } }),
  ]);

  return {
    totalRequirements,
    completedRequirements,
    completionRate:
      totalRequirements > 0
        ? Math.round((completedRequirements / totalRequirements) * 100)
        : 0,
    totalClients,
    totalAgencies,
    totalLabour,
  };
}

async function getAdminRequirements() {
  const requirements = await prisma.requirement.findMany({
    include: {
      client: { select: { companyName: true } },
      jobRoles: { select: { title: true, quantity: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return requirements.map((req) => ({
    id: req.id,
    client: req.client.companyName,
    status: req.status,
    jobRoles: req.jobRoles.map((jr) => jr.title).join(", "),
    totalPositions: req.jobRoles.reduce((sum, jr) => sum + jr.quantity, 0),
    createdAt: req.createdAt.toISOString().split("T")[0],
  }));
}

async function getAdminClients() {
  const clients = await prisma.client.findMany({
    include: {
      user: { select: { email: true, status: true } },
      Requirement: { select: { id: true, status: true } },
    },
  });

  return clients.map((client) => ({
    companyName: client.companyName,
    email: client.user.email,
    status: client.user.status,
    totalRequirements: client.Requirement.length,
    completedRequirements: client.Requirement.filter(
      (r) => r.status === "COMPLETED"
    ).length,
    sector: client.companySector,
    registrationNo: client.registrationNo,
  }));
}

async function getAdminAgencies() {
  const agencies = await prisma.agency.findMany({
    include: {
      user: { select: { email: true, status: true } },
      LabourProfile: { select: { id: true, status: true } },
    },
  });

  return agencies.map((agency) => ({
    agencyName: agency.agencyName,
    email: agency.user.email,
    status: agency.user.status,
    totalProfiles: agency.LabourProfile.length,
    approvedProfiles: agency.LabourProfile.filter(
      (p) => p.status === "APPROVED"
    ).length,
    licenseNumber: agency.licenseNumber,
  }));
}

async function getAdminLabour() {
  const labourProfiles = await prisma.labourProfile.findMany({
    include: {
      agency: { select: { agencyName: true } },
      LabourAssignment: { select: { id: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return labourProfiles.map((labour) => ({
    name: labour.name,
    agency: labour.agency.agencyName,
    nationality: labour.nationality,
    status: labour.status,
    currentStage: labour.currentStage,
    assignments: labour.LabourAssignment.length,
    createdAt: labour.createdAt.toISOString().split("T")[0],
  }));
}

async function getAdminPerformance() {
  const [totalRequirements, completedRequirements] = await Promise.all([
    prisma.requirement.count(),
    prisma.requirement.count({ where: { status: "COMPLETED" } }),
  ]);

  const successRate =
    totalRequirements > 0
      ? Math.round((completedRequirements / totalRequirements) * 100)
      : 0;

  return {
    totalRequirements: Number(totalRequirements),
    completedRequirements: Number(completedRequirements),
    successRate,
    avgCompletionTime: "15 days",
  };
}

async function getAdminTrends() {
  const monthlyData = await prisma.$queryRaw<
    Array<{
      month: Date;
      count: number;
    }>
  >`
    SELECT 
      DATE_TRUNC('month', "createdAt") as month,
      COUNT(*)::integer as count
    FROM "Requirement"
    WHERE "createdAt" >= DATE_TRUNC('year', NOW())
    GROUP BY DATE_TRUNC('month', "createdAt")
    ORDER BY month ASC
  `;

  return monthlyData.map((item) => ({
    month: item.month.toISOString().split("T")[0],
    count: item.count,
  }));
}

async function getAdminMetrics() {
  return {
    avgProcessingTime: "15 days",
    clientSatisfaction: "4.8/5",
    agencyPerformance: "92%",
  };
}

async function getSystemHealth() {
  return {
    uptime: "99.9%",
    activeUsers: await prisma.user.count({ where: { status: "VERIFIED" } }),
    systemLoad: "Normal",
  };
}

async function getAuditLogs() {
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      performedBy: {
        select: {
          name: true,
        },
      },
    },
  });

  return logs.map((log) => ({
    action: log.action,
    performedBy: log.performedBy.name,
    entityType: log.entityType,
    description: log.description,
    createdAt: log.createdAt.toISOString(),
  }));
}

async function getNotificationStats() {
  const stats = await prisma.notification.groupBy({
    by: ["type"],
    _count: { id: true },
  });

  return stats.map((stat) => ({
    type: stat.type,
    count: stat._count.id,
  }));
}

// Client Data Functions
async function getClientSummary(userId: string) {
  const client = await prisma.client.findUnique({
    where: { userId },
    include: {
      Requirement: {
        select: {
          id: true,
          status: true,
          jobRoles: {
            select: {
              quantity: true,
            },
          },
        },
      },
    },
  });

  const totalPositions =
    client?.Requirement.reduce(
      (sum, req) =>
        sum + req.jobRoles.reduce((jrSum, jr) => jrSum + jr.quantity, 0),
      0
    ) || 0;

  const completedPositions =
    client?.Requirement.filter((req) => req.status === "COMPLETED").reduce(
      (sum, req) =>
        sum + req.jobRoles.reduce((jrSum, jr) => jrSum + jr.quantity, 0),
      0
    ) || 0;

  return {
    companyName: client?.companyName,
    totalRequirements: client?.Requirement.length || 0,
    completedRequirements:
      client?.Requirement.filter((r) => r.status === "COMPLETED").length || 0,
    totalPositions,
    completedPositions,
    completionRate:
      totalPositions > 0
        ? Math.round((completedPositions / totalPositions) * 100)
        : 0,
  };
}

async function getClientRequirements(userId: string) {
  const client = await prisma.client.findUnique({
    where: { userId },
    include: {
      Requirement: {
        include: {
          jobRoles: {
            select: {
              title: true,
              quantity: true,
              LabourAssignment: {
                select: {
                  labour: {
                    select: {
                      name: true,
                      status: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  return (
    client?.Requirement.map((req) => ({
      id: req.id,
      status: req.status,
      jobRoles: req.jobRoles.map((jr) => jr.title).join(", "), // Only show titles
      positionsFilled: req.jobRoles.reduce(
        (sum, jr) => sum + jr.LabourAssignment.length,
        0
      ),
      totalPositions: req.jobRoles.reduce((sum, jr) => sum + jr.quantity, 0),
      createdAt: req.createdAt.toISOString().split("T")[0],
      updatedAt: req.updatedAt.toISOString().split("T")[0],
    })) || []
  );
}

async function getClientLabour(userId: string) {
  const assignments = await prisma.labourAssignment.findMany({
    where: {
      jobRole: {
        requirement: {
          client: { userId },
        },
      },
    },
    include: {
      labour: {
        select: {
          name: true,
          nationality: true,
          currentStage: true,
          status: true,
        },
      },
      jobRole: {
        include: {
          requirement: {
            select: {
              id: true,
            },
          },
        },
      },
    },
  });

  return assignments.map((assignment) => ({
    labourName: assignment.labour.name,
    nationality: assignment.labour.nationality,
    status: assignment.labour.status,
    currentStage: assignment.labour.currentStage,
    requirementId: assignment.jobRole.requirement.id,
    assignmentStatus: assignment.adminStatus,
  }));
}

async function getClientDeployedLabour(userId: string) {
  const deployed = await prisma.labourAssignment.findMany({
    where: {
      jobRole: {
        requirement: {
          client: { userId },
        },
      },
      labour: { currentStage: "DEPLOYED" },
    },
    include: {
      labour: {
        select: {
          name: true,
          nationality: true,
        },
      },
      jobRole: {
        include: {
          requirement: {
            select: {
              id: true,
            },
          },
        },
      },
    },
  });

  return deployed.map((d) => ({
    name: d.labour.name,
    nationality: d.labour.nationality,
    requirementId: d.jobRole.requirement.id,
    deployedAt: d.updatedAt.toISOString().split("T")[0],
  }));
}

async function getClientActiveLabour(userId: string) {
  const active = await prisma.labourAssignment.findMany({
    where: {
      jobRole: {
        requirement: {
          client: { userId },
        },
      },
      labour: {
        currentStage: {
          not: "DEPLOYED",
        },
      },
    },
    include: {
      labour: {
        select: {
          name: true,
          nationality: true,
          currentStage: true,
        },
      },
      jobRole: {
        include: {
          requirement: {
            select: {
              id: true,
            },
          },
        },
      },
    },
  });

  return active.map((a) => ({
    name: a.labour.name,
    nationality: a.labour.nationality,
    currentStage: a.labour.currentStage,
    requirementId: a.jobRole.requirement.id,
  }));
}

async function getClientPendingLabour(userId: string) {
  const pending = await prisma.labourAssignment.findMany({
    where: {
      jobRole: {
        requirement: {
          client: { userId },
        },
      },
      adminStatus: "PENDING",
    },
    include: {
      labour: {
        select: {
          name: true,
          nationality: true,
        },
      },
      jobRole: {
        include: {
          requirement: {
            select: {
              id: true,
            },
          },
        },
      },
    },
  });

  return pending.map((p) => ({
    name: p.labour.name,
    nationality: p.labour.nationality,
    requirementId: p.jobRole.requirement.id,
    pendingSince: p.createdAt.toISOString().split("T")[0],
  }));
}

async function getClientRequirementsStatus(userId: string) {
  const client = await prisma.client.findUnique({
    where: { userId },
    include: {
      Requirement: { select: { status: true } },
    },
  });

  const statusCounts =
    client?.Requirement.reduce(
      (acc: Record<string, number>, req) => {
        acc[req.status] = (acc[req.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    ) || {};

  return statusCounts;
}

// Agency Data Functions
async function getAgencySummary(userId: string) {
  const agency = await prisma.agency.findUnique({
    where: { userId },
    include: {
      LabourProfile: {
        select: {
          id: true,
          status: true,
          currentStage: true,
        },
      },
      LabourAssignment: {
        select: {
          id: true,
          adminStatus: true,
          labour: {
            select: {
              currentStage: true,
            },
          },
        },
      },
    },
  });

  const deployedCount =
    agency?.LabourAssignment.filter(
      (la) => la.labour.currentStage === "DEPLOYED"
    ).length || 0;

  return {
    agencyName: agency?.agencyName,
    totalProfiles: agency?.LabourProfile.length || 0,
    approvedProfiles:
      agency?.LabourProfile.filter((p) => p.status === "APPROVED").length || 0,
    deployedProfiles: deployedCount,
    totalAssignments: agency?.LabourAssignment.length || 0,
    completedAssignments:
      agency?.LabourAssignment.filter((a) => a.adminStatus === "COMPLETED")
        .length || 0,
  };
}

async function getAgencyProfiles(userId: string) {
  const agency = await prisma.agency.findUnique({
    where: { userId },
    include: {
      LabourProfile: {
        include: {
          LabourAssignment: {
            include: {
              jobRole: {
                include: {
                  requirement: {
                    select: {
                      id: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  return (
    agency?.LabourProfile.map((profile) => ({
      name: profile.name,
      nationality: profile.nationality,
      status: profile.status,
      currentStage: profile.currentStage,
      assignments: profile.LabourAssignment.length,
      requirementIds: Array.from(
        new Set(profile.LabourAssignment.map((a) => a.jobRole.requirement.id))
      ).join(", "),
    })) || []
  );
}

async function getAgencyAssignments(userId: string) {
  const assignments = await prisma.labourAssignment.findMany({
    where: {
      agency: { userId },
    },
    include: {
      labour: {
        select: {
          name: true,
          nationality: true,
          status: true,
        },
      },
      jobRole: {
        include: {
          requirement: {
            select: {
              id: true,
            },
          },
        },
      },
    },
  });

  return assignments.map((assignment) => ({
    labourName: assignment.labour.name,
    nationality: assignment.labour.nationality,
    status: assignment.labour.status,
    requirementId: assignment.jobRole.requirement.id,
    assignmentStatus: assignment.adminStatus,
    lastUpdated: assignment.updatedAt.toISOString().split("T")[0],
  }));
}

async function getAgencyProfileStatus(userId: string) {
  const agency = await prisma.agency.findUnique({
    where: { userId },
    include: {
      LabourProfile: { select: { status: true } },
    },
  });

  const statusCounts =
    agency?.LabourProfile.reduce(
      (acc: Record<string, number>, profile) => {
        acc[profile.status] = (acc[profile.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    ) || {};

  return statusCounts;
}

async function getAgencyDeployed(userId: string) {
  const deployed = await prisma.labourAssignment.findMany({
    where: {
      agency: { userId },
      labour: { currentStage: "DEPLOYED" },
    },
    include: {
      labour: {
        select: {
          name: true,
          nationality: true,
        },
      },
      jobRole: {
        include: {
          requirement: {
            select: {
              id: true,
            },
          },
        },
      },
    },
  });

  return deployed.map((d) => ({
    name: d.labour.name,
    nationality: d.labour.nationality,
    requirementId: d.jobRole.requirement.id,
    deployedAt: d.updatedAt.toISOString().split("T")[0],
  }));
}

async function getAgencySuccessRate(userId: string) {
  const agency = await prisma.agency.findUnique({
    where: { userId },
    include: {
      LabourAssignment: { select: { labour: { select: { status: true } } } },
    },
  });

  const totalAssignments = agency?.LabourAssignment.length || 0;
  const successfulAssignments =
    agency?.LabourAssignment.filter(
      (a) => a.labour.status === "SHORTLISTED" || a.labour.status === "DEPLOYED"
    ).length || 0;

  return {
    totalAssignments,
    successfulAssignments,
    successRate:
      totalAssignments > 0
        ? Math.round((successfulAssignments / totalAssignments) * 100)
        : 0,
  };
}

function generateExcelReport(data: unknown, fileName: string) {
  const workbook = XLSX.utils.book_new();

  // Create worksheets for each data section
  Object.entries(data as Record<string, unknown>).forEach(
    ([sheetName, sheetData]) => {
      if (Array.isArray(sheetData)) {
        const worksheet = XLSX.utils.json_to_sheet(sheetData);
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      } else if (typeof sheetData === "object" && sheetData !== null) {
        const flattenedData = flattenObject(sheetData);
        const worksheet = XLSX.utils.json_to_sheet([flattenedData]);
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      }
    }
  );

  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

  return new Response(buffer, {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${fileName}.xlsx"`,
    },
  });
}

async function generatePDFReport(
  data: unknown,
  title: string,
  fileName: string
) {
  const html = generatePDFHTML(data, title);

  const puppeteer = await getPuppeteer();
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox"],
  });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });
  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
    margin: { top: "20mm", right: "20mm", bottom: "20mm", left: "20mm" },
  });
  await browser.close();

  const nodeBuffer = Buffer.isBuffer(pdfBuffer)
    ? pdfBuffer
    : Buffer.from(pdfBuffer);

  return new Response(new Uint8Array(nodeBuffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${fileName}.pdf"`,
    },
  });
}

function generatePDFHTML(data: unknown, title: string) {
  const summary = (data as any)?.summary || {};
  const logoUrl = process.env.NEXT_PUBLIC_LOGO_URL;

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>${title}</title>
      <style>
        @page { size: A4; margin: 0; }
        body { margin: 0; padding: 0; font-family: Arial, sans-serif; background: #fff; color: #222; font-size: 11px; }
        .container { width: 210mm; min-height: 297mm; padding: 20mm; box-sizing: border-box; }
        .letterhead {
          display: flex;
          align-items: flex-start;
          border-bottom: 2px solid #2C0053;
          padding-bottom: 10px;
          margin-bottom: 18px;
        }
        .logo {
          height: 48px;
          margin-right: 18px;
        }
        .company-info {
          flex: 1;
        }
        .company-name {
          font-size: 22px;
          font-weight: bold;
          color: #2C0053;
          letter-spacing: 1px;
        }
        .tagline {
          font-size: 13px;
          color: #2C0053;
          font-weight: 500;
          margin-bottom: 2px;
        }
        .desc {
          font-size: 11px;
          color: #666;
          margin-bottom: 4px;
        }
        .contact-info {
          font-size: 11px;
          color: #444;
          margin-top: 2px;
        }
        .contact-info span {
          display: inline-block;
          margin-right: 18px;
        }
        .report-title {
          font-size: 20px;
          font-weight: bold;
          color: #2C0053;
          margin-bottom: 2px;
        }
        .report-date {
          font-size: 12px;
          color: #888;
          margin-bottom: 12px;
        }
        .summary-section {
          background: #f8f9fa;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 16px 20px;
          margin-bottom: 22px;
          display: flex;
          flex-wrap: wrap;
          gap: 24px;
        }
        .summary-item {
          min-width: 120px;
          flex: 1 1 120px;
          margin-bottom: 4px;
        }
        .summary-label {
          font-size: 12px;
          color: #666;
        }
        .summary-value {
          font-size: 18px;
          font-weight: bold;
          color: #2C0053;
        }
        .section {
          margin-bottom: 18px;
        }
        .section-title {
          font-size: 15px;
          font-weight: bold;
          color: #2C0053;
          margin-bottom: 8px;
          border-left: 4px solid #2C0053;
          padding-left: 10px;
        }
        .table-wrapper {
          overflow-x: auto;
          width: 100%;
        }
        .table {
          width: 100%;
          border-collapse: collapse;
          font-size: 10px;
          table-layout: fixed;
          word-break: break-word;
        }
        .table th, .table td {
          border: 1px solid #ddd;
          padding: 6px 4px;
          text-align: left;
          max-width: 120px;
          word-break: break-word;
        }
        .table th {
          background-color: #f3f4f6;
          font-weight: bold;
        }
        .table tr {
          page-break-inside: avoid;
        }
        .footer {
          margin-top: 30px;
          text-align: center;
          font-size: 10px;
          color: #888;
          border-top: 1px solid #eee;
          padding-top: 10px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="letterhead">
          <img src="${logoUrl}" class="logo" alt="Findly Logo" />
          <div class="company-info">
            <div class="tagline">Skilled Workforce, Seamlessly Delivered.</div>
            <div class="desc">Specializing in end-to-end foreign labor recruitment with a focus on transparency and efficiency.</div>
            <div class="contact-info">
              <span>Email: info@findlyqatar.com</span>
              <span>Phone: +974 1234 5678</span>
              <span>Location: Doha, Qatar</span>
            </div>
          </div>
        </div>
        <div class="report-title">${title}</div>
        <div class="report-date">Generated on ${new Date().toLocaleDateString()}</div>
        ${
          Object.keys(summary).length > 0
            ? `
        <div class="summary-section">
          ${Object.entries(summary)
            .map(
              ([key, value]) => `
              <div class="summary-item">
                <div class="summary-label">${key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}</div>
                <div class="summary-value">${value}</div>
              </div>
            `
            )
            .join("")}
        </div>
        `
            : ""
        }
        ${generatePDFContent(data)}
        <div class="footer">
          <p>This report was generated automatically by Findly. &copy; ${new Date().getFullYear()} Findly. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generatePDFContent(data: unknown): string {
  let content = "";
  Object.entries(data as Record<string, unknown>).forEach(
    ([sectionName, sectionData]) => {
      if (sectionName === "summary") return; // skip summary, already rendered

      content += `<div class="section">
        <div class="section-title">${capitalizeFirstLetter(sectionName)}</div>`;

      if (Array.isArray(sectionData)) {
        if (sectionData.length > 0) {
          const headers = Object.keys(sectionData[0] as object);
          content += `<div class="table-wrapper"><table class="table">
            <thead><tr>${headers.map((h) => `<th>${formatHeader(h)}</th>`).join("")}</tr></thead>
            <tbody>${sectionData
              .map(
                (row) =>
                  `<tr>${headers.map((h) => `<td>${formatCellValue((row as Record<string, unknown>)[h])}</td>`).join("")}</tr>`
              )
              .join("")}</tbody>
          </table></div>`;
        } else {
          content += `<p>No data available</p>`;
        }
      } else if (typeof sectionData === "object" && sectionData !== null) {
        content += `<div class="summary-grid">`;
        Object.entries(sectionData as Record<string, unknown>).forEach(
          ([key, value]) => {
            content += `<div class="summary-item">
              <div class="summary-label">${formatHeader(key)}</div>
              <div class="summary-value">${formatCellValue(value)}</div>
            </div>`;
          }
        );
        content += `</div>`;
      }
      content += `</div>`;
    }
  );
  return content;
}

function formatHeader(header: string): string {
  return header
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .replace(/_/g, " ");
}

function formatCellValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number") return value.toString();
  if (typeof value === "bigint") return value.toString(); // Handle BigInt
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) return value.join(", ");
  if (value instanceof Date) return value.toISOString().split("T")[0];
  try {
    return JSON.stringify(value);
  } catch (e) {
    return String(value);
  }
}

function flattenObject(obj: unknown, prefix = ""): Record<string, unknown> {
  const flattened: Record<string, unknown> = {};

  if (typeof obj === "object" && obj !== null) {
    Object.entries(obj as Record<string, unknown>).forEach(([key, value]) => {
      const newKey = prefix ? `${prefix}.${key}` : key;

      if (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value)
      ) {
        Object.assign(flattened, flattenObject(value, newKey));
      } else {
        flattened[newKey] = value;
      }
    });
  }

  return flattened;
}
