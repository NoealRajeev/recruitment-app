// app/(protected)/dashboard/admin/requirements/page.tsx
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useToast } from "@/context/toast-provider";
import { format } from "date-fns";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { ChevronDown, ChevronUp, Trash2, User, Settings2 } from "lucide-react";
import { RequirementStatus, ContractDuration } from "@/lib/generated/prisma";
import { RequirementOptionsModal } from "@/components/shared/RequirementOptionsModal";

/* ----------------------------- Types ----------------------------- */

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

interface LabourProfile {
  id: string;
  name: string;
  profileImage?: string;
  age: number;
  gender: string;
  nationality: string;
  jobRole: string;
  status: string;
}

interface LabourAssignment {
  id: string;
  labour: LabourProfile;
  adminStatus: string;
  clientStatus: string;
  adminFeedback?: string;
  clientFeedback?: string;
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
  assignedAgency?: { agencyName: string } | null;
  forwardedQuantity?: number;
  needsMoreLabour?: boolean;
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
  fields: { label: string; value: string | number }[];
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
  forwarded: { agencyId: string; quantity: number }[];
}

interface ForwardRequirementModalProps {
  isOpen: boolean;
  onClose: () => void;
  requirement: Requirement | undefined;
  agencies: Agency[];
  onForward: (assignments: ForwardingJobRole[]) => Promise<void>;
}

/* ----------------------- Enum labels (read-only) ----------------------- */

const contractDurationMap: Record<ContractDuration, string> = {
  ONE_MONTH: "1 Month",
  THREE_MONTHS: "3 Months",
  SIX_MONTHS: "6 Months",
  ONE_YEAR: "1 Year",
  TWO_YEARS: "2 Years",
  THREE_YEARS: "3 Years",
  FIVE_PLUS_YEARS: "5+ Years",
};

/* --------------------- Requirement Options Manager --------------------- */
/** Admin-configurable enumerations (global) */

type RequirementOptionType =
  | "JOB_TITLE"
  | "TICKET_FREQUENCY"
  | "WORK_LOCATION"
  | "PREVIOUS_EXPERIENCE"
  | "LANGUAGE"
  | "CURRENCY";

interface RequirementOption {
  id: string;
  type: RequirementOptionType;
  value: string;
  order: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const TYPE_LABELS: Record<RequirementOptionType, string> = {
  JOB_TITLE: "Job Titles",
  TICKET_FREQUENCY: "Ticket Frequencies",
  WORK_LOCATION: "Work Locations",
  PREVIOUS_EXPERIENCE: "Previous Experience",
  LANGUAGE: "Languages",
  CURRENCY: "Currencies",
};

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-[#EDDDF3] text-[#150B3D] px-2.5 py-1 text-xs font-medium">
      {children}
    </span>
  );
}

