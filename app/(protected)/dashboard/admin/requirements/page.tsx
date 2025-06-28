"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useToast } from "@/context/toast-provider";
import { format } from "date-fns";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { RequirementStatus, ContractDuration } from "@/lib/generated/prisma";

interface Client {
  id: string;
  companyName: string;
  user: {
    status: "PENDING_REVIEW" | "REJECTED" | "NOT_VERIFIED" | "VERIFIED";
  };
  createdAt: Date;
}

interface Agency {
  id: string;
  agencyName: string;
  user: {
    status: "PENDING_REVIEW" | "REJECTED" | "NOT_VERIFIED" | "VERIFIED";
  };
}

interface JobRole {
  id: string;
  title: string;
  quantity: number;
  nationality: string;
  basicSalary: number;
  salaryCurrency: string;
  startDate: Date;
  contractDuration: ContractDuration | null;
  foodAllowance: number | null;
  foodProvidedByCompany: boolean;
  housingAllowance: number | null;
  housingProvidedByCompany: boolean;
  transportationAllowance: number | null;
  transportationProvidedByCompany: boolean;
  mobileAllowance: number | null;
  mobileProvidedByCompany: boolean;
  natureOfWorkAllowance: number | null;
  otherAllowance: number | null;
  healthInsurance: string;
  ticketFrequency: string;
  workLocations: string;
  previousExperience: string;
  totalExperienceYears: number | null;
  preferredAge: number | null;
  languageRequirements: string[];
  specialRequirements: string | null;
  assignedAgencyId: string | null;
  agencyStatus: RequirementStatus | null;
  assignedAgency?: {
    agencyName: string;
  } | null;
}

interface Requirement {
  id: string;
  status: RequirementStatus;
  createdAt: Date;
  updatedAt: Date;
  jobRoles: JobRole[];
  client: {
    id: string;
    companyName: string;
  };
}

interface RequirementSection {
  title: string;
  fields: {
    label: string;
    value: string | number;
  }[];
  hasActions?: boolean;
  id: string;
  foodProvidedByCompany: boolean;
  foodAllowance: number | null;
  housingProvidedByCompany: boolean;
  housingAllowance: number | null;
  transportationProvidedByCompany: boolean;
  transportationAllowance: number | null;
  mobileProvidedByCompany: boolean;
  mobileAllowance: number | null;
  natureOfWorkAllowance: number | null;
  otherAllowance: number | null;
  salaryCurrency: string;
  workLocations: string;
  previousExperience: string;
  languageRequirements: string[];
  healthInsurance: string;
  ticketFrequency: string;
  totalExperienceYears: number | null;
  preferredAge: number | null;
  specialRequirements: string | null;
}

interface ForwardingJobRole {
  id: string;
  title: string;
  originalQuantity: number;
  forwarded: {
    agencyId: string;
    quantity: number;
  }[];
}

interface ForwardRequirementModalProps {
  isOpen: boolean;
  onClose: () => void;
  requirement: Requirement | undefined;
  agencies: Agency[];
  onForward: (assignments: ForwardingJobRole[]) => Promise<void>;
  jobRoleId?: string;
}

const contractDurationMap: Record<ContractDuration, string> = {
  ONE_MONTH: "1 Month",
  THREE_MONTHS: "3 Months",
  SIX_MONTHS: "6 Months",
  ONE_YEAR: "1 Year",
  TWO_YEARS: "2 Years",
  THREE_YEARS: "3 Years",
  FIVE_PLUS_YEARS: "5+ Years",
};

