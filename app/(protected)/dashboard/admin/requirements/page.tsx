"use client";

import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/context/toast-provider";
import { format } from "date-fns";
import { Button } from "@/components/ui/Button";

interface Company {
  id: string;
  companyName: string;
  user: {
    status: "PENDING_REVIEW" | "REJECTED" | "NOT_VERIFIED" | "VERIFIED";
  };
  createdAt: Date;
}

interface JobRole {
  id: string;
  title: string;
  quantity: number;
  nationality: string;
  salary: string;
}

interface Requirement {
  id: string;
  projectLocation: string;
  startDate: Date | null;
  contractDuration: "ONE_YEAR" | "TWO_YEARS" | "UNLIMITED" | null;
  workingHours?: string;
  specialNotes: string | null;
  status:
    | "DRAFT"
    | "SUBMITTED"
    | "UNDER_REVIEW"
    | "APPROVED"
    | "REJECTED"
    | "FULFILLED"
    | "CLOSED";
  jobRoles: JobRole[];
  languages: string[];
  totalExperienceYears: number | null;
  preferredAge: number | null;
  createdAt: Date;
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
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [currentRequirementIndex, setCurrentRequirementIndex] = useState(0);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [loadingRequirements, setLoadingRequirements] = useState(true);
  const { toast } = useToast();

  const fetchCompanies = useCallback(async () => {
    try {
      const response = await fetch("/api/clients?status=VERIFIED");
      if (response.ok) {
        const data = await response.json();
        setCompanies(data);
        if (data.length > 0 && !selectedCompany) {
          setSelectedCompany(data[0].id);
        }
      }
    } catch (error) {
      console.error("Error fetching companies:", error);
      toast({
        type: "error",
        message: "Failed to load companies",
      });
    } finally {
      setLoadingCompanies(false);
    }
  }, [selectedCompany, toast]);

