// components/dashboard/LabourProfilesTable.tsx
"use client";

import { format } from "date-fns";
import { Check, X, Clock } from "lucide-react";
import Link from "next/link";

interface LabourProfilesTableProps {
  profiles: Array<{
    id: string;
    name: string;
    nationality: string;
    status: string;
    verificationStatus: string;
    createdAt: Date;
    documents: Array<{
      type: string;
      status: string;
    }>;
  }>;
}

const LabourProfilesTable = ({ profiles }: LabourProfilesTableProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return { color: "green", text: "Approved" };
      case "PENDING":
        return { color: "yellow", text: "Pending" };
      case "REJECTED":
        return { color: "red", text: "Rejected" };
      case "DEPLOYED":
        return { color: "blue", text: "Deployed" };
      default:
        return { color: "gray", text: status };
    }
  };

  const VerificationStatusIcon = ({ status }: { status: string }) => {
    switch (status) {
      case "VERIFIED":
        return <Check className="w-4 h-4 text-green-500" />;
      case "PARTIALLY_VERIFIED":
        return <Check className="w-4 h-4 text-yellow-500" />;
      case "REJECTED":
        return <X className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="bg-purple-100 p-6 rounded-xl shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Recent Labour Profiles</h2>
        <Link
          href="/dashboard/agency/candidates"
          className="text-sm text-purple-700 hover:underline"
        >
          View All
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="text-gray-600 border-b">
              <th className="py-2">Name</th>
              <th>Nationality</th>
              <th>Date Added</th>
              <th>Status</th>
              <th>Verification</th>
            </tr>
          </thead>
          <tbody>
            {profiles.map((profile) => {
              const status = getStatusColor(profile.status);
              return (
                <tr key={profile.id} className="border-t">
                  <td className="py-2">
                    <Link
                      href={`/dashboard/agency/candidates/${profile.id}`}
                      className="text-purple-700 hover:underline"
                    >
                      {profile.name}
                    </Link>
                  </td>
                  <td>{profile.nationality}</td>
                  <td>{format(new Date(profile.createdAt), "MMM d, yyyy")}</td>
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
                  <td>
                    <div className="flex items-center gap-1">
                      <VerificationStatusIcon
                        status={profile.verificationStatus}
                      />
                      <span className="text-xs">
                        {profile.verificationStatus.replace("_", " ")}
                      </span>
                    </div>
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

export default LabourProfilesTable;