const ForwardRequirementModal = ({
  isOpen,
  onClose,
  requirement,
  agencies,
  onForward,
  jobRoleId,
}: ForwardRequirementModalProps) => {
  const [mode, setMode] = useState<"SINGLE" | "SPLIT">("SINGLE");
  const [selectedAgency, setSelectedAgency] = useState<string>("");
  const [jobRoles, setJobRoles] = useState<ForwardingJobRole[]>([]);
  const [expandedRoles, setExpandedRoles] = useState<Record<string, boolean>>(
    {}
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const isSingleRoleForward = !!jobRoleId;

  const allRolesAssigned = useMemo(() => {
    if (mode !== "SPLIT") return true;
    return jobRoles.every(
      (role) =>
        role.forwarded.length > 0 && role.forwarded.some((a) => a.quantity > 0)
    );
  }, [jobRoles, mode]);

  useEffect(() => {
    if (requirement) {
      const rolesToForward = isSingleRoleForward
        ? requirement.jobRoles.filter((role) => role.id === jobRoleId)
        : requirement.jobRoles;

      const initialJobRoles: ForwardingJobRole[] = rolesToForward.map(
        (role) => ({
          id: role.id,
          title: role.title,
          originalQuantity: role.quantity,
          forwarded: [],
        })
      );
      setJobRoles(initialJobRoles);

      const expandedState: Record<string, boolean> = {};
      rolesToForward.forEach((role) => {
        expandedState[role.id] = false;
      });
      setExpandedRoles(expandedState);
    }
  }, [requirement, jobRoleId, isSingleRoleForward]);

  useEffect(() => {
    if (agencies.length > 0 && mode === "SINGLE") {
      setSelectedAgency(agencies[0].id);
    }
  }, [mode, agencies]);

  const toggleRoleExpansion = (roleId: string) => {
    setExpandedRoles((prev) => ({
      ...prev,
      [roleId]: !prev[roleId],
    }));
  };

  const handleAddAssignment = (jobRoleId: string) => {
    setJobRoles((prev) =>
      prev.map((role) => {
        if (role.id === jobRoleId) {
          const availableAgencies = agencies.filter(
            (agency) => !role.forwarded.some((a) => a.agencyId === agency.id)
          );
          if (availableAgencies.length > 0) {
            return {
              ...role,
              forwarded: [
                ...role.forwarded,
                {
                  agencyId: availableAgencies[0].id,
                  quantity: role.originalQuantity,
                },
              ],
            };
          }
        }
        return role;
      })
    );
  };

  const handleRemoveAssignment = (jobRoleId: string, index: number) => {
    setJobRoles((prev) =>
      prev.map((role) => {
        if (role.id === jobRoleId) {
          const newForwarded = [...role.forwarded];
          newForwarded.splice(index, 1);
          return { ...role, forwarded: newForwarded };
        }
        return role;
      })
    );
  };

  const handleAgencyChange = (
    jobRoleId: string,
    assignmentIndex: number,
    agencyId: string
  ) => {
    setJobRoles((prev) =>
      prev.map((role) => {
        if (role.id === jobRoleId) {
          const newForwarded = [...role.forwarded];
          newForwarded[assignmentIndex] = {
            ...newForwarded[assignmentIndex],
            agencyId,
          };
          return { ...role, forwarded: newForwarded };
        }
        return role;
      })
    );
  };

  const handleQuantityChange = (
    jobRoleId: string,
    assignmentIndex: number,
    quantity: number
  ) => {
    setJobRoles((prev) =>
      prev.map((role) => {
        if (role.id === jobRoleId) {
          const newForwarded = [...role.forwarded];
          newForwarded[assignmentIndex] = {
            ...newForwarded[assignmentIndex],
            quantity: Math.max(0, quantity),
          };
          return { ...role, forwarded: newForwarded };
        }
        return role;
      })
    );
  };

  const handleSingleModeQuantityChange = (
    jobRoleId: string,
    quantity: number
  ) => {
    setJobRoles((prev) =>
      prev.map((role) => {
        if (role.id === jobRoleId) {
          return {
            ...role,
            originalQuantity: Math.max(0, quantity),
          };
        }
        return role;
      })
    );
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      let isValid = true;
      const errors: string[] = [];

      if (mode === "SINGLE") {
        if (!selectedAgency) {
          errors.push("Please select an agency");
          isValid = false;
        }

        if (isValid) {
          const assignments: ForwardingJobRole[] = jobRoles.map((role) => ({
            ...role,
            forwarded: [
              {
                agencyId: selectedAgency,
                quantity: role.originalQuantity,
              },
            ],
          }));
          await onForward(assignments);
          onClose();
        }
      } else {
        const assignments: ForwardingJobRole[] = [];

        for (const role of jobRoles) {
          if (role.forwarded.length === 0) {
            errors.push(`No agencies assigned for ${role.title}`);
            isValid = false;
            continue;
          }

          const totalAssigned = role.forwarded.reduce(
            (sum, a) => sum + a.quantity,
            0
          );
          if (totalAssigned <= 0) {
            errors.push(`Please assign quantities for ${role.title}`);
            isValid = false;
          }

          assignments.push(role);
        }

        if (isValid) {
          await onForward(assignments);
          onClose();
        }
      }

      if (errors.length > 0) {
        toast({
          type: "error",
          message: errors.join("\n"),
        });
      }
    } catch (error) {
      console.error("Error forwarding requirement:", error);
      toast({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to forward requirement",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAvailableAgencies = (jobRoleId: string, currentAgencyId: string) => {
    const currentRole = jobRoles.find((r) => r.id === jobRoleId);
    const assignedAgencyIds =
      currentRole?.forwarded.map((a) => a.agencyId) || [];
    return agencies.filter(
      (agency) =>
        agency.id === currentAgencyId || !assignedAgencyIds.includes(agency.id)
    );
  };

  const getTotalAssigned = (jobRoleId: string) => {
    const role = jobRoles.find((r) => r.id === jobRoleId);
    if (!role) return 0;
    return role.forwarded.reduce((sum, a) => sum + a.quantity, 0);
  };

  if (!requirement) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Forward ${isSingleRoleForward ? "Job Role" : "Requirement"}`}
      size="3xl"
      showFooter
      onConfirm={handleSubmit}
      confirmText="Forward"
      confirmVariant="default"
      isLoading={isSubmitting}
      confirmDisabled={mode === "SPLIT" && !allRolesAssigned}
    >
      <div className="space-y-6">
        <div className="flex space-x-4">
          <Button
            variant={mode === "SINGLE" ? "default" : "outline"}
            onClick={() => setMode("SINGLE")}
          >
            Single Agency
          </Button>
          <Button
            variant={mode === "SPLIT" ? "default" : "outline"}
            onClick={() => setMode("SPLIT")}
          >
            Split by Role
          </Button>
        </div>

        {mode === "SINGLE" ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Agency
              </label>
              <div className="flex space-x-2">
                <select
                  value={selectedAgency}
                  onChange={(e) => setSelectedAgency(e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded-md"
                >
                  {agencies.map((agency) => (
                    <option key={agency.id} value={agency.id}>
                      {agency.agencyName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">Job Roles to Forward</h3>
              <div className="border rounded-lg divide-y">
                {jobRoles.map((role) => (
                  <div key={role.id} className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">{role.title}</span>
                      <span className="text-gray-600">
                        Original Requirement: {role.originalQuantity}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <label className="text-sm text-gray-600">
                        Forward Quantity:
                      </label>
                      <Input
                        type="number"
                        min="0"
                        value={role.originalQuantity}
                        onChange={(e) => {
                          const newQuantity = Math.max(
                            0,
                            parseInt(e.target.value) || 0
                          );
                          handleSingleModeQuantityChange(role.id, newQuantity);
                        }}
                        className="w-24"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-medium">Assign Job Roles to Agencies</h3>
              <div className="space-y-4">
                {jobRoles.map((role) => (
                  <div
                    key={role.id}
                    className="border rounded-lg overflow-hidden"
                  >
                    <div
                      className="flex justify-between items-center p-4 cursor-pointer bg-gray-50 hover:bg-gray-100"
                      onClick={() => toggleRoleExpansion(role.id)}
                    >
                      <div className="flex items-center space-x-3">
                        {expandedRoles[role.id] ? (
                          <ChevronUp className="h-5 w-5 text-gray-500" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-500" />
                        )}
                        <div>
                          <h4 className="font-medium">{role.title}</h4>
                          <p className="text-sm text-gray-600">
                            Total Quantity: {role.originalQuantity}
                          </p>
                        </div>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">
                          Assigned: {getTotalAssigned(role.id)} /{" "}
                          {role.originalQuantity}
                        </span>
                      </div>
                    </div>

                    {expandedRoles[role.id] && (
                      <div className="p-4 space-y-3">
                        {role.forwarded.length === 0 && (
                          <p className="text-sm text-gray-500 italic">
                            No agencies assigned yet
                          </p>
                        )}
                        {role.forwarded.map((assignment, index) => (
                          <div
                            key={`${role.id}-${index}`}
                            className="flex items-center space-x-4"
                          >
                            <select
                              value={assignment.agencyId}
                              onChange={(e) =>
                                handleAgencyChange(
                                  role.id,
                                  index,
                                  e.target.value
                                )
                              }
                              className="flex-1 p-2 border border-gray-300 rounded-md"
                            >
                              {getAvailableAgencies(
                                role.id,
                                assignment.agencyId
                              ).map((agency) => (
                                <option key={agency.id} value={agency.id}>
                                  {agency.agencyName}
                                </option>
                              ))}
                            </select>

                            <div className="flex items-center space-x-2 w-48">
                              <Input
                                type="number"
                                min="0"
                                value={assignment.quantity}
                                onChange={(e) =>
                                  handleQuantityChange(
                                    role.id,
                                    index,
                                    parseInt(e.target.value) || 0
                                  )
                                }
                                className="w-full"
                              />
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                handleRemoveAssignment(role.id, index)
                              }
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={() => handleAddAssignment(role.id)}
                          disabled={role.forwarded.length >= agencies.length}
                          className="text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed"
                        >
                          + Add Agency Assignment
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default function Requirements() {
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [companies, setCompanies] = useState<Client[]>([]);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [currentRequirementIndex, setCurrentRequirementIndex] = useState(0);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [loadingRequirements, setLoadingRequirements] = useState(true);
  const [isForwardModalOpen, setIsForwardModalOpen] = useState(false);
  const [forwardingJobRoleId, setForwardingJobRoleId] = useState<string | null>(
    null
  );
  const { toast } = useToast();

  const currentRequirement = requirements[currentRequirementIndex];

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

  const fetchAgencies = useCallback(async () => {
    try {
      const response = await fetch("/api/agencies?status=VERIFIED");
      if (response.ok) {
        const data = await response.json();
        setAgencies(data);
      }
    } catch (error) {
      console.error("Error fetching agencies:", error);
      toast({
        type: "error",
        message: "Failed to load agencies",
      });
    }
  }, [toast]);

  const fetchRequirements = useCallback(
    async (companyId: string) => {
      try {
        setLoadingRequirements(true);
        const response = await fetch(
          `/api/requirements?clientId=${companyId}&status=SUBMITTED`,
          {
            credentials: "include",
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch requirements");
        }

        const data = await response.json();
        setRequirements(data);
        setCurrentRequirementIndex(0);
      } catch (error) {
        console.error("Error fetching requirements:", error);
        toast({
          type: "error",
          message:
            error instanceof Error
              ? error.message
              : "Failed to load requirements",
        });
      } finally {
        setLoadingRequirements(false);
      }
    },
    [toast]
  );

  const updateRequirementStatus = useCallback(
    async (requirementId: string, status: RequirementStatus) => {
      try {
        const response = await fetch(`/api/requirements/${requirementId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to update requirement");
        }

        const data = await response.json();
        toast({
          type: "success",
          message: `Requirement ${status.toLowerCase()} successfully`,
        });
        if (selectedCompany) {
          fetchRequirements(selectedCompany);
        }
        return data;
      } catch (error) {
        console.error("Error updating requirement:", error);
        toast({
          type: "error",
          message:
            error instanceof Error
              ? error.message
              : `Failed to ${status.toLowerCase()} requirement`,
        });
        throw error;
      }
    },
    [fetchRequirements, selectedCompany, toast]
  );

  const forwardRequirementToAgencies = useCallback(
    async (assignments: ForwardingJobRole[]) => {
      try {
        if (!currentRequirement) return;

        const forwardedRoles = assignments.flatMap((role) =>
          role.forwarded.map((a) => ({
            jobRoleId: role.id,
            agencyId: a.agencyId,
            quantity: a.quantity,
          }))
        );

        const isForwardingAll = !forwardingJobRoleId;

        const response = await fetch(`/api/requirements/forward`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            requirementId: currentRequirement.id,
            forwardedRoles,
            forwardAll: isForwardingAll,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to forward requirement");
        }

        toast({
          type: "success",
          message: `Requirement ${isForwardingAll ? "" : "job role "}forwarded successfully`,
        });
        setIsForwardModalOpen(false);
        setForwardingJobRoleId(null);
        if (selectedCompany) {
          fetchRequirements(selectedCompany);
        }
      } catch (error) {
        console.error("Error forwarding requirement:", error);
        toast({
          type: "error",
          message:
            error instanceof Error
              ? error.message
              : "Failed to forward requirement",
        });
        throw error;
      }
    },
    [
      currentRequirement,
      toast,
      selectedCompany,
      fetchRequirements,
      forwardingJobRoleId,
    ]
  );

  useEffect(() => {
    fetchCompanies();
    fetchAgencies();
  }, [fetchCompanies, fetchAgencies]);

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

  const handlePrevRequirement = () => {
    setCurrentRequirementIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleNextRequirement = () => {
    setCurrentRequirementIndex((prev) =>
      Math.min(prev + 1, requirements.length - 1)
    );
  };

  const handleReject = async (requirementId: string, jobRoleId?: string) => {
    if (confirm("Are you sure you want to reject this requirement?")) {
      await updateRequirementStatus(requirementId, "REJECTED");
    }
  };

  const handleForwardClick = (jobRoleId?: string) => {
    if (currentRequirement) {
      setForwardingJobRoleId(jobRoleId || null);
      setIsForwardModalOpen(true);
    }
  };

  const requirementSections: RequirementSection[] =
    currentRequirement?.jobRoles.map((role) => ({
      id: role.id,
      title: role.title,
      fields: [
        { label: "Quantity", value: role.quantity },
        { label: "Nationality", value: role.nationality },
        {
          label: "Salary",
          value: `${role.basicSalary} ${role.salaryCurrency}`,
        },
        {
          label: "Start Date",
          value: format(new Date(role.startDate), "dd MMM yyyy"),
        },
        {
          label: "Duration",
          value: role.contractDuration
            ? contractDurationMap[role.contractDuration]
            : "Not specified",
        },
      ],
      hasActions: true,
      foodProvidedByCompany: role.foodProvidedByCompany,
      foodAllowance: role.foodAllowance,
      housingProvidedByCompany: role.housingProvidedByCompany,
      housingAllowance: role.housingAllowance,
      transportationProvidedByCompany: role.transportationProvidedByCompany,
      transportationAllowance: role.transportationAllowance,
      mobileProvidedByCompany: role.mobileProvidedByCompany,
      mobileAllowance: role.mobileAllowance,
      natureOfWorkAllowance: role.natureOfWorkAllowance,
      otherAllowance: role.otherAllowance,
      salaryCurrency: role.salaryCurrency,
      workLocations: role.workLocations,
      previousExperience: role.previousExperience,
      languageRequirements: role.languageRequirements,
      healthInsurance: role.healthInsurance,
      ticketFrequency: role.ticketFrequency,
      totalExperienceYears: role.totalExperienceYears,
      preferredAge: role.preferredAge,
      specialRequirements: role.specialRequirements,
    })) || [];

  const RequirementSection = ({ section }: { section: RequirementSection }) => (
    <div className="p-6 rounded-lg shadow-sm mb-4">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-semibold text-[#150B3D]">
          {section.title}
        </h2>
        <div className="flex space-x-2">
          <Button onClick={() => handleForwardClick(section.id)} size="sm">
            Forward
          </Button>
          <Button
            onClick={() => handleReject(currentRequirement.id, section.id)}
            variant="outline"
            size="sm"
          >
            Reject
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {section.fields.map((field, index) => (
          <div key={index} className="flex flex-col">
            <p className="text-sm text-[#150B3D]/70">{field.label}:</p>
            <p className="text-[#150B3D] font-medium">{field.value}</p>
          </div>
        ))}
        <div className="flex flex-col">
          <p className="text-sm text-[#150B3D]/70">Total Experience:</p>
          <p className="text-[#150B3D] font-medium">
            {section.totalExperienceYears || "Not specified"} years
          </p>
        </div>
        <div className="flex flex-col">
          <p className="text-sm text-[#150B3D]/70">Preferred Age:</p>
          <p className="text-[#150B3D] font-medium">
            {section.preferredAge || "Not specified"}
          </p>
        </div>
        <div className="flex flex-col">
          <p className="text-sm text-[#150B3D]/70">Ticket Frequency:</p>
          <p className="text-[#150B3D] font-medium">
            {section.ticketFrequency || "Not specified"}
          </p>
        </div>
        <div className="flex flex-col">
          <p className="text-sm text-[#150B3D]/70">Special Requirements:</p>
          <p className="text-[#150B3D] font-medium">
            {section.specialRequirements || "None"}
          </p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t">
        <h3 className="font-medium text-[#150B3D] mb-2">
          Allowances & Benefits
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <p className="text-sm text-[#150B3D]/70">Food:</p>
            <p className="text-[#150B3D] font-medium">
              {section.foodProvidedByCompany
                ? "Provided by company"
                : `${section.foodAllowance} ${section.salaryCurrency}`}
            </p>
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-[#150B3D]/70">Housing:</p>
            <p className="text-[#150B3D] font-medium">
              {section.housingProvidedByCompany
                ? "Provided by company"
                : `${section.housingAllowance} ${section.salaryCurrency}`}
            </p>
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-[#150B3D]/70">Transportation:</p>
            <p className="text-[#150B3D] font-medium">
              {section.transportationProvidedByCompany
                ? "Provided by company"
                : `${section.transportationAllowance} ${section.salaryCurrency}`}
            </p>
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-[#150B3D]/70">Mobile:</p>
            <p className="text-[#150B3D] font-medium">
              {section.mobileProvidedByCompany
                ? "Provided by company"
                : `${section.mobileAllowance} ${section.salaryCurrency}`}
            </p>
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-[#150B3D]/70">
              Nature of Work Allowance:
            </p>
            <p className="text-[#150B3D] font-medium">
              {section.natureOfWorkAllowance
                ? `${section.natureOfWorkAllowance} ${section.salaryCurrency}`
                : "None"}
            </p>
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-[#150B3D]/70">Other Allowance:</p>
            <p className="text-[#150B3D] font-medium">
              {section.otherAllowance
                ? `${section.otherAllowance} ${section.salaryCurrency}`
                : "None"}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t">
        <h3 className="font-medium text-[#150B3D] mb-2">Requirements</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <p className="text-sm text-[#150B3D]/70">Work Locations:</p>
            <p className="text-[#150B3D] font-medium">
              {section.workLocations || "Not specified"}
            </p>
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-[#150B3D]/70">Previous Experience:</p>
            <p className="text-[#150B3D] font-medium">
              {section.previousExperience || "Not specified"}
            </p>
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-[#150B3D]/70">Language Requirements:</p>
            <p className="text-[#150B3D] font-medium">
              {section.languageRequirements || "Not specified"}
            </p>
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-[#150B3D]/70">Health Insurance:</p>
            <p className="text-[#150B3D] font-medium">
              {section.healthInsurance || "Not specified"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex">
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

      <div className="w-5/6 overflow-y-auto p-6">
        {loadingRequirements ? (
          <div className="bg-[#EDDDF3]/50 rounded-xl p-6 shadow-sm mb-6 animate-pulse h-64" />
        ) : currentRequirement ? (
          <>
            <div className="bg-[#EDDDF3]/50 rounded-xl p-6 shadow-sm mb-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-[#150B3D]">
                    {currentRequirement.client.companyName}
                  </h1>
                  <p className="text-[#150B3D]/80">
                    Submitted:{" "}
                    {format(
                      new Date(currentRequirement.createdAt),
                      "dd MMM yyyy"
                    )}
                  </p>
                </div>
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
              <div className="space-y-4">
                {requirementSections.map((section, index) => (
                  <RequirementSection key={index} section={section} />
                ))}
              </div>

              <div className="flex justify-end space-x-4 mt-6 pt-4 border-t">
                <Button
                  onClick={() => handleForwardClick()}
                  className="bg-[#150B3D] text-white py-2 px-6 rounded-md hover:bg-[#150B3D]/90 transition-colors"
                >
                  Forward Entire Requirement
                </Button>
                <Button
                  onClick={() => handleReject(currentRequirement.id)}
                  className="bg-red-600 text-white py-2 px-6 rounded-md hover:bg-red-700 transition-colors"
                >
                  Reject Entire Requirement
                </Button>
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

      <ForwardRequirementModal
        isOpen={isForwardModalOpen}
        onClose={() => {
          setIsForwardModalOpen(false);
          setForwardingJobRoleId(null);
        }}
        requirement={currentRequirement}
        agencies={agencies}
        onForward={forwardRequirementToAgencies}
        jobRoleId={forwardingJobRoleId || undefined}
      />
    </div>
  );
}
