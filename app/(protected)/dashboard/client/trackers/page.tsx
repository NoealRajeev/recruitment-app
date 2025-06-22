"use client";

import { useState, useEffect, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  HardHat,
  User,
  Clock,
  Check,
} from "lucide-react";
import { useToast } from "@/context/toast-provider";
import {
  RequirementStatus,
  LabourStage,
  LabourProfileStatus,
} from "@/lib/generated/prisma";

interface Requirement {
  id: string;
  status: RequirementStatus;
  createdAt: Date;
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
  labour: LabourProfile;
  stages: LabourStageHistory[];
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
}

interface LabourStageHistory {
  id: string;
  stage: LabourStage;
  status: string;
  notes?: string;
  completedAt?: Date;
}

export default function Recruitment() {
  const [selectedRequirement, setSelectedRequirement] = useState<string | null>(
    null
  );
  const [currentJobRoleIndex, setCurrentJobRoleIndex] = useState<number>(0);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();

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

  const formatDate = (date?: Date) => {
    if (!date) return "Not completed";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const LabourCard = ({
    labour,
    stages,
  }: {
    labour: LabourProfile;
    stages: LabourStageHistory[];
  }) => (
    <div className="bg-[#EDDDF3] rounded-lg p-6 relative">
      <div className="absolute top-2 right-2">
        <MoreVertical className="w-4 h-4 text-[#150B3D]/50" />
      </div>

      <div className="flex items-center gap-4 mb-4">
        {labour.profileImage ? (
          <img
            src={labour.profileImage}
            alt={labour.name}
            className="w-16 h-16 rounded-full object-cover"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-[#150B3D]/10 flex items-center justify-center">
            <User className="w-8 h-8 text-[#150B3D]/50" />
          </div>
        )}

        <div>
          <h3 className="font-semibold text-[#150B3D]">{labour.name}</h3>
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

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-[#150B3D]/70 font-medium">Nationality:</span>
          <span className="text-[#150B3D]">{labour.nationality}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-[#150B3D]/70 font-medium">Age:</span>
          <span className="text-[#150B3D]">{labour.age}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-[#150B3D]/70 font-medium">Gender:</span>
          <span className="text-[#150B3D]">{labour.gender.toLowerCase()}</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-[#150B3D]/10">
        <h4 className="font-medium text-[#150B3D] mb-2">Current Stage:</h4>
        {stages.length > 0 ? (
          <div className="flex items-center gap-2">
            {stages[stages.length - 1].status === "completed" ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <Clock className="w-4 h-4 text-yellow-500" />
            )}
            <span>
              {stages[stages.length - 1].stage.replace(/_/g, " ")} -{" "}
              {stages[stages.length - 1].status}
            </span>
          </div>
        ) : (
          <span className="text-sm text-[#150B3D]/70">
            No stage information
          </span>
        )}
      </div>
    </div>
  );

  const StageHistory = ({ stages }: { stages: LabourStageHistory[] }) => (
    <div className="mt-4 space-y-3">
      <h4 className="font-medium text-[#150B3D]">Stage History:</h4>
      <div className="space-y-2">
        {stages.map((stage) => (
          <div key={stage.id} className="flex items-start gap-2">
            {stage.status === "completed" ? (
              <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
            ) : (
              <Clock className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
            )}
            <div>
              <p className="text-sm font-medium">
                {stage.stage.replace(/_/g, " ")}
              </p>
              <p className="text-xs text-[#150B3D]/70">
                {stage.status} • {formatDate(stage.completedAt)}
              </p>
              {stage.notes && (
                <p className="text-xs text-[#150B3D]/70 mt-1">{stage.notes}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

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
            {requirements.map((requirement) => (
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
                    Req. #{requirement.id.slice(0, 6)}
                  </h3>
                  <span className="text-xs text-[#150B3D]/50">
                    {new Date(requirement.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-[#150B3D]/70">
                    {requirement.jobRoles.length} job roles
                  </span>
                  <span
                    className={`text-xs ${getStatusColor(requirement.status)}`}
                  >
                    {requirement.status.replace("_", "").toLowerCase()}
                  </span>
                </div>
              </div>
            ))}
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
                <HardHat className="w-6 h-6 text-[#150B3D]" />
                <h2 className="text-xl font-semibold text-[#150B3D]">
                  {currentJobRole.title}
                </h2>
                <span className="text-sm text-[#150B3D]/70">
                  (Filled: {currentJobRole.LabourAssignment.length}/
                  {currentJobRole.quantity})
                </span>
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

            {/* Labour Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {currentJobRole.LabourAssignment.map((assignment) => (
                <div key={assignment.id} className="space-y-4">
                  <LabourCard
                    labour={assignment.labour}
                    stages={assignment.stages}
                  />
                  <StageHistory stages={assignment.stages} />
                </div>
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
      </div>
    </div>
  );
}
