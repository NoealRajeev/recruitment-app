"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useToast } from "@/context/toast-provider";
import { format } from "date-fns";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { ExperienceLevel, TicketType } from "@/lib/generated/prisma";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";

interface Company {
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
  salary: string;
  salaryCurrency: string;
  startDate: string;
  contractDuration: string;
}

interface Requirement {
  id: string;
  projectLocation: string;
  startDate: string | null;
  contractDuration: string | null;
  languageRequirements: string[];
  minExperience: ExperienceLevel | null;
  maxAge: number | null;
  specialNotes: string | null;
  ticketType: TicketType | null;
  ticketProvided: boolean;
  status: string;
  jobRoles: JobRole[];
  createdAt: string;
  client?: {
    companyName: string;
    fullName: string;
    jobTitle: string;
    email: string;
    phone: string;
  };
}

interface RequirementSection {
  title: string;
  fields: {
    label: string;
    value: string | number;
  }[];
  hasActions?: boolean;
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
}

const experienceLevelMap: Record<string, string> = {
  FRESH: "Fresh",
  ONE_YEAR: "1 Year",
  TWO_YEARS: "2 Years",
  THREE_YEARS: "3 Years",
  FOUR_YEARS: "4 Years",
  FIVE_PLUS_YEARS: "5+ Years",
};

const ticketTypeMap: Record<string, string> = {
  ONE_WAY: "One Way",
  TWO_WAY: "Two Way",
  NONE: "None",
};

const contractDurationMap: Record<string, string> = {
  ONE_YEAR: "1 Year",
  TWO_YEARS: "2 Years",
  THREE_YEARS: "3 Years",
  UNLIMITED: "Unlimited",
};

