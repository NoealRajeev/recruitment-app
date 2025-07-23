// app/(protected)/dashboard/admin/audit/page.tsx
import { AuditAction } from "@prisma/client";
import { Search, Filter } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export default async function Audit({ searchParams }) {
  // Server-side session check
  const session = await getServerSession(authOptions);

  // Redirect if not admin
  if (!session?.user || session.user.role !== "RECRUITMENT_ADMIN") {
    redirect("/dashboard");
  }

  // Narrow incoming params to strings
  const query: string | undefined =
    typeof searchParams.query === "string" ? searchParams.query : undefined;
  const filter: string | undefined =
    typeof searchParams.filter === "string" ? searchParams.filter : undefined;
  const pageNum = parseInt(
    typeof searchParams.page === "string" ? searchParams.page : "1",
    10
  );
  const page = Number.isNaN(pageNum) || pageNum < 1 ? 1 : pageNum;

  // Build the where clause for filtering
  const where: Prisma.AuditLogWhereInput = {
    AND: [
      query
        ? {
            OR: [
              { description: { contains: query, mode: "insensitive" } },
              { entityType: { contains: query, mode: "insensitive" } },
              { entityId: { contains: query, mode: "insensitive" } },
              {
                performedBy: {
                  OR: [
                    { name: { contains: query, mode: "insensitive" } },
                    { email: { contains: query, mode: "insensitive" } },
                  ],
                },
              },
            ],
          }
        : {},
      filter && filter !== "ALL"
        ? { action: { startsWith: filter.split(" - ")[0] } }
        : {},
    ],
  };

  // Pagination
  const pageSize = 20;
  const skip = (page - 1) * pageSize;

  // Fetch audit logs and count
  const [auditLogs, totalCount] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: {
        performedBy: {
          select: { id: true, name: true, email: true },
        },
      },
    }),
    prisma.auditLog.count({ where }),
  ]);

  // Helpers for formatting
  const formatDate = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const formatTime = (d: Date) =>
    `${d.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })}.${d.getMilliseconds().toString().padStart(3, "0")}`;
  const getLogTypeColor = (action: AuditAction) => {
    if (action.includes("ERROR") || action.includes("FAILED"))
      return "border-l-4 border-red-500";
    if (action.includes("WARNING")) return "border-l-4 border-yellow-500";
    if (
      action.includes("SUCCESS") ||
      action.includes("CREATED") ||
      action.includes("UPDATED")
    )
      return "border-l-4 border-green-500";
    return "border-l-4 border-blue-500";
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="p-6 space-y-6 bg-[#F8F6FB] min-h-screen">
      {/* Header: filter + search */}
      <div className="bg-[#EDDDF3] rounded-lg p-4 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#150B3D]/70" />
          <select
            defaultValue={filter || "ALL"}
            className="bg-white border border-[#635372]/30 rounded px-3 py-1.5 text-sm text-[#150B3D] focus:outline-none focus:ring-2 focus:ring-[#150B3D]/20"
          >
            <option value="ALL">All Actions</option>
            <option value="CREATE - Logs">Create Actions</option>
            <option value="UPDATE - Logs">Update Actions</option>
            <option value="DELETE - Logs">Delete Actions</option>
            <option value="ERROR - Logs">Error Actions</option>
          </select>
        </div>
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#150B3D]/50" />
          <input
            type="text"
            placeholder="Search logs..."
            defaultValue={query || ""}
            className="w-full pl-10 pr-4 py-1.5 border border-[#635372]/30 rounded-md text-sm text-[#150B3D] placeholder-[#150B3D]/50 focus:outline-none focus:ring-2 focus:ring-[#150B3D]/20 bg-white"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="text-sm text-[#150B3D]/70 font-medium">
        Showing {auditLogs.length} of {totalCount} event
        {totalCount === 1 ? "" : "s"}
        {query && ` matching "${query}"`}
      </div>

      {/* Logs table */}
      <div className="bg-[#EDDDF3]/40 rounded-lg overflow-hidden shadow-sm">
        {/* Header row */}
        <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-[#EDDDF3]/40 border-b border-[#635372]/20">
          {["DATE", "ACTION", "ENTITY", "DESCRIPTION", "PERFORMED BY"].map(
            (label, idx) => (
              <div
                key={idx}
                className="text-sm font-semibold text-[#150B3D] uppercase tracking-wide"
              >
                {label}
              </div>
            )
          )}
        </div>
        {/* Data rows */}
        <div className="divide-y divide-[#635372]/10">
          {auditLogs.length > 0 ? (
            auditLogs.map((log) => (
              <div
                key={log.id}
                className={`grid grid-cols-12 gap-4 px-6 py-3 hover:bg-[#F8F6FB]/50 transition-colors ${getLogTypeColor(
                  log.action
                )}`}
              >
                <div className="col-span-2 text-sm text-[#150B3D]/70 font-mono">
                  {formatDate(log.createdAt)} {formatTime(log.createdAt)}
                </div>
                <div className="col-span-2 text-sm text-[#150B3D] font-medium">
                  {log.action.replace(/_/g, " ")}
                </div>
                <div className="col-span-2 text-sm text-[#150B3D]">
                  {log.entityType}
                </div>
                <div className="col-span-4 text-sm text-[#150B3D]">
                  {log.description ?? "No description"}
                </div>
                <div className="col-span-2 text-sm text-[#150B3D]">
                  {log.performedBy?.name ?? "System"}
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-[#150B3D]/70">
              No audit logs found
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4">
          {page > 1 && (
            <a
              href={`?${new URLSearchParams({
                ...(query ? { query } : {}),
                ...(filter ? { filter } : {}),
                page: String(page - 1),
              })}`}
              className="px-4 py-2 bg-[#EDDDF3] rounded-md hover:bg-[#E5D0ED]"
            >
              Previous
            </a>
          )}
          <span className="text-sm text-[#150B3D]/70">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <a
              href={`?${new URLSearchParams({
                ...(query ? { query } : {}),
                ...(filter ? { filter } : {}),
                page: String(page + 1),
              })}`}
              className="px-4 py-2 bg-[#EDDDF3] rounded-md hover:bg-[#E5D0ED]"
            >
              Next
            </a>
          )}
        </div>
      )}
    </div>
  );
}
