// app/(protected)/dashboard/admin/requirements/page.tsx
"use client";

import { useState } from "react";

interface Company {
  id: number;
  name: string;
  status: "review pending" | "rejected" | "not verified" | "verified";
  timeAgo: string;
}

interface RequirementSection {
  title: string;
  fields: {
    label: string;
    value: string | number;
  }[];
  hasActions?: boolean;
}

export default function Requirements() {
  const [selectedCompany, setSelectedCompany] = useState<number>(1);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "review pending":
        return "text-[#C86300]";
      case "rejected":
        return "text-[#ED1C24]";
      case "not verified":
        return "text-[#150B3D]/70";
      case "verified":
        return "text-[#00C853]";
      default:
        return "text-[#150B3D]/70";
    }
  };

  // Mock data for companies
  const companies: Company[] = [
    {
      id: 1,
      name: "Company 1",
      status: "review pending",
      timeAgo: "5 min ago",
    },
    {
      id: 2,
      name: "Company 2",
      status: "review pending",
      timeAgo: "10 min ago",
    },
    {
      id: 3,
      name: "Company 3",
      status: "not verified",
      timeAgo: "30 min ago",
    },
    {
      id: 4,
      name: "Company 4",
      status: "review pending",
      timeAgo: "45 min ago",
    },
    {
      id: 5,
      name: "Company 5",
      status: "review pending",
      timeAgo: "1 hr ago",
    },
    {
      id: 6,
      name: "Company 6",
      status: "rejected",
      timeAgo: "3 hrs ago",
    },
    {
      id: 7,
      name: "Company 7",
      status: "not verified",
      timeAgo: "7 hrs ago",
    },
    {
      id: 8,
      name: "Company 8",
      status: "review pending",
      timeAgo: "9 hrs ago",
    },
    {
      id: 9,
      name: "Company 9",
      status: "not verified",
      timeAgo: "5 min ago",
    },
    {
      id: 10,
      name: "Company 10",
      status: "review pending",
      timeAgo: "14 hrs ago",
    },
    {
      id: 11,
      name: "Company 11",
      status: "rejected",
      timeAgo: "1 day ago",
    },
    {
      id: 12,
      name: "Company 12",
      status: "not verified",
      timeAgo: "2 days ago",
    },
    {
      id: 13,
      name: "Company 13",
      status: "review pending",
      timeAgo: "2 days ago",
    },
  ];

  const requirementSections: RequirementSection[] = [
    {
      title: "Electrical",
      fields: [
        { label: "Quantity", value: 100 },
        { label: "Nationality", value: "Egyptian" },
        { label: "Languages", value: "German, English" },
      ],
    },
    {
      title: "Computer",
      fields: [
        { label: "Quantity", value: 150 },
        { label: "Nationality", value: "Russian" },
        { label: "Languages", value: "Spanish, English" },
      ],
    },
    {
      title: "Plumber",
      fields: [
        { label: "Quantity", value: 100 },
        { label: "Nationality", value: "Mexican" },
        { label: "Languages", value: "French, English" },
      ],
    },
  ];

  // Additional information fields
  const additionalInfo = [
    { label: "Working hours/day", value: "8–9 hours" },
    { label: "Project Location", value: "on-site" },
    { label: "Start date", value: "20 May 2025" },
    { label: "Duration of work", value: "6 months" },
    { label: "Salary frequency", value: "monthly" },
    { label: "Overtime Policy", value: "NIL" },
    { label: "Contract type", value: "permanent" },
    { label: "Recruitment Timeline", value: "3 years" },
  ];

  const handleCompanySelect = (companyId: number) => {
    setSelectedCompany(companyId);
  };

  const RequirementSection = ({ section }: { section: RequirementSection }) => (
    <div className="bg-white/10 rounded-lg shadow-md p-6 flex flex-col justify-between">
      <div>
        <h2 className="text-xl font-semibold text-[#150B3D] mb-4">
          {section.title}
        </h2>
        <div className="space-y-4">
          {section.fields.map((field, index) => (
            <div key={index} className="flex items-center justify-between">
              <p className="text-[#150B3D]/70">{field.label}:</p>
              <p className="text-[#150B3D] font-medium">{field.value}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-6 space-y-2">
        <button className="w-full bg-[#3D1673] text-white py-2 rounded-md hover:bg-[#2b0e54] transition-colors">
          Forward
        </button>
        <button className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition-colors">
          Reject
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex">
      {/* Left Sidebar - Companies (1/6 width) */}
      <div className="w-1/6 rounded-lg p-4 overflow-y-auto">
        <div className="space-y-2">
          {companies.map((company) => (
            <div
              key={company.id}
              onClick={() => handleCompanySelect(company.id)}
              className={`p-3 rounded-lg cursor-pointer transition-colors border-l-4 ${
                selectedCompany === company.id
                  ? "bg-[#EDDDF3] border-l-[#150B3D]"
                  : "bg-gray-50 hover:bg-[#EDDDF3]/50 border-l-gray-200"
              }`}
            >
              <div className="flex justify-between items-start">
                <h3 className="font-medium text-[#150B3D]">{company.name}</h3>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className={`text-xs ${getStatusColor(company.status)}`}>
                  {company.status}
                </span>
                <span className="text-xs text-[#150B3D]/50">
                  • {company.timeAgo}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Content - Requirements (5/6 width) */}
      <div className="w-5/6 overflow-y-auto p-6">
        {/* Company Header */}
        <div className="bg-[#EDDDF3]/50 rounded-xl p-6 shadow-sm mb-6">
          <h1 className="text-2xl font-bold text-[#150B3D]">
            {companies.find((c) => c.id === selectedCompany)?.name || "Company"}
          </h1>

          {/* Requirements Sections */}
          <div className="my-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {requirementSections.map((section, index) => (
                <RequirementSection key={index} section={section} />
              ))}
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-[#EDDDF3]/50 rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-[#150B3D] mb-4">
            Additional Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
            {additionalInfo.map((info, index) => (
              <div key={index} className="flex flex-col">
                <p className="text-[#150B3D]/70">{info.label}:</p>
                <p className="text-[#150B3D] font-medium">{info.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
