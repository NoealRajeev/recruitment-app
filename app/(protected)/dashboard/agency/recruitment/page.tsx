/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  User,
  Building,
  BarChart2,
  Edit,
} from "lucide-react";
import { useToast } from "@/context/toast-provider";
import GanttChart from "@/components/ui/GanttChart";
import {
  RequirementStatus,
  LabourStage,
  LabourProfileStatus,
  StageStatus,
} from "@/lib/generated/prisma";
import { Modal } from "@/components/ui/Modal";

// Types
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
  labour: LabourProfile & {
    stages: LabourStageHistory[];
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
}

interface LabourStageHistory {
  id: string;
  stage: LabourStage;
  status: StageStatus;
  notes?: string | null;
  createdAt: Date;
  completedAt?: Date | null;
}

// Constants
const ITEMS_PER_PAGE = 10;
const STATUS_COLORS = {
  PENDING: "text-[#C86300]",
  REJECTED: "text-[#ED1C24]",
  NOT_VERIFIED: "text-[#150B3D]/70",
  VERIFIED: "text-[#00C853]",
  COMPLETED: "text-[#00C853]",
  DEFAULT: "text-[#150B3D]/70",
};

// API Service Functions
const fetchRequirements = async (): Promise<Requirement[]> => {
  try {
    const response = await fetch("/api/agencies/requirements/accepted");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching requirements:", error);
    return [];
  }
};

const updateLabourStage = async (
  labourId: string,
  stageData: {
    stage: LabourStage;
    status: StageStatus;
    notes: string;
  }
) => {
  const response = await fetch(
    `/api/agencies/labour-profiles/${labourId}/stages`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(stageData),
    }
  );
  if (!response.ok) throw new Error("Failed to update stage");
  return response.json();
};

// Components
const LabourCard = ({
  labour,
  onViewTimeline,
  onUpdateStage,
}: {
  labour: LabourProfile;
  stages: LabourStageHistory[];
  onViewTimeline: () => void;
  onUpdateStage: () => void;
}) => {
  const getStatusColor = (status: string) => {
    return (
      STATUS_COLORS[status as keyof typeof STATUS_COLORS] ||
      STATUS_COLORS.DEFAULT
    );
  };

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

      <div className="mt-3 flex gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewTimeline();
          }}
          className="w-full py-1.5 px-3 bg-[#3D1673] hover:bg-[#2b0e54] text-white text-xs rounded flex items-center justify-center gap-1"
        >
          <BarChart2 className="w-3 h-3" />
          View Timeline
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onUpdateStage();
          }}
          disabled={labour.currentStage === LabourStage.DEPLOYMENT}
          className={`w-full py-1.5 px-3 bg-[#150B3D] hover:bg-[#0e0726] text-white text-xs rounded flex items-center justify-center gap-1 ${
            labour.currentStage === LabourStage.DEPLOYMENT
              ? "opacity-50 cursor-not-allowed"
              : ""
          }`}
        >
          <Edit className="w-3 h-3" />
          Update
        </button>
      </div>
    </div>
  );
};

const RequirementsSidebar = ({
  requirements,
  currentPage,
  totalPages,
  selectedRequirement,
  onRequirementSelect,
  onPageChange,
  loading,
}: {
  requirements: Requirement[];
  currentPage: number;
  totalPages: number;
  selectedRequirement: string | null;
  onRequirementSelect: (id: string) => void;
  onPageChange: (page: number) => void;
  loading: boolean;
}) => {
  const paginatedRequirements = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return requirements.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [requirements, currentPage]);

  const formatRequirementId = (id: string) => {
    return id.slice(0, 8).toUpperCase();
  };

  return (
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
              onClick={() => onRequirementSelect(requirement.id)}
              className={`p-3 rounded-lg cursor-pointer transition-colors border-l-4 ${
                selectedRequirement === requirement.id
                  ? "bg-[#EDDDF3] border-l-[#150B3D]"
                  : "bg-gray-50 hover:bg-[#EDDDF3]/50 border-l-gray-200"
              }`}
            >
              <div className="flex justify-between items-start">
                <span className="font-medium text-[#150B3D]">
                  #{formatRequirementId(requirement.id)}
                </span>
                <span className="text-xs text-[#150B3D]/50">
                  {new Date(requirement.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-[#150B3D]/70">
                  {requirement.jobRoles.length} job roles
                </span>
                <span className="text-xs">
                  {requirement.status.replace("_", " ").toLowerCase()}
                </span>
              </div>
            </div>
          ))}

          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-4">
              <button
                onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
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
                  onPageChange(Math.min(currentPage + 1, totalPages))
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
  );
};

