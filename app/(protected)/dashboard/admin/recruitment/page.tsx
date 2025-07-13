/* eslint-disable @next/next/no-img-element */
// app/(protected)/dashboard/admin/recruitment/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight, User, Building } from "lucide-react";
import { useToast } from "@/context/toast-provider";
import {
  RequirementStatus,
  LabourStage,
  LabourProfileStatus,
  StageStatus,
} from "@/lib/generated/prisma";
import { Modal } from "@/components/ui/Modal";
import ProgressTracker from "@/components/ui/ProgressTracker";

interface Requirement {
  id: string;
  status: RequirementStatus;
  createdAt: Date;
  client: {
    companyName: string;
  };
  jobRoles: JobRole[];
}

interface JobRole {
  id: string;
  title: string;
  quantity: number;
  LabourAssignment: LabourAssignment[];
}

interface LabourAssignment {
  id: string;
  labour: LabourProfile & {
    stages: {
      id: string;
      stage: LabourStage;
      status: string;
      notes?: string | null;
      createdAt: Date;
      completedAt?: Date | null;
    }[];
  };
}

interface LabourProfile {
  id: string;
  name: string;
  nationality: string;
  age: number;
  gender: string;
  status: LabourProfileStatus;
  verificationStatus: string;
  profileImage?: string;
  currentStage: LabourStage;
  stages?: {
    id: string;
    stage: LabourStage;
    status: string;
    notes?: string | null;
    createdAt: Date;
    completedAt?: Date | null;
  }[];
}

