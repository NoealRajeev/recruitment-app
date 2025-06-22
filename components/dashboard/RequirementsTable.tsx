"use client";

import { format } from "date-fns";
import Link from "next/link";

interface RequirementsTableProps {
  requirements: Array<{
    id: string;
    jobRoles: Array<{
      id: string;
      title: string;
      quantity: number;
      filled: number;
      progress: number;
    }>;
    status: string;
    createdAt: Date;
    updatedAt: Date;
  }>;
}

const RequirementsTable = ({ requirements }: RequirementsTableProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "DRAFT":
        return { color: "gray", text: "Draft" };
      case "SUBMITTED":
        return { color: "blue", text: "Submitted" };
      case "UNDER_REVIEW":
        return { color: "yellow", text: "In Review" };
      case "COMPLETED":
        return { color: "green", text: "Completed" };
      case "REJECTED":
        return { color: "red", text: "Rejected" };
      default:
        return { color: "gray", text: status };
    }
  };

  return (
    <div className="bg-purple-100 p-6 rounded-xl shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Recent Requirements</h2>
        <Link
          href="/dashboard/client/requirements"
          className="text-sm text-purple-700 hover:underline"
        >
          View All
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="text-gray-600 border-b">
              <th className="py-2">Job Role</th>
              <th>Positions</th>
              <th>Progress</th>
              <th>Status</th>
              <th>Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {requirements.flatMap((req) =>
              req.jobRoles.map((role) => {
                const status = getStatusColor(req.status);
                return (
                  <tr key={`${req.id}-${role.id}`} className="border-t">
                    <td className="py-2">
                      <Link
                        href={`/dashboard/client/requirements/${req.id}`}
                        className="text-purple-700 hover:underline"
                      >
                        {role.title}
                      </Link>
                    </td>
                    <td>
                      {role.filled}/{role.quantity}
                    </td>
                    <td>
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            role.progress >= 75
                              ? "bg-green-500"
                              : role.progress >= 50
                                ? "bg-blue-500"
                                : role.progress >= 25
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                          }`}
                          style={{ width: `${role.progress}%` }}
                        ></div>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          status.color === "green"
                            ? "bg-green-100 text-green-700"
                            : status.color === "yellow"
                              ? "bg-yellow-100 text-yellow-700"
                              : status.color === "red"
                                ? "bg-red-100 text-red-700"
                                : status.color === "blue"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {status.text}
                      </span>
                    </td>
                    <td>{format(new Date(req.updatedAt), "MMM d, yyyy")}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RequirementsTable;
