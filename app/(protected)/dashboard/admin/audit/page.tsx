// app/(protected)/dashboard/admin/audit/page.tsx
import { AuditAction } from "@prisma/client";
import { Search, Filter } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

interface SearchParams {
  query?: string;
  filter?: string;
  page?: string;
}

export default async function Audit({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  // Server-side session check
  const session = await getServerSession(authOptions);

  // Redirect if not admin
  if (!session?.user || session.user.role !== "RECRUITMENT_ADMIN") {
    redirect("/dashboard");
  }

  // Build the where clause for filtering with proper Prisma types
  const where: Prisma.AuditLogWhereInput = {
    AND: [
      searchParams.query
        ? {
            OR: [
              {
                description: {
                  contains: searchParams.query,
                  mode: "insensitive",
                },
              },
              {
                entityType: {
                  contains: searchParams.query,
                  mode: "insensitive",
                },
              },
              {
                entityId: { contains: searchParams.query, mode: "insensitive" },
              },
              {
                performedBy: {
                  OR: [
                    {
                      name: {
                        contains: searchParams.query,
                        mode: "insensitive",
                      },
                    },
                    {
                      email: {
                        contains: searchParams.query,
                        mode: "insensitive",
                      },
                    },
                  ],
                },
              },
            ],
          }
        : {},
      searchParams.filter && searchParams.filter !== "ALL"
        ? { action: { startsWith: searchParams.filter.split(" - ")[0] } }
        : {},
    ],
  };

  // Pagination
  const page = parseInt(searchParams.page || "1");
  const pageSize = 20;
  const skip = (page - 1) * pageSize;

  // Fetch audit logs with filtering
  const [auditLogs, totalCount] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: {
        performedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    }),
    prisma.auditLog.count({ where }),
  ]);

  // Format date for display
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  // Format time for display
  const formatTime = (date: Date) => {
    return (
      new Date(date).toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }) +
      "." +
      new Date(date).getMilliseconds().toString().padStart(3, "0")
    );
  };

  // Get color based on action type
  const getLogTypeColor = (action: AuditAction) => {
    if (action.includes("ERROR") || action.includes("FAILED")) {
      return "border-l-4 border-red-500";
    }
    if (action.includes("WARNING")) {
      return "border-l-4 border-yellow-500";
    }
    if (
      action.includes("SUCCESS") ||
      action.includes("CREATED") ||
      action.includes("UPDATED")
    ) {
      return "border-l-4 border-green-500";
    }
    return "border-l-4 border-blue-500";
  };

  // Calculate pagination
  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="p-6 space-y-6 bg-[#F8F6FB] min-h-screen">
      {/* Header Section */}
      <div className="bg-[#EDDDF3] rounded-lg p-4 flex items-center gap-4">
        {/* Filter Dropdown */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#150B3D]/70" />
          <select
            defaultValue={searchParams.filter || "ALL"}
            className="bg-white border border-[#635372]/30 rounded px-3 py-1.5 text-sm text-[#150B3D] focus:outline-none focus:ring-2 focus:ring-[#150B3D]/20"
          >
            <option value="ALL">All Actions</option>
            <option value="CREATE - Logs">Create Actions</option>
            <option value="UPDATE - Logs">Update Actions</option>
            <option value="DELETE - Logs">Delete Actions</option>
            <option value="ERROR - Logs">Error Actions</option>
          </select>
        </div>

        {/* Search Input */}
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#150B3D]/50" />
          <input
            type="text"
            placeholder="Search logs..."
            defaultValue={searchParams.query || ""}
            className="w-full pl-10 pr-4 py-1.5 border border-[#635372]/30 rounded-md text-sm text-[#150B3D] placeholder-[#150B3D]/50 focus:outline-none focus:ring-2 focus:ring-[#150B3D]/20 bg-white"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="text-sm text-[#150B3D]/70 font-medium">
        Showing {auditLogs.length} of {totalCount} event/s
        {searchParams.query && ` matching "${searchParams.query}"`}
      </div>

      {/* Log Entries */}
      <div className="bg-[#EDDDF3]/40 rounded-lg overflow-hidden shadow-sm">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-[#EDDDF3]/40 border-b border-[#635372]/20">
          <div className="col-span-2 text-sm font-semibold text-[#150B3D] uppercase tracking-wide">
            DATE
          </div>
          <div className="col-span-2 text-sm font-semibold text-[#150B3D] uppercase tracking-wide">
            ACTION
          </div>
          <div className="col-span-2 text-sm font-semibold text-[#150B3D] uppercase tracking-wide">
            ENTITY
          </div>
          <div className="col-span-4 text-sm font-semibold text-[#150B3D] uppercase tracking-wide">
            DESCRIPTION
          </div>
          <div className="col-span-2 text-sm font-semibold text-[#150B3D] uppercase tracking-wide">
            PERFORMED BY
          </div>
        </div>

        {/* Log Entries */}
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
                  {log.description || "No description"}
                </div>
                <div className="col-span-2 text-sm text-[#150B3D]">
                  {log.performedBy?.name || "System"}
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
                ...(searchParams.query && { query: searchParams.query }),
                ...(searchParams.filter && { filter: searchParams.filter }),
                page: (page - 1).toString(),
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
                ...(searchParams.query && { query: searchParams.query }),
                ...(searchParams.filter && { filter: searchParams.filter }),
                page: (page + 1).toString(),
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