const ForwardRequirementModal = ({
  isOpen,
  onClose,
  requirement,
  agencies,
  onForward,
}: ForwardRequirementModalProps) => {
  const [mode, setMode] = useState<"SINGLE" | "SPLIT">("SINGLE");
  const [selectedAgency, setSelectedAgency] = useState<string>("");
  const [jobRoles, setJobRoles] = useState<ForwardingJobRole[]>([]);
  const [expandedRoles, setExpandedRoles] = useState<Record<string, boolean>>(
    {}
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const allRolesAssigned = useMemo(() => {
    if (mode !== "SPLIT") return true;
    return jobRoles.every(
      (role) =>
        role.forwarded.length > 0 && role.forwarded.some((a) => a.quantity > 0)
    );
  }, [jobRoles, mode]);

  useEffect(() => {
    if (requirement) {
      const initialJobRoles: ForwardingJobRole[] = requirement.jobRoles.map(
        (role) => ({
          id: role.id,
          title: role.title,
          originalQuantity: role.quantity,
          forwarded: [],
        })
      );
      setJobRoles(initialJobRoles);

      const expandedState: Record<string, boolean> = {};
      requirement.jobRoles.forEach((role) => {
        expandedState[role.id] = false;
      });
      setExpandedRoles(expandedState);
    }
  }, [requirement]);

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
      title="Forward Requirement"
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
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{role.title}</span>
                      <span className="text-gray-600">
                        Quantity: {role.originalQuantity}
                      </span>
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
  const [companies, setCompanies] = useState<Company[]>([]);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [currentRequirementIndex, setCurrentRequirementIndex] = useState(0);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [loadingRequirements, setLoadingRequirements] = useState(true);
  const [isForwardModalOpen, setIsForwardModalOpen] = useState(false);
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
          `/api/admin/requirements?clientId=${companyId}`
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
    async (requirementId: string, status: "APPROVED" | "REJECTED") => {
      try {
        const response = await fetch(`/api/admin/requirements`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: requirementId,
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
          role.forwarded
            .filter((a) => a.quantity > 0)
            .map((a) => ({
              id: role.id,
              title: role.title,
              quantity: role.originalQuantity,
              nationality: "",
              salary: "",
              salaryCurrency: "QAR",
              startDate: "",
              contractDuration: "",
              agencyId: a.agencyId,
              forwardedQuantity: a.quantity,
            }))
        );

        if (forwardedRoles.length === 0) {
          throw new Error("No valid assignments to forward");
        }

        const response = await fetch(`/api/admin/requirements/forward`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            requirementId: currentRequirement.id,
            forwardedRoles,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to forward requirement");
        }

        toast({
          type: "success",
          message: "Requirement forwarded successfully",
        });
        setIsForwardModalOpen(false);
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
    [currentRequirement, toast, selectedCompany, fetchRequirements]
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

  const handleReject = async (requirementId: string) => {
    if (confirm("Are you sure you want to reject this requirement?")) {
      await updateRequirementStatus(requirementId, "REJECTED");
    }
  };

  const handleForwardClick = () => {
    if (currentRequirement) {
      setIsForwardModalOpen(true);
    }
  };

  const requirementSections: RequirementSection[] =
    currentRequirement?.jobRoles.map((role) => ({
      title: role.title,
      fields: [
        { label: "Quantity", value: role.quantity },
        { label: "Nationality", value: role.nationality },
        { label: "Salary", value: `${role.salary} ${role.salaryCurrency}` },
        {
          label: "Start Date",
          value: role.startDate
            ? format(new Date(role.startDate), "dd MMM yyyy")
            : "Not specified",
        },
        {
          label: "Duration",
          value: role.contractDuration
            ? contractDurationMap[role.contractDuration] ||
              role.contractDuration
            : "Not specified",
        },
      ],
      hasActions: true,
    })) || [];

  const additionalInfo = [
    {
      label: "Language Requirements",
      value:
        currentRequirement?.languageRequirements?.join(", ") || "Not specified",
    },
    {
      label: "Minimum Experience",
      value:
        (currentRequirement?.minExperience &&
          experienceLevelMap[currentRequirement.minExperience]) ||
        "Not specified",
    },
    {
      label: "Maximum Age",
      value: currentRequirement?.maxAge?.toString() || "Not specified",
    },
    {
      label: "Ticket Type",
      value:
        (currentRequirement?.ticketType &&
          ticketTypeMap[currentRequirement.ticketType]) ||
        "Not specified",
    },
    {
      label: "Ticket Provided",
      value: currentRequirement?.ticketProvided ? "Yes" : "No",
    },
    {
      label: "Special Requirements",
      value: currentRequirement?.specialNotes || "None",
    },
  ];

  const RequirementSection = ({ section }: { section: RequirementSection }) => (
    <div className="p-6">
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

              <div className="flex justify-end space-x-4 mt-4">
                <Button
                  onClick={handleForwardClick}
                  className="bg-[#150B3D] text-white py-2 px-6 rounded-md hover:bg-[#150B3D]/90 transition-colors"
                >
                  Forward Requirement
                </Button>
                <Button
                  onClick={() => handleReject(currentRequirement.id)}
                  className="bg-red-600 text-white py-2 px-6 rounded-md hover:bg-red-700 transition-colors"
                >
                  Reject Requirement
                </Button>
              </div>

              <div className="my-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {requirementSections.map((section, index) => (
                    <div
                      key={index}
                      className={`
            relative
            ${index % 3 !== 2 ? "lg:after:block" : "lg:after:hidden"}
            ${index % 2 !== 1 ? "md:after:block" : "md:after:hidden"}
            after:absolute after:top-1/2 after:translate-y-[-50%] after:right-0
            after:w-px after:bg-[#635372]/37 after:h-3/4
          `}
                    >
                      <RequirementSection section={section} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-[#EDDDF3]/50 rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-[#150B3D] mb-4">
                Additional Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
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
      <ForwardRequirementModal
        isOpen={isForwardModalOpen}
        onClose={() => setIsForwardModalOpen(false)}
        requirement={currentRequirement}
        agencies={agencies}
        onForward={forwardRequirementToAgencies}
      />
    </div>
  );
}