function SectionCard({
  title,
  children,
  right,
}: {
  title: string;
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-[#EDDDF3] rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[#150B3D] font-semibold">{title}</h3>
        {right}
      </div>
      {children}
    </div>
  );
}

function Row({
  option,
  onSave,
  onDelete,
}: {
  option: RequirementOption;
  onSave: (o: RequirementOption) => void;
  onDelete: (id: string) => void;
}) {
  const [val, setVal] = useState(option.value);
  const [ord, setOrd] = useState<number | "">(option.order ?? "");
  const [active, setActive] = useState(option.isActive);

  return (
    <div className="grid grid-cols-[1fr_120px_110px_110px] gap-2 items-center">
      <Input
        value={val}
        onChange={(e) => setVal(e.target.value)}
        className="h-9"
        placeholder="Value"
      />
      <Input
        type="number"
        value={ord}
        onChange={(e) =>
          setOrd(e.target.value === "" ? "" : parseInt(e.target.value) || 0)
        }
        className="h-9"
        placeholder="Order"
      />
      <label className="inline-flex items-center gap-2 text-sm text-[#150B3D]">
        <input
          type="checkbox"
          checked={active}
          onChange={(e) => setActive(e.target.checked)}
          className="h-4 w-4"
        />
        Active
      </label>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          onClick={() =>
            onSave({
              ...option,
              value: val.trim(),
              order: ord === "" ? null : Number(ord),
              isActive: active,
            })
          }
        >
          Save
        </Button>
        <Button size="sm" variant="outline" onClick={() => onDelete(option.id)}>
          Delete
        </Button>
      </div>
    </div>
  );
}

function NewRow({
  type,
  onCreate,
}: {
  type: RequirementOptionType;
  onCreate: (
    payload: Omit<RequirementOption, "id" | "createdAt" | "updatedAt">
  ) => void;
}) {
  const [val, setVal] = useState("");
  const [ord, setOrd] = useState<number | "">("");
  const [active, setActive] = useState(true);

  return (
    <div className="grid grid-cols-[1fr_120px_110px_110px] gap-2 items-center">
      <Input
        value={val}
        onChange={(e) => setVal(e.target.value)}
        className="h-9"
        placeholder={`Add new ${TYPE_LABELS[type].slice(0, -1).toLowerCase()}`}
      />
      <Input
        type="number"
        value={ord}
        onChange={(e) =>
          setOrd(e.target.value === "" ? "" : parseInt(e.target.value) || 0)
        }
        className="h-9"
        placeholder="Order"
      />
      <label className="inline-flex items-center gap-2 text-sm text-[#150B3D]">
        <input
          type="checkbox"
          checked={active}
          onChange={(e) => setActive(e.target.checked)}
          className="h-4 w-4"
        />
        Active
      </label>
      <div>
        <Button
          size="sm"
          onClick={() => {
            if (!val.trim()) return;
            onCreate({
              type,
              value: val.trim(),
              order: ord === "" ? 0 : Number(ord),
              isActive: active,
            } as any);
            setVal("");
            setOrd("");
            setActive(true);
          }}
        >
          Add
        </Button>
      </div>
    </div>
  );
} /* ----------------------- Forward Requirement Modal ---------------------- */

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
  const [rejectedAgencies, setRejectedAgencies] = useState<Set<string>>(
    new Set()
  );

  const allRolesAssigned = useMemo(() => {
    if (mode !== "SPLIT") return true;
    return jobRoles.every(
      (role) =>
        role.forwarded.length > 0 && role.forwarded.some((a) => a.quantity > 0)
    );
  }, [jobRoles, mode]);

  useEffect(() => {
    if (requirement) {
      const rolesToForward = requirement.jobRoles;
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
      rolesToForward.forEach((role) => (expandedState[role.id] = false));
      setExpandedRoles(expandedState);

      const rejected = new Set<string>();
      requirement.jobRoles.forEach((role) => {
        if (role.agencyStatus === "REJECTED" && role.assignedAgencyId) {
          rejected.add(role.assignedAgencyId);
        }
      });
      setRejectedAgencies(rejected);
    }
  }, [requirement]);

  useEffect(() => {
    if (agencies.length > 0 && mode === "SINGLE") {
      setSelectedAgency(agencies[0].id);
    }
  }, [mode, agencies]);

  const toggleRoleExpansion = (roleId: string) =>
    setExpandedRoles((p) => ({ ...p, [roleId]: !p[roleId] }));

  const handleAddAssignment = (jobRoleId: string) =>
    setJobRoles((prev) =>
      prev.map((role) => {
        if (role.id === jobRoleId) {
          const availableAgencies = agencies.filter(
            (a) => !role.forwarded.some((f) => f.agencyId === a.id)
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

  const handleRemoveAssignment = (jobRoleId: string, index: number) =>
    setJobRoles((prev) =>
      prev.map((role) =>
        role.id === jobRoleId
          ? { ...role, forwarded: role.forwarded.filter((_, i) => i !== index) }
          : role
      )
    );

  const handleAgencyChange = (
    jobRoleId: string,
    assignmentIndex: number,
    agencyId: string
  ) =>
    setJobRoles((prev) =>
      prev.map((role) =>
        role.id === jobRoleId
          ? {
              ...role,
              forwarded: role.forwarded.map((f, i) =>
                i === assignmentIndex ? { ...f, agencyId } : f
              ),
            }
          : role
      )
    );

  const handleQuantityChange = (
    jobRoleId: string,
    assignmentIndex: number,
    quantity: number
  ) =>
    setJobRoles((prev) =>
      prev.map((role) =>
        role.id === jobRoleId
          ? {
              ...role,
              forwarded: role.forwarded.map((f, i) =>
                i === assignmentIndex
                  ? { ...f, quantity: Math.max(0, quantity) }
                  : f
              ),
            }
          : role
      )
    );

  const handleSingleModeQuantityChange = (
    jobRoleId: string,
    quantity: number
  ) =>
    setJobRoles((prev) =>
      prev.map((role) =>
        role.id === jobRoleId
          ? { ...role, originalQuantity: Math.max(0, quantity) }
          : role
      )
    );

  const getAvailableAgencies = (jobRoleId: string, currentAgencyId: string) => {
    const currentRole = jobRoles.find((r) => r.id === jobRoleId);
    const assigned = currentRole?.forwarded.map((a) => a.agencyId) || [];
    return agencies.filter(
      (a) =>
        (a.id === currentAgencyId || !assigned.includes(a.id)) &&
        !rejectedAgencies.has(a.id)
    );
  };

  const getTotalAssigned = (jobRoleId: string) => {
    const role = jobRoles.find((r) => r.id === jobRoleId);
    return role ? role.forwarded.reduce((s, a) => s + a.quantity, 0) : 0;
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const errors: string[] = [];

      if (mode === "SINGLE") {
        if (!selectedAgency) errors.push("Please select an agency");
        if (errors.length === 0) {
          await onForward(
            jobRoles.map((role) => ({
              ...role,
              forwarded: [
                { agencyId: selectedAgency, quantity: role.originalQuantity },
              ],
            }))
          );
          onClose();
        }
      } else {
        const assignments: ForwardingJobRole[] = [];
        for (const role of jobRoles) {
          if (role.forwarded.length === 0)
            errors.push(`No agencies assigned for ${role.title}`);
          if (role.forwarded.reduce((s, a) => s + a.quantity, 0) <= 0)
            errors.push(`Please assign quantities for ${role.title}`);
          assignments.push(role);
        }
        if (errors.length === 0) {
          await onForward(assignments);
          onClose();
        }
      }

      if (errors.length > 0) {
        useToast().toast({ type: "error", message: errors.join("\n") });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!requirement) return null;

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
        <div className="flex gap-2 sm:gap-4">
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
              <div className="flex flex-col sm:flex-row gap-2">
                <select
                  value={selectedAgency}
                  onChange={(e) => setSelectedAgency(e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded-md"
                >
                  {agencies.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.agencyName}
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
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-600">
                        Forward Quantity:
                      </label>
                      <Input
                        type="number"
                        min="0"
                        value={role.originalQuantity}
                        onChange={(e) =>
                          handleSingleModeQuantityChange(
                            role.id,
                            Math.max(0, parseInt(e.target.value) || 0)
                          )
                        }
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
                          className="flex flex-col sm:flex-row sm:items-center gap-3"
                        >
                          <select
                            value={assignment.agencyId}
                            onChange={(e) =>
                              handleAgencyChange(role.id, index, e.target.value)
                            }
                            className="flex-1 p-2 border border-gray-300 rounded-md"
                          >
                            {getAvailableAgencies(
                              role.id,
                              assignment.agencyId
                            ).map((a) => (
                              <option key={a.id} value={a.id}>
                                {a.agencyName}
                              </option>
                            ))}
                          </select>

                          <div className="flex items-center gap-2 w-full sm:w-48">
                            <Input
                              type="number"
                              min="0"
                              value={assignment.quantity}
                              onChange={(e) =>
                                handleQuantityChange(
                                  role.id,
                                  index,
                                  Math.max(0, parseInt(e.target.value) || 0)
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
        )}
      </div>
    </Modal>
  );
};

/* ----------------------- Helpers: status + timeago ---------------------- */

function getStatusColor(
  status: "PENDING_REVIEW" | "REJECTED" | "NOT_VERIFIED" | "VERIFIED"
) {
  switch (status) {
    case "VERIFIED":
      return "text-green-600";
    case "PENDING_REVIEW":
      return "text-yellow-600";
    case "REJECTED":
      return "text-red-600";
    case "NOT_VERIFIED":
    default:
      return "text-gray-500";
  }
}

function getStatusText(
  status: "PENDING_REVIEW" | "REJECTED" | "NOT_VERIFIED" | "VERIFIED"
) {
  switch (status) {
    case "VERIFIED":
      return "Verified";
    case "PENDING_REVIEW":
      return "Pending Review";
    case "REJECTED":
      return "Rejected";
    case "NOT_VERIFIED":
    default:
      return "Not Verified";
  }
}

/* =============================== Page ================================== */

export default function Requirements() {
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [companies, setCompanies] = useState<Client[]>([]);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [currentRequirementIndex, setCurrentRequirementIndex] = useState(0);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [loadingRequirements, setLoadingRequirements] = useState(true);
  const [isForwardModalOpen, setIsForwardModalOpen] = useState(false);
  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);
  const { toast } = useToast();
  const [rejectedAssignmentsByJobRole, setRejectedAssignmentsByJobRole] =
    useState<Record<string, LabourAssignment[]>>({});

  const currentRequirement = requirements[currentRequirementIndex];

  /* -------- data fetchers -------- */

  const fetchCompanies = useCallback(async () => {
    try {
      const response = await fetch("/api/clients?status=VERIFIED");
      if (response.ok) {
        const data = await response.json();
        setCompanies(data);
        if (data.length > 0 && !selectedCompany) setSelectedCompany(data[0].id);
      }
    } catch {
      toast({ type: "error", message: "Failed to load companies" });
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
    } catch {
      toast({ type: "error", message: "Failed to load agencies" });
    }
  }, [toast]);

  const fetchRequirements = useCallback(
    async (companyId: string) => {
      try {
        setLoadingRequirements(true);
        const response = await fetch(
          `/api/requirements?clientId=${companyId}&status=SUBMITTED,UNDER_REVIEW`,
          { credentials: "include" }
        );
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch requirements");
        }
        const data = await response.json();
        setRequirements(data);
        setCurrentRequirementIndex(0);
      } catch (error: any) {
        toast({
          type: "error",
          message: error?.message || "Failed to load requirements",
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
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to update requirement");
        }
        toast({
          type: "success",
          message: `Requirement ${status.toLowerCase()} successfully`,
        });
        if (selectedCompany) fetchRequirements(selectedCompany);
      } catch (error: any) {
        toast({
          type: "error",
          message:
            error?.message || `Failed to ${status.toLowerCase()} requirement`,
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
        const response = await fetch(`/api/requirements/forward`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
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
        if (selectedCompany) fetchRequirements(selectedCompany);
      } catch (error: any) {
        toast({
          type: "error",
          message: error?.message || "Failed to forward requirement",
        });
        throw error;
      }
    },
    [currentRequirement, toast, selectedCompany, fetchRequirements]
  );

  const fetchRejectedAssignments = async (jobRoleId: string) => {
    try {
      const response = await fetch(`/api/requirements/${jobRoleId}/assign`);
      if (response.ok) {
        const data = await response.json();
        const rejected = (data.assignments || []).filter(
          (a: LabourAssignment) =>
            a.adminStatus === "REJECTED" || a.clientStatus === "REJECTED"
        );
        setRejectedAssignmentsByJobRole((prev) => ({
          ...prev,
          [jobRoleId]: rejected,
        }));
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (currentRequirement)
      currentRequirement.jobRoles.forEach((r) =>
        fetchRejectedAssignments(r.id)
      );
  }, [currentRequirement]);

  useEffect(() => {
    fetchCompanies();
    fetchAgencies();
  }, [fetchCompanies, fetchAgencies]);

  useEffect(() => {
    if (selectedCompany) fetchRequirements(selectedCompany);
  }, [selectedCompany, fetchRequirements]);

  /* -------- UI helpers -------- */

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);
    if (diff < 60) return `${diff} sec ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hrs ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  };

  const handleReject = async (requirementId: string) => {
    if (confirm("Are you sure you want to reject this requirement?")) {
      await updateRequirementStatus(requirementId, "REJECTED");
    }
  };

  const handleForwardClick = () => {
    if (currentRequirement) setIsForwardModalOpen(true);
  };

  /* -------- Derive sections -------- */

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

  const RequirementSectionCard = ({
    section,
  }: {
    section: RequirementSection;
  }) => {
    const jobRole = currentRequirement!.jobRoles.find(
      (r) => r.id === section.id
    );
    const rejectedList = rejectedAssignmentsByJobRole[section.id] || [];
    const forwardedQuantity =
      jobRole?.forwardedQuantity ?? jobRole?.quantity ?? 0;
    const rejectionThreshold = forwardedQuantity - (jobRole?.quantity ?? 0);
    const adminRejectedCount = rejectedList.filter(
      (a) => a.adminStatus === "REJECTED"
    ).length;
    const needsMoreLabour = jobRole?.needsMoreLabour;
    const acceptedCount = rejectedList.filter(
      (a) => a.adminStatus === "ACCEPTED" && a.clientStatus === "ACCEPTED"
    ).length;
    const totalNeeded = forwardedQuantity - acceptedCount;

    return (
      <div className="p-6 rounded-lg shadow-sm mb-4 border border-[#EDDDF3] bg-white">
        <div className="flex flex-col gap-3 md:flex-row md:justify-between md:items-start mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-[#150B3D]">
              {section.title}
            </h2>
            {(adminRejectedCount > rejectionThreshold || needsMoreLabour) && (
              <span className="px-2 py-1 text-xs bg-red-600 text-white rounded-full animate-pulse font-bold">
                PRIORITY: More labour profiles needed!
              </span>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button onClick={handleForwardClick} size="sm">
              Forward
            </Button>
            <Button
              onClick={() => handleReject(currentRequirement!.id)}
              variant="outline"
              size="sm"
            >
              Reject
            </Button>
          </div>
        </div>

        {needsMoreLabour && (
          <div className="text-sm text-red-700 font-semibold mb-2">
            {`You need to assign ${totalNeeded} more labourer${totalNeeded !== 1 ? "s" : ""} to fulfill this requirement.`}
          </div>
        )}

        {(adminRejectedCount > rejectionThreshold || needsMoreLabour) &&
          rejectedList.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-red-600">
                Rejected Labourers:
              </h4>
              <ul className="text-xs text-gray-700 space-y-1">
                {rejectedList.map((a) => (
                  <li key={a.id} className="flex items-center gap-2">
                    <User className="h-4 w-4 text-red-400" />
                    <span>{a.labour?.name || "Unknown"}</span>
                    <span className="italic">
                      ({a.adminStatus === "REJECTED" ? "Admin" : "Client"}{" "}
                      Rejected)
                    </span>
                    {a.adminFeedback && (
                      <span className="ml-2 text-gray-400">
                        {a.adminFeedback}
                      </span>
                    )}
                    {a.clientFeedback && (
                      <span className="ml-2 text-gray-400">
                        {a.clientFeedback}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
              <div className="text-xs text-red-500 mt-1">
                Please assign replacements for these rejected profiles.
              </div>
            </div>
          )}

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
              <p className="text-sm text-[#150B3D]/70">
                Language Requirements:
              </p>
              <p className="text-[#150B3D] font-medium">
                {section.languageRequirements?.length
                  ? section.languageRequirements.join(", ")
                  : "Not specified"}
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
  };

  /* ------------------------------- Render ------------------------------- */

  return (
    <div className="flex flex-col md:flex-row">
      {/* Left Sidebar */}
      <aside className="w-full md:w-1/6 rounded-lg p-4 md:overflow-y-auto md:max-h-[calc(100vh-2rem)]">
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
                onClick={() => setSelectedCompany(company.id)}
                className={`p-3 rounded-lg cursor-pointer transition-colors border-l-4 ${
                  selectedCompany === company.id
                    ? "bg-[#EDDDF3] border-l-[#150B3D]"
                    : "bg-gray-50 hover:bg-[#EDDDF3]/50 border-l-gray-200"
                }`}
              >
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-[#150B3D]">
                    {company.id.slice(0, 8).toUpperCase()}
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
      </aside>

      {/* Right Content */}
      <main className="w-full md:w-5/6 p-4 md:p-6 md:overflow-y-auto md:max-h-[calc(100vh-2rem)]">
        {/* GLOBAL HEADER — always visible */}
        <div className="bg-[#EDDDF3]/50 border border-[#EDDDF3] rounded-xl p-4 mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-[#150B3D]">
              Requirements
            </h1>
            <p className="text-sm text-[#150B3D]/70">
              {selectedCompany
                ? `Company: ${companies.find((c) => c.id === selectedCompany)?.companyName || selectedCompany.slice(0, 8).toUpperCase()}`
                : "Select a company to view its requirements"}
            </p>
          </div>
          <div className="flex gap-2">
            {/* Only show prev/next when we actually have requirements */}
            {requirements.length > 0 && (
              <>
                <Button
                  onClick={() =>
                    setCurrentRequirementIndex((p) => Math.max(p - 1, 0))
                  }
                  disabled={currentRequirementIndex === 0}
                  variant="outline"
                >
                  Previous
                </Button>
                <Button
                  onClick={() =>
                    setCurrentRequirementIndex((p) =>
                      Math.min(p + 1, requirements.length - 1)
                    )
                  }
                  disabled={currentRequirementIndex === requirements.length - 1}
                  variant="outline"
                >
                  Next
                </Button>
                <span className="hidden sm:flex items-center text-sm text-[#150B3D] px-2">
                  {currentRequirementIndex + 1} of {requirements.length}
                </span>
              </>
            )}

            {/* GLOBAL Manage Requirement Options */}
            <Button
              onClick={() => setIsOptionsModalOpen(true)}
              className="bg-[#150B3D] text-white hover:bg-[#150B3D]/90"
            >
              <Settings2 className="w-4 h-4 mr-2" />
              Manage Requirement Options
            </Button>
          </div>
        </div>

        {/* Body */}
        {loadingRequirements ? (
          <div className="bg-[#EDDDF3]/50 rounded-xl p-6 shadow-sm mb-6 animate-pulse h-64" />
        ) : requirements.length > 0 && currentRequirement ? (
          <div className="bg-[#EDDDF3]/50 rounded-xl p-4 md:p-6 shadow-sm mb-6">
            <div className="flex flex-col gap-3 md:flex-row md:justify-between md:items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-[#150B3D]">
                  {currentRequirement.id.slice(0, 8).toUpperCase()}
                </h2>
                <p className="text-[#150B3D]/80">
                  Submitted:{" "}
                  {format(
                    new Date(currentRequirement.createdAt),
                    "dd MMM yyyy"
                  )}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {requirementSections.map((section, index) => (
                <RequirementSectionCard key={index} section={section} />
              ))}
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6 pt-4 border-t">
              <Button
                onClick={handleForwardClick}
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
        ) : (
          // Friendly empty state but header (with Manage button) remains visible
          <div className="bg-[#EDDDF3]/40 rounded-xl p-8 shadow-sm flex flex-col items-center justify-center h-64 text-center">
            <div className="text-[#150B3D] font-medium">
              {selectedCompany
                ? "No SUBMITTED/UNDER_REVIEW requirements for this company."
                : "Select a company on the left to view requirements."}
            </div>
            <div className="text-sm text-[#150B3D]/70 mt-2">
              You can still manage the global requirement options using the
              button above.
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <ForwardRequirementModal
        isOpen={isForwardModalOpen}
        onClose={() => setIsForwardModalOpen(false)}
        requirement={currentRequirement}
        agencies={agencies}
        onForward={forwardRequirementToAgencies}
      />

      <RequirementOptionsModal
        isOpen={isOptionsModalOpen}
        onClose={() => setIsOptionsModalOpen(false)}
      />
    </div>
  );
}