export default function Recruitment() {
  const [selectedRequirement, setSelectedRequirement] = useState<string | null>(
    null
  );
  const [currentJobRoleIndex, setCurrentJobRoleIndex] = useState<number>(0);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedLabour, setSelectedLabour] = useState<{
    profile: LabourProfile;
    stages: {
      id: string;
      stage: LabourStage;
      status: string;
      notes?: string | null;
      createdAt: Date;
      completedAt?: Date | null;
    }[];
  } | null>(null);
  const itemsPerPage = 10;
  const { toast } = useToast();
  const [actionLoading, setActionLoading] = useState<{
    [labourId: string]: boolean;
  }>({});
  const [uploadLoading, setUploadLoading] = useState<{
    [labourId: string]: boolean;
  }>({});
  const [timelineLabour, setTimelineLabour] = useState<LabourProfile | null>(
    null
  );

  // Fetch accepted requirements with their job roles and labour assignments
  useEffect(() => {
    const fetchRequirements = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/admin/requirements/accepted");
        if (!response.ok) throw new Error("Failed to fetch requirements");

        const data = await response.json();
        setRequirements(data);

        // Select first requirement by default if none selected
        if (data.length > 0 && !selectedRequirement) {
          setSelectedRequirement(data[0].id);
        }
      } catch (error) {
        console.error("Error fetching requirements:", error);
        toast({
          type: "error",
          message: "Failed to load requirements",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRequirements();
  }, [selectedRequirement, toast]);

  // Pagination logic
  const paginatedRequirements = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return requirements.slice(startIndex, startIndex + itemsPerPage);
  }, [requirements, currentPage]);

  const totalPages = Math.ceil(requirements.length / itemsPerPage);

  // Memoize selected requirement data
  const selectedRequirementData = useMemo(
    () => requirements.find((r) => r.id === selectedRequirement),
    [requirements, selectedRequirement]
  );

  // Memoize current job role
  const currentJobRole = useMemo(
    () => selectedRequirementData?.jobRoles[currentJobRoleIndex],
    [selectedRequirementData, currentJobRoleIndex]
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "text-[#C86300]";
      case "REJECTED":
        return "text-[#ED1C24]";
      case "NOT_VERIFIED":
        return "text-[#150B3D]/70";
      case "VERIFIED":
      case "COMPLETED":
        return "text-[#00C853]";
      default:
        return "text-[#150B3D]/70";
    }
  };

  const handlePreviousJobRole = () => {
    if (currentJobRoleIndex > 0) {
      setCurrentJobRoleIndex(currentJobRoleIndex - 1);
    }
  };

  const handleNextJobRole = () => {
    if (
      selectedRequirementData &&
      currentJobRoleIndex < selectedRequirementData.jobRoles.length - 1
    ) {
      setCurrentJobRoleIndex(currentJobRoleIndex + 1);
    }
  };

  const handleRequirementSelect = (requirementId: string) => {
    setSelectedRequirement(requirementId);
    setCurrentJobRoleIndex(0);
  };

  const formatRequirementId = (id: string) => {
    return id.slice(0, 8).toUpperCase();
  };

  const LabourCard = ({ labour }: { labour: LabourProfile }) => {
    return (
      <div className="bg-[#EDDDF3] rounded-lg p-4 relative">
        <div className="flex items-center gap-3 mb-3">
          {labour.profileImage ? (
            <img
              src={labour.profileImage}
              alt={labour.name}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-[#150B3D]/10 flex items-center justify-center">
              <User className="w-6 h-6 text-[#150B3D]/50" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-[#150B3D] truncate">
              {labour.name}
            </h3>
            <div className="flex gap-2">
              <span className={`text-xs ${getStatusColor(labour.status)}`}>
                {labour.status.replace("_", " ").toLowerCase()}
              </span>
              <span
                className={`text-xs ${getStatusColor(labour.verificationStatus)}`}
              >
                {labour.verificationStatus.replace("_", " ").toLowerCase()}
              </span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-[#150B3D]/70">Nationality:</span>
            <span className="block truncate">{labour.nationality}</span>
          </div>
          <div>
            <span className="text-[#150B3D]/70">Age:</span>
            <span className="block">{labour.age}</span>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-[#150B3D]/10">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#150B3D]/70">Current Stage:</span>
            <span className="text-sm font-medium">
              {labour.currentStage.replace(/_/g, " ")}
            </span>
          </div>
        </div>
        <button
          className="mt-3 w-full py-1.5 px-3 bg-[#3D1673] hover:bg-[#2b0e54] text-white text-xs rounded flex items-center justify-center gap-1"
          onClick={() => {
            setTimelineLabour(labour);
          }}
        >
          View Timeline
        </button>
      </div>
    );
  };

  // Handler for ProgressTracker actions
  const handleTrackerAction = async (labourId: string, stageKey: string) => {
    setActionLoading((prev) => ({ ...prev, [labourId]: true }));
    try {
      await fetch(`/api/admin/labour-profiles/${labourId}/stages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stage: stageKey,
          status: "COMPLETED",
          notes: "",
        }),
      });
      toast({
        type: "success",
        message: `Stage ${stageKey} marked as completed.`,
      });
      const response = await fetch("/api/admin/requirements/accepted");
      setRequirements(await response.json());
    } catch {
      toast({ type: "error", message: `Failed to update stage: ${stageKey}` });
    } finally {
      setActionLoading((prev) => ({ ...prev, [labourId]: false }));
    }
  };

  // Handler for ProgressTracker uploads
  const handleTrackerUpload = async (
    labourId: string,
    stageKey: string,
    file: File
  ) => {
    setUploadLoading((prev) => ({ ...prev, [labourId]: true }));
    try {
      const formData = new FormData();
      formData.append("stage", stageKey);
      formData.append("status", "COMPLETED");
      formData.append("notes", "");
      formData.append("document", file);
      await fetch(`/api/admin/labour-profiles/${labourId}/stages`, {
        method: "POST",
        body: formData,
      });
      toast({ type: "success", message: `Document uploaded for ${stageKey}.` });
      const response = await fetch("/api/admin/requirements/accepted");
      setRequirements(await response.json());
    } catch {
      toast({
        type: "error",
        message: `Failed to upload document for: ${stageKey}`,
      });
    } finally {
      setUploadLoading((prev) => ({ ...prev, [labourId]: false }));
    }
  };

  return (
    <div className="px-6 flex gap-6 h-screen">
      {/* Left Sidebar - Requirements (1/6 width) */}
      <div className="w-1/6 rounded-lg p-4 overflow-y-auto">
        {loading ? (
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
            {paginatedRequirements.map((requirement) => (
              <div
                key={requirement.id}
                onClick={() => handleRequirementSelect(requirement.id)}
                className={`p-3 rounded-lg cursor-pointer transition-colors border-l-4 ${
                  selectedRequirement === requirement.id
                    ? "bg-[#EDDDF3] border-l-[#150B3D]"
                    : "bg-gray-50 hover:bg-[#EDDDF3]/50 border-l-gray-200"
                }`}
              >
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-[#150B3D]">
                    {requirement.client.companyName}
                  </h3>
                  <span className="text-xs text-[#150B3D]/50">
                    {new Date(requirement.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-[#150B3D]/70">
                    {requirement.jobRoles.length} job roles
                  </span>
                  <span className="text-xs font-mono">
                    #{formatRequirementId(requirement.id)}
                  </span>
                </div>
              </div>
            ))}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-4">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded ${
                    currentPage === 1
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-[#150B3D] text-white hover:bg-[#150B3D]/80"
                  }`}
                >
                  Prev
                </button>
                <span className="text-sm text-[#150B3D]/70">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded ${
                    currentPage === totalPages
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-[#150B3D] text-white hover:bg-[#150B3D]/80"
                  }`}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Content - Job Role Details (5/6 width) */}
      <div className="w-5/6 rounded-lg p-6 overflow-y-auto">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-[#EDDDF3] rounded-lg p-6 h-64 animate-pulse"
              />
            ))}
          </div>
        ) : selectedRequirementData && currentJobRole ? (
          <>
            {/* Job Role Header */}
            <div className="flex justify-between items-center mb-6 bg-[#EDDDF3]/50 p-4 rounded-2xl">
              <div className="flex items-center gap-3">
                <Building className="w-6 h-6 text-[#150B3D]" />
                <div>
                  <h2 className="text-xl font-semibold text-[#150B3D]">
                    {selectedRequirementData.client.companyName}
                  </h2>
                  <p className="text-sm text-[#150B3D]/70">
                    Order #: {formatRequirementId(selectedRequirementData.id)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <h3 className="text-lg font-semibold text-[#150B3D]">
                    {currentJobRole.title}
                  </h3>
                  <p className="text-sm text-[#150B3D]/70">
                    Filled: {currentJobRole.LabourAssignment.length}/
                    {currentJobRole.quantity}
                  </p>
                </div>

                {/* Navigation Arrows */}
                {selectedRequirementData.jobRoles.length > 1 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePreviousJobRole}
                      disabled={currentJobRoleIndex === 0}
                      className={`p-2 rounded-full ${
                        currentJobRoleIndex === 0
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-[#150B3D] text-white hover:bg-[#150B3D]/80"
                      }`}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    <span className="text-sm text-[#150B3D]/70 px-2">
                      {currentJobRoleIndex + 1} of{" "}
                      {selectedRequirementData.jobRoles.length}
                    </span>

                    <button
                      onClick={handleNextJobRole}
                      disabled={
                        currentJobRoleIndex ===
                        selectedRequirementData.jobRoles.length - 1
                      }
                      className={`p-2 rounded-full ${
                        currentJobRoleIndex ===
                        selectedRequirementData.jobRoles.length - 1
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-[#150B3D] text-white hover:bg-[#150B3D]/80"
                      }`}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Labour Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {currentJobRole.LabourAssignment.map((assignment) => (
                <LabourCard key={assignment.id} labour={assignment.labour} />
              ))}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-[#150B3D]/50">
              {requirements.length === 0
                ? "No accepted requirements found"
                : "Select a requirement to view job roles"}
            </p>
          </div>
        )}
        {/* Timeline Modal */}
        <Modal
          isOpen={!!timelineLabour}
          onClose={() => setTimelineLabour(null)}
          title={
            timelineLabour ? `${timelineLabour.name}'s Onboarding Timeline` : ""
          }
          size="2xl"
        >
          {timelineLabour && (
            <ProgressTracker
              currentStage={timelineLabour.currentStage}
              statuses={Object.fromEntries(
                (timelineLabour.stages || []).map((s) => [s.stage, s.status])
              )}
              userRole="RECRUITMENT_ADMIN"
            />
          )}
        </Modal>
      </div>
    </div>
  );
}
