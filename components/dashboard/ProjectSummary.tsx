"use client";

import { Select } from "../ui/select";
import { format } from "date-fns";

interface ProjectSummaryProps {
  requirements: Array<{
    id: string;
    status: string;
    createdAt: Date;
    client: { companyName: string; user: { email: string } };
    jobRoles: Array<{ title: string }>;
  }>;
}

const ProjectSummary = ({ requirements }: ProjectSummaryProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return { color: "green", text: "Completed" };
      case "UNDER_REVIEW":
        return { color: "yellow", text: "In Review" };
      case "REJECTED":
        return { color: "red", text: "Rejected" };
      case "DRAFT":
        return { color: "gray", text: "Draft" };
      default:
        return { color: "blue", text: status };
    }
  };

  return (
    <div className="bg-purple-100 p-4 sm:p-6 rounded-xl shadow mt-6 sm:mt-9">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <h2 className="text-base sm:text-lg font-semibold">Recent Requests</h2>
        <div className="flex gap-2">
          <Select
            label="Time"
            name="time"
            showLabelAsPlaceholder
            options={[
              { value: "week", label: "Last Week" },
              { value: "month", label: "Last Month" },
            ]}
            className="rounded-md p-1 text-sm border !h-8"
          />
          <Select
            label="Status"
            name="status"
            showLabelAsPlaceholder
            options={[
              { value: "all", label: "All Statuses" },
              { value: "completed", label: "Completed" },
              { value: "pending", label: "Pending" },
            ]}
            className="rounded-md p-1 text-sm border !h-8"
          />
        </div>
      </div>

      {/* Mobile: cards */}
      <div className="md:hidden space-y-3">
        {requirements.map((req) => {
          const status = getStatusColor(req.status);
          return (
            <div key={req.id} className="rounded-lg bg-white/60 p-3">
              <div className="flex items-center justify-between">
                <div className="font-medium text-[#2C0053]">
                  {req.client.companyName}
                </div>
                <span
                  className={`px-2 py-0.5 text-[10px] rounded-full ${
                    status.color === "green"
                      ? "bg-green-100 text-green-700"
                      : status.color === "yellow"
                        ? "bg-yellow-100 text-yellow-700"
                        : status.color === "red"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {status.text}
                </span>
              </div>
              <div className="text-xs text-gray-600 mt-1">
                {req.client.user.email}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {format(new Date(req.createdAt), "MMM d, yyyy")}
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop: table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="text-gray-600 border-b">
              <th className="py-2">Company Name</th>
              <th>Email</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {requirements.map((req) => {
              const status = getStatusColor(req.status);
              return (
                <tr key={req.id} className="border-t">
                  <td className="py-2">{req.client.companyName}</td>
                  <td>{req.client.user.email}</td>
                  <td>{format(new Date(req.createdAt), "MMM d, yyyy")}</td>
                  <td>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        status.color === "green"
                          ? "bg-green-100 text-green-700"
                          : status.color === "yellow"
                            ? "bg-yellow-100 text-yellow-700"
                            : status.color === "red"
                              ? "bg-red-100 text-red-700"
                              : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {status.text}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProjectSummary;