const JobRoleHeader = ({
  requirement,
  currentJobRole,
  currentJobRoleIndex,
  totalJobRoles,
  onPreviousJobRole,
  onNextJobRole,
}: {
  requirement: Requirement;
  currentJobRole: JobRole;
  currentJobRoleIndex: number;
  totalJobRoles: number;
  onPreviousJobRole: () => void;
  onNextJobRole: () => void;
}) => {
  const formatRequirementId = (id: string) => {
    return id.slice(0, 8).toUpperCase();
  };

  return (
    <div className="flex justify-between items-center mb-6 bg-[#EDDDF3]/50 p-4 rounded-2xl">
      <div className="flex items-center gap-3">
        <Building className="w-6 h-6 text-[#150B3D]" />
        <div>
          <h2 className="text-xl font-semibold text-[#150B3D]">
            Requirement #{formatRequirementId(requirement.id)}
          </h2>
          <p className="text-sm text-[#150B3D]/70">
            Created: {new Date(requirement.createdAt).toLocaleDateString()}
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

        {totalJobRoles > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={onPreviousJobRole}
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
              {currentJobRoleIndex + 1} of {totalJobRoles}
            </span>

            <button
              onClick={onNextJobRole}
              disabled={currentJobRoleIndex === totalJobRoles - 1}
              className={`p-2 rounded-full ${
                currentJobRoleIndex === totalJobRoles - 1
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
  );
};

const UpdateStageModal = ({
  isOpen,
  onClose,
  currentStage,
  onUpdate,
}: {
  isOpen: boolean;
  onClose: () => void;
  labour: LabourProfile;
  currentStage: LabourStage;
  onUpdate: (data: {
    stage: LabourStage;
    status: StageStatus;
    notes: string;
  }) => Promise<void>;
}) => {
  const [stage, setStage] = useState<LabourStage>(currentStage);
  const [status, setStatus] = useState<StageStatus>(StageStatus.PENDING);
  const [notes, setNotes] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    try {
      setIsUpdating(true);
      await onUpdate({ stage, status, notes });
      toast({
        type: "success",
        message: "Stage updated successfully",
      });
      onClose();
    } catch (error) {
      console.error("Error updating stage:", error);
      toast({
        type: "error",
        message: "Failed to update stage",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Update Labour Stage"
      showFooter
      onConfirm={handleSubmit}
      confirmText={isUpdating ? "Updating..." : "Update Stage"}
      confirmDisabled={isUpdating}
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#150B3D] mb-1">
            Current Stage
          </label>
          <select
            value={stage}
            onChange={(e) => setStage(e.target.value as LabourStage)}
            className="w-full p-2 border rounded-md bg-white"
          >
            {Object.values(LabourStage).map((stage) => (
              <option key={stage} value={stage}>
                {stage.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#150B3D] mb-1">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as StageStatus)}
            className="w-full p-2 border rounded-md bg-white"
          >
            <option value="PENDING">Pending</option>
            <option value="COMPLETED">Completed</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#150B3D] mb-1">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-2 border rounded-md"
            rows={3}
            placeholder="Add any relevant notes about this stage update..."
          />
        </div>
      </div>
    </Modal>
  );
};

// Main Page Component
export default function AgencyRecruitment() {
  const [selectedRequirement, setSelectedRequirement] = useState<string | null>(
    null
  );
  const [currentJobRoleIndex, setCurrentJobRoleIndex] = useState<number>(0);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedLabour, setSelectedLabour] = useState<{
    profile: LabourProfile;
    stages: LabourStageHistory[];
  } | null>(null);
  const [showStageForm, setShowStageForm] = useState(false);
  const [currentStage, setCurrentStage] = useState<LabourStage>(
    LabourStage.INITIALIZED
  );
  const { toast } = useToast();

  // Fetch requirements on mount
  useEffect(() => {
    const loadRequirements = async () => {
      try {
        setLoading(true);
        const data = await fetchRequirements();
        setRequirements(data);
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

    loadRequirements();
  }, [selectedRequirement, toast]);

  // Memoized derived state
  const selectedRequirementData = useMemo(
    () => requirements.find((r) => r.id === selectedRequirement),
    [requirements, selectedRequirement]
  );

  const currentJobRole = useMemo(
    () => selectedRequirementData?.jobRoles[currentJobRoleIndex],
    [selectedRequirementData, currentJobRoleIndex]
  );

  const totalPages = Math.ceil(requirements.length / ITEMS_PER_PAGE);

  // Event handlers
  const handlePreviousJobRole = useCallback(() => {
    if (currentJobRoleIndex > 0) {
      setCurrentJobRoleIndex(currentJobRoleIndex - 1);
    }
  }, [currentJobRoleIndex]);

  const handleNextJobRole = useCallback(() => {
    if (
      selectedRequirementData &&
      currentJobRoleIndex < selectedRequirementData.jobRoles.length - 1
    ) {
      setCurrentJobRoleIndex(currentJobRoleIndex + 1);
    }
  }, [currentJobRoleIndex, selectedRequirementData]);

  const handleRequirementSelect = useCallback((requirementId: string) => {
    setSelectedRequirement(requirementId);
    setCurrentJobRoleIndex(0);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleUpdateStage = useCallback(
    async (data: {
      stage: LabourStage;
      status: StageStatus;
      notes: string;
    }) => {
      if (!selectedLabour) return;
      await updateLabourStage(selectedLabour.profile.id, data);
      const updatedRequirements = await fetchRequirements();
      setRequirements(updatedRequirements);
    },
    [selectedLabour]
  );

  const handleViewTimeline = useCallback(
    (labour: LabourProfile, stages: LabourStageHistory[]) => {
      setSelectedLabour({ profile: labour, stages });
      setShowStageForm(false);
    },
    []
  );

  const handleOpenUpdateStage = useCallback(
    (labour: LabourProfile, stages: LabourStageHistory[]) => {
      setSelectedLabour({ profile: labour, stages });
      setCurrentStage(labour.currentStage);
      setShowStageForm(true);
    },
    []
  );

  const handleCloseModal = useCallback(() => {
    setSelectedLabour(null);
    setShowStageForm(false);
  }, []);

  return (
    <div className="px-6 flex gap-6 h-screen">
      <RequirementsSidebar
        requirements={requirements}
        currentPage={currentPage}
        totalPages={totalPages}
        selectedRequirement={selectedRequirement}
        onRequirementSelect={handleRequirementSelect}
        onPageChange={handlePageChange}
        loading={loading}
      />
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
            <JobRoleHeader
              requirement={selectedRequirementData}
              currentJobRole={currentJobRole}
              currentJobRoleIndex={currentJobRoleIndex}
              totalJobRoles={selectedRequirementData.jobRoles.length}
              onPreviousJobRole={handlePreviousJobRole}
              onNextJobRole={handleNextJobRole}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {currentJobRole.LabourAssignment.map((assignment) => (
                <LabourCard
                  key={assignment.id}
                  labour={assignment.labour}
                  stages={assignment.labour.stages}
                  onViewTimeline={() =>
                    handleViewTimeline(
                      assignment.labour,
                      assignment.labour.stages
                    )
                  }
                  onUpdateStage={() =>
                    handleOpenUpdateStage(
                      assignment.labour,
                      assignment.labour.stages
                    )
                  }
                />
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

      {/* Gantt Chart Modal */}
      <Modal
        isOpen={!!selectedLabour && !showStageForm}
        onClose={handleCloseModal}
        title={`${selectedLabour?.profile.name}'s Recruitment Timeline`}
        size="3xl"
      >
        {selectedLabour && (
          <div className="space-y-6 pb-8">
            <div className="flex items-center gap-4">
              {selectedLabour.profile.profileImage ? (
                <img
                  src={selectedLabour.profile.profileImage}
                  alt={selectedLabour.profile.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-[#150B3D]/10 flex items-center justify-center">
                  <User className="w-8 h-8 text-[#150B3D]/50" />
                </div>
              )}
              <div>
                <h3 className="font-semibold text-lg text-[#150B3D]">
                  {selectedLabour.profile.name}
                </h3>
                <div className="flex gap-2">
                  <span
                    className={`text-xs ${
                      STATUS_COLORS[
                        selectedLabour.profile
                          .status as keyof typeof STATUS_COLORS
                      ] || STATUS_COLORS.DEFAULT
                    }`}
                  >
                    {selectedLabour.profile.status
                      .replace("_", " ")
                      .toLowerCase()}
                  </span>
                  <span
                    className={`text-xs ${
                      STATUS_COLORS[
                        selectedLabour.profile
                          .verificationStatus as keyof typeof STATUS_COLORS
                      ] || STATUS_COLORS.DEFAULT
                    }`}
                  >
                    {selectedLabour.profile.verificationStatus
                      .replace("_", " ")
                      .toLowerCase()}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#150B3D]/70 font-medium">
                  Nationality:
                </span>
                <span className="text-[#150B3D]">
                  {selectedLabour.profile.nationality}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#150B3D]/70 font-medium">Age:</span>
                <span className="text-[#150B3D]">
                  {selectedLabour.profile.age}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#150B3D]/70 font-medium">
                  Current Stage:
                </span>
                <span className="text-[#150B3D]">
                  {selectedLabour.profile.currentStage.replace(/_/g, " ")}
                </span>
              </div>
            </div>

            <GanttChart stages={selectedLabour.stages} />
          </div>
        )}
      </Modal>

      {/* Update Stage Modal */}
      <UpdateStageModal
        isOpen={showStageForm}
        onClose={handleCloseModal}
        labour={selectedLabour?.profile || ({} as LabourProfile)}
        currentStage={currentStage}
        onUpdate={handleUpdateStage}
      />
    </div>
  );
}