  const fetchRequirements = useCallback(
    async (companyId: string) => {
      try {
        setLoadingRequirements(true);
        const response = await fetch(`/api/requirements?clientId=${companyId}`);
        if (response.ok) {
          const data = await response.json();
          setRequirements(data);
          setCurrentRequirementIndex(0);
        }
      } catch (error) {
        console.error("Error fetching requirements:", error);
        toast({
          type: "error",
          message: "Failed to load requirements",
        });
      } finally {
        setLoadingRequirements(false);
      }
    },
    [toast]
  );

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  useEffect(() => {
    if (selectedCompany) {
      fetchRequirements(selectedCompany);
    }
  }, [selectedCompany, fetchRequirements]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING_REVIEW":
        return "text-[#C86300]";
      case "REJECTED":
        return "text-[#ED1C24]";
      case "NOT_VERIFIED":
        return "text-[#150B3D]/70";
      case "VERIFIED":
        return "text-[#00C853]";
      default:
        return "text-[#150B3D]/70";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "PENDING_REVIEW":
        return "review pending";
      case "REJECTED":
        return "rejected";
      case "NOT_VERIFIED":
        return "not verified";
      case "VERIFIED":
        return "verified";
      default:
        return status.toLowerCase();
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds} sec ago`;
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} min ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hrs ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  const handleCompanySelect = (companyId: string) => {
    setSelectedCompany(companyId);
  };

  const handleForward = async (requirementId: string) => {
    try {
      const response = await fetch(`/api/requirements/${requirementId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "APPROVED",
        }),
      });

      if (response.ok) {
        toast({
          type: "success",
          message: "Requirement forwarded successfully",
        });
        if (selectedCompany) {
          fetchRequirements(selectedCompany);
        }
      } else {
        throw new Error("Failed to forward requirement");
      }
    } catch (error) {
      console.error("Error forwarding requirement:", error);
      toast({
        type: "error",
        message: "Failed to forward requirement",
      });
    }
  };

  const handleReject = async (requirementId: string) => {
    try {
      const response = await fetch(`/api/requirements/${requirementId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "REJECTED",
        }),
      });

      if (response.ok) {
        toast({
          type: "success",
          message: "Requirement rejected successfully",
        });
        if (selectedCompany) {
          fetchRequirements(selectedCompany);
        }
      } else {
        throw new Error("Failed to reject requirement");
      }
    } catch (error) {
      console.error("Error rejecting requirement:", error);
      toast({
        type: "error",
        message: "Failed to reject requirement",
      });
    }
  };

  const handlePrevRequirement = () => {
    setCurrentRequirementIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleNextRequirement = () => {
    setCurrentRequirementIndex((prev) =>
      Math.min(prev + 1, requirements.length - 1)
    );
  };

  const currentRequirement = requirements[currentRequirementIndex];

  const requirementSections: RequirementSection[] =
    currentRequirement?.jobRoles.map((role) => ({
      title: role.title,
      fields: [
        { label: "Quantity", value: role.quantity },
        { label: "Nationality", value: role.nationality },
        { label: "Salary", value: role.salary },
        { label: "Languages", value: currentRequirement.languages.join(", ") },
      ],
      hasActions: true,
    })) || [];

  const additionalInfo = [
    {
      label: "Project Location",
      value: currentRequirement?.projectLocation || "Not specified",
    },
    {
      label: "Start date",
      value: currentRequirement?.startDate
        ? format(new Date(currentRequirement.startDate), "dd MMM yyyy")
        : "Not specified",
    },
    {
      label: "Duration of work",
      value: currentRequirement?.contractDuration || "Not specified",
    },
    {
      label: "Total Experience Years",
      value: currentRequirement?.totalExperienceYears || "Not specified",
    },
    {
      label: "Preferred Age",
      value: currentRequirement?.preferredAge || "Not specified",
    },
    {
      label: "Special Requirements",
      value: currentRequirement?.specialNotes || "None",
    },
  ];

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
      {section.hasActions && (
        <div className="mt-6 space-y-2">
          <Button
            onClick={() => handleForward(currentRequirement.id)}
            className="w-full bg-[#3D1673] text-white py-2 rounded-md hover:bg-[#2b0e54] transition-colors"
          >
            Forward
          </Button>
          <Button
            onClick={() => handleReject(currentRequirement.id)}
            className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition-colors"
          >
            Reject
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex">
      {/* Left Sidebar - Companies (1/6 width) */}
      <div className="w-1/6 rounded-lg p-4 overflow-y-auto">
        {loadingCompanies ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="p-3 rounded-lg bg-gray-100 animate-pulse h-16"
              />
            ))}
          </div>
        ) : (
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
                  <h3 className="font-medium text-[#150B3D]">
                    {company.companyName}
                  </h3>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span
                    className={`text-xs ${getStatusColor(company.user.status)}`}
                  >
                    {getStatusText(company.user.status)}
                  </span>
                  <span className="text-xs text-[#150B3D]/50">
                    • {formatTimeAgo(new Date(company.createdAt))}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Content - Requirements (5/6 width) */}
      <div className="w-5/6 overflow-y-auto p-6">
        {loadingRequirements ? (
          <div className="bg-[#EDDDF3]/50 rounded-xl p-6 shadow-sm mb-6 animate-pulse h-64" />
        ) : currentRequirement ? (
          <>
            {/* Company Header */}
            <div className="bg-[#EDDDF3]/50 rounded-xl p-6 shadow-sm mb-6">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-[#150B3D]">
                  {companies.find((c) => c.id === selectedCompany)
                    ?.companyName || "Company"}
                </h1>
                <div className="flex space-x-2">
                  <Button
                    onClick={handlePrevRequirement}
                    disabled={currentRequirementIndex === 0}
                    variant="outline"
                  >
                    Previous
                  </Button>
                  <Button
                    onClick={handleNextRequirement}
                    disabled={
                      currentRequirementIndex === requirements.length - 1
                    }
                    variant="outline"
                  >
                    Next
                  </Button>
                  <span className="flex items-center text-sm text-[#150B3D]">
                    {currentRequirementIndex + 1} of {requirements.length}
                  </span>
                </div>
              </div>

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
          </>
        ) : (
          <div className="bg-[#EDDDF3]/50 rounded-xl p-6 shadow-sm flex items-center justify-center h-64">
            <p className="text-[#150B3D]">
              {requirements.length === 0
                ? "No requirements found"
                : "Select a requirement"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
