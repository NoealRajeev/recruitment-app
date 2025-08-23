/* eslint-disable @next/next/no-img-element */
// app/(protected)/dashboard/agency/requirements/page.tsx
"use client";

import { Card, CardContent, CardHeader } from "@/components/shared/Card";
import { Button } from "@/components/ui/Button";
import {
  Clock,
  Calendar,
  Flag,
  X,
  DollarSign,
  Home,
  Utensils,
  Bus,
  Smartphone,
  Plane,
  Briefcase,
  User,
  Search,
} from "lucide-react";
import { useToast } from "@/context/toast-provider";
import { useState, useEffect, useMemo } from "react";
import { RequirementStatus, ContractDuration } from "@/lib/generated/prisma";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";

interface JobRoleAssignment {
  id: string;
  title: string;
  quantity: number;
  forwardedQuantity?: number;
  nationality: string;
  basicSalary: number;
  salaryCurrency: string;
  startDate: Date | string;
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
  agencyStatus: RequirementStatus;
  createdAt: Date | string;
  updatedAt: Date | string;
  needsMoreLabour: boolean;
}

interface LabourProfile {
  id: string;
  name: string;
  profileImage?: string;
  age: number;
  gender: string;
  nationality: string;
  jobRole: string;
  status: "RECEIVED" | "UNDER_REVIEW" | "APPROVED" | string;
}

interface LabourAssignment {
  id: string;
  labour: LabourProfile;
  adminStatus: "PENDING" | "ACCEPTED" | "REJECTED" | string;
  clientStatus: "PENDING" | "ACCEPTED" | "REJECTED" | string;
  adminFeedback?: string;
  clientFeedback?: string;
}

export default function AssignedRequirements() {
  const [assignments, setAssignments] = useState<JobRoleAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingAssignment, setUpdatingAssignment] = useState<string | null>(
    null
  );
  const { toast } = useToast();

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [currentAssignment, setCurrentAssignment] =
    useState<JobRoleAssignment | null>(null);

  const [labourProfiles, setLabourProfiles] = useState<LabourProfile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<LabourProfile[]>([]);
  const [selectedProfiles, setSelectedProfiles] = useState<string[]>([]);
  const [assigningProfiles, setAssigningProfiles] = useState(false);
  const [rejectedAssignmentsByJobRole, setRejectedAssignmentsByJobRole] =
    useState<Record<string, LabourAssignment[]>>({});

  // search + filters
  const [searchTerm, setSearchTerm] = useState("");
  const [nationalityFilter, setNationalityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [ageFilter, setAgeFilter] = useState("");
  const [verificationStatusFilter, setVerificationStatusFilter] =
    useState("VERIFIED");
  const [experienceFilter, setExperienceFilter] = useState("");
  const [languagesFilter, setLanguagesFilter] = useState<string[]>([]);

  const [allAssignmentsForCurrent, setAllAssignmentsForCurrent] = useState<
    LabourAssignment[]
  >([]);

  // helpers
  const targetCount = useMemo(
    () =>
      currentAssignment
        ? (currentAssignment.forwardedQuantity ?? currentAssignment.quantity)
        : 0,
    [currentAssignment]
  );

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/requirements/assignments");
        if (!response.ok) throw new Error("Fetch failed");
        const data: { assignments: JobRoleAssignment[] } =
          await response.json();
        setAssignments(data.assignments);
      } catch (error) {
        console.error("Error fetching assignments:", error);
        toast({ type: "error", message: "Failed to load assignments" });
      } finally {
        setLoading(false);
      }
    };
    fetchAssignments();

    // hourly refresh (cleanup old rejects etc.)
    const interval = setInterval(fetchAssignments, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [toast]);

  const fetchLabourProfiles = async (
    jobRole: string,
    nationality: string,
    age?: number,
    status?: string,
    verificationStatus?: string,
    experience?: string,
    languages?: string[]
  ) => {
    const params = new URLSearchParams();
    params.append("jobRole", jobRole);
    params.append("nationality", nationality);
    if (age) params.append("age", String(age));
    if (status) params.append("status", status);
    if (verificationStatus)
      params.append("verificationStatus", verificationStatus);
    if (experience) params.append("experience", experience);
    if (languages?.length) params.append("languages", languages.join(","));

    try {
      const response = await fetch(
        `/api/agencies/labour-profiles?${params.toString()}`
      );
      if (!response.ok) throw new Error("Failed to fetch labour profiles");
      const data = await response.json();
      setLabourProfiles(data.labourProfiles);
      setFilteredProfiles(data.labourProfiles);
    } catch (error) {
      console.error("Error fetching labour profiles:", error);
      toast({ type: "error", message: "Failed to load labour profiles" });
    }
  };

  // derive filters on client list
  useEffect(() => {
    if (!labourProfiles.length) return;

    let result = [...labourProfiles];

    // exclude rejected if we need more labour (prevents resubmitting)
    if (currentAssignment) {
      const currentRejectedAssignments =
        rejectedAssignmentsByJobRole[currentAssignment.id] || [];
      const acceptedPrimaries =
        currentRejectedAssignments.filter(
          (a) => a.adminStatus === "ACCEPTED" && a.clientStatus === "ACCEPTED"
        ).length || 0;
      const needsMoreLabour = acceptedPrimaries < currentAssignment.quantity;

      if (needsMoreLabour) {
        const rejectedLabourIds = new Set(
          currentRejectedAssignments.map((a) => a.labour?.id).filter(Boolean)
        );
        result = result.filter((p) => !rejectedLabourIds.has(p.id));
      }
    }

    // search
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.nationality.toLowerCase().includes(term) ||
          p.jobRole.toLowerCase().includes(term)
      );
    }
    // nationality
    if (nationalityFilter)
      result = result.filter((p) => p.nationality === nationalityFilter);
    // status
    if (statusFilter) result = result.filter((p) => p.status === statusFilter);
    // age
    if (ageFilter) {
      const [min, max] = ageFilter.split("-").map(Number);
      result = max
        ? result.filter((p) => p.age >= min && p.age <= max)
        : result.filter((p) => p.age >= min);
    }

    setFilteredProfiles(result);
  }, [
    searchTerm,
    nationalityFilter,
    statusFilter,
    ageFilter,
    labourProfiles,
    currentAssignment,
    rejectedAssignmentsByJobRole,
  ]);

  const fetchRejectedAssignments = async (jobRoleId: string) => {
    try {
      const response = await fetch(`/api/requirements/${jobRoleId}/assign`);
      if (!response.ok) return;
      const data = await response.json();
      const rejected = (data.assignments || []).filter(
        (a: LabourAssignment) =>
          a.adminStatus === "REJECTED" || a.clientStatus === "REJECTED"
      );
      setRejectedAssignmentsByJobRole((prev) => ({
        ...prev,
        [jobRoleId]: rejected,
      }));
    } catch {
      // ignore network hiccups
    }
  };

  // refresh rejects whenever assignment set changes
  useEffect(() => {
    assignments.forEach((a) => fetchRejectedAssignments(a.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignments.length]);

  const fetchAllAssignmentsForCurrent = async (jobRoleId: string) => {
    try {
      const response = await fetch(`/api/requirements/${jobRoleId}/assign`);
      if (!response.ok) throw new Error();
      const data = await response.json();
      setAllAssignmentsForCurrent(data.assignments || []);
    } catch {
      setAllAssignmentsForCurrent([]);
    }
  };

  const getNonRejectedAssignmentsCount = () =>
    allAssignmentsForCurrent.filter(
      (a) => a.adminStatus !== "REJECTED" && a.clientStatus !== "REJECTED"
    ).length;

  const getRemainingSlots = () =>
    Math.max(targetCount - getNonRejectedAssignmentsCount(), 0);

  const handleOpenAssignModal = async (assignment: JobRoleAssignment) => {
    setCurrentAssignment(assignment);
    await fetchLabourProfiles(
      assignment.title,
      assignment.nationality,
      assignment.preferredAge || undefined,
      "APPROVED",
      verificationStatusFilter,
      experienceFilter,
      languagesFilter
    );
    fetchRejectedAssignments(assignment.id);
    await fetchAllAssignmentsForCurrent(assignment.id);
    setIsAssignModalOpen(true);
  };

  const handleCloseAssignModal = () => {
    setIsAssignModalOpen(false);
    setSelectedProfiles([]);
    setCurrentAssignment(null);
    setSearchTerm("");
    setNationalityFilter("");
    setStatusFilter("");
    setAgeFilter("");
  };

  const handleProfileSelection = (profileId: string) => {
    setSelectedProfiles((prev) => {
      if (prev.includes(profileId))
        return prev.filter((id) => id !== profileId);
      if (prev.length < getRemainingSlots()) return [...prev, profileId];
      return prev;
    });
  };

  const handleAssignProfiles = async () => {
    if (!currentAssignment || selectedProfiles.length === 0) return;
    try {
      setAssigningProfiles(true);
      const response = await fetch(
        `/api/requirements/${currentAssignment.id}/assign`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profileIds: selectedProfiles }),
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `Failed to assign profiles: ${response.statusText}`
        );
      }
      const result = await response.json();
      setAssignments((prev) =>
        prev.map((a) =>
          a.id === currentAssignment.id
            ? { ...a, agencyStatus: result.jobRole.agencyStatus }
            : a
        )
      );
      toast({
        type: "success",
        message: `Successfully assigned ${selectedProfiles.length} profiles`,
      });
      handleCloseAssignModal();
    } catch (error) {
      console.error("Error assigning profiles:", error);
      toast({
        type: "error",
        message:
          error instanceof Error ? error.message : "Failed to assign profiles",
      });
    } finally {
      setAssigningProfiles(false);
    }
  };

  const handleUpdateAssignmentStatus = async (
    assignmentId: string,
    status: "ACCEPTED" | "REJECTED"
  ) => {
    try {
      setUpdatingAssignment(assignmentId);
      const response = await fetch(`/api/requirements/${assignmentId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error("Failed to update assignment status");
      const updatedAssignment = await response.json();
      setAssignments((prev) =>
        prev.map((a) => (a.id === assignmentId ? updatedAssignment : a))
      );
      toast({
        type: "success",
        message: `Assignment ${status.toLowerCase()} successfully`,
      });
    } catch (error) {
      console.error("Error updating assignment:", error);
      toast({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to update assignment",
      });
    } finally {
      setUpdatingAssignment(null);
    }
  };

  const getStatusBadge = (status: RequirementStatus) => {
    switch (status) {
      case "ACCEPTED":
        return (
          <Badge className="bg-green-500 hover:bg-green-600">Accepted</Badge>
        );
      case "PARTIALLY_ACCEPTED":
        return (
          <Badge className="bg-teal-500 hover:bg-teal-600">
            Partially Accepted
          </Badge>
        );
      case "REJECTED":
        return <Badge className="bg-red-500 hover:bg-red-600">Rejected</Badge>;
      case "AGENCY_REJECTED":
        return (
          <Badge className="bg-orange-500 hover:bg-orange-600">
            Agency Rejected
          </Badge>
        );
      case "FORWARDED":
        return (
          <Badge className="bg-blue-500 hover:bg-blue-600">Forwarded</Badge>
        );
      case "UNDER_REVIEW":
        return (
          <Badge className="bg-yellow-500 hover:bg-yellow-600">
            Needs Review
          </Badge>
        );
      case "COMPLETED":
        return (
          <Badge className="bg-purple-500 hover:bg-purple-600">Completed</Badge>
        );
      default:
        return (
          <Badge className="bg-gray-500 hover:bg-gray-600">{status}</Badge>
        );
    }
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "Flexible";
    const d = typeof date === "string" ? new Date(date) : date;
    if (Number.isNaN(d.getTime?.())) return "Flexible";
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getDuration = (duration: ContractDuration | null) => {
    switch (duration) {
      case "ONE_MONTH":
        return "1 Month";
      case "THREE_MONTHS":
        return "3 Months";
      case "SIX_MONTHS":
        return "6 Months";
      case "ONE_YEAR":
        return "1 Year";
      case "TWO_YEARS":
        return "2 Years";
      case "THREE_YEARS":
        return "3 Years";
      case "FIVE_PLUS_YEARS":
        return "5+ Years";
      default:
        return "To be determined";
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card
              key={i}
              className="border border-[#EDDDF3] bg-[#EDDDF3]/20 h-64 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!assignments.length) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-xl font-medium text-gray-500">
            No requirements assigned to your agency yet
          </h2>
          <p className="mt-2 text-gray-400">
            Verified requirements from companies will appear here once assigned
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {assignments.map((assignment) => {
          const rejectionThreshold =
            (assignment.forwardedQuantity ?? assignment.quantity) -
            assignment.quantity;
          const adminRejectedCount =
            rejectedAssignmentsByJobRole[assignment.id]?.filter(
              (a) => a.adminStatus === "REJECTED"
            ).length || 0;

          return (
            <Card
              key={assignment.id}
              className="hover:shadow-lg transition-shadow border border-[#EDDDF3] bg-[#EDDDF3]/20"
            >
              <CardHeader>
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0">
                    <h3 className="font-medium truncate">{assignment.title}</h3>
                    {adminRejectedCount > rejectionThreshold && (
                      <span className="mt-2 inline-flex px-2 py-1 text-xs bg-red-600 text-white rounded-full animate-pulse font-bold">
                        PRIORITY: More labour profiles needed!
                      </span>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    {getStatusBadge(assignment.agencyStatus)}
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  <div className="border-t border-[#EDDDF3] pt-4">
                    <div className="pl-3 space-y-3">
                      <div className="flex justify-between">
                        <div className="flex items-center text-sm">
                          <Flag className="h-4 w-4 mr-2 text-gray-500" />
                          {assignment.nationality}
                        </div>
                        <div className="text-sm font-medium">
                          Quantity:{" "}
                          {assignment.forwardedQuantity ?? assignment.quantity}
                        </div>
                      </div>

                      <div className="flex items-center text-sm">
                        <DollarSign className="h-4 w-4 mr-2 text-gray-500" />
                        <span>
                          {assignment.basicSalary} {assignment.salaryCurrency}
                        </span>
                      </div>

                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                        <span>Start: {formatDate(assignment.startDate)}</span>
                      </div>

                      <div className="flex items-center text-sm">
                        <Clock className="h-4 w-4 mr-2 text-gray-500" />
                        <span>
                          Duration: {getDuration(assignment.contractDuration)}
                        </span>
                      </div>

                      <div className="flex items-center text-sm">
                        <Briefcase className="h-4 w-4 mr-2 text-gray-500" />
                        <span>
                          Health Insurance: {assignment.healthInsurance}
                        </span>
                      </div>

                      <div className="flex items-center text-sm">
                        <Plane className="h-4 w-4 mr-2 text-gray-500" />
                        <span>Tickets: {assignment.ticketFrequency}</span>
                      </div>

                      {/* Allowances */}
                      <div className="pt-2">
                        <h4 className="text-sm font-medium mb-1">
                          Allowances:
                        </h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center">
                            <Utensils className="h-4 w-4 mr-1 text-gray-500" />
                            {assignment.foodProvidedByCompany
                              ? "Food provided"
                              : `${assignment.foodAllowance ?? 0} ${assignment.salaryCurrency}`}
                          </div>
                          <div className="flex items-center">
                            <Home className="h-4 w-4 mr-1 text-gray-500" />
                            {assignment.housingProvidedByCompany
                              ? "Housing provided"
                              : `${assignment.housingAllowance ?? 0} ${assignment.salaryCurrency}`}
                          </div>
                          <div className="flex items-center">
                            <Bus className="h-4 w-4 mr-1 text-gray-500" />
                            {assignment.transportationProvidedByCompany
                              ? "Transport provided"
                              : `${assignment.transportationAllowance ?? 0} ${assignment.salaryCurrency}`}
                          </div>
                          <div className="flex items-center">
                            <Smartphone className="h-4 w-4 mr-1 text-gray-500" />
                            {assignment.mobileProvidedByCompany
                              ? "Mobile provided"
                              : `${assignment.mobileAllowance ?? 0} ${assignment.salaryCurrency}`}
                          </div>
                        </div>
                      </div>

                      {/* Requirements */}
                      <div className="pt-2">
                        <h4 className="text-sm font-medium mb-1">
                          Requirements:
                        </h4>
                        <div className="text-sm space-y-1">
                          <div>
                            <span className="font-medium">
                              Work Locations:{" "}
                            </span>
                            {assignment.workLocations}
                          </div>
                          <div>
                            <span className="font-medium">Experience: </span>
                            {assignment.totalExperienceYears
                              ? `${assignment.totalExperienceYears} years`
                              : "Not specified"}
                          </div>
                          <div>
                            <span className="font-medium">Preferred Age: </span>
                            {assignment.preferredAge || "Not specified"}
                          </div>
                          <div>
                            <span className="font-medium">Languages: </span>
                            {assignment.languageRequirements.join(", ")}
                          </div>
                          {assignment.specialRequirements && (
                            <div>
                              <span className="font-medium">Notes: </span>
                              {assignment.specialRequirements}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Rejected list when exceeding threshold */}
                      {adminRejectedCount > rejectionThreshold && (
                        <div className="mt-2">
                          <h4 className="text-sm font-semibold text-red-600">
                            Rejected Labourers:
                          </h4>
                          <ul className="text-xs text-gray-700 space-y-1">
                            {rejectedAssignmentsByJobRole[assignment.id]?.map(
                              (a) => (
                                <li
                                  key={a.id}
                                  className="flex items-center gap-2"
                                >
                                  <User className="h-4 w-4 text-red-400" />
                                  <span>{a.labour?.name || "Unknown"}</span>
                                  <span className="italic">
                                    (
                                    {a.adminStatus === "REJECTED"
                                      ? "Admin"
                                      : "Client"}{" "}
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
                              )
                            )}
                          </ul>
                          <div className="text-xs text-red-500 mt-1">
                            Please assign replacements for these rejected
                            profiles.
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* action buttons */}
                  {(() => {
                    const shouldShowButtons =
                      assignment.agencyStatus === "FORWARDED" ||
                      adminRejectedCount > rejectionThreshold;
                    return shouldShowButtons ? (
                      <div className="flex justify-between pt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleUpdateAssignmentStatus(
                              assignment.id,
                              "REJECTED"
                            )
                          }
                          disabled={updatingAssignment === assignment.id}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleOpenAssignModal(assignment)}
                          disabled={updatingAssignment === assignment.id}
                        >
                          <User className="h-4 w-4 mr-2" />
                          Assign
                        </Button>
                      </div>
                    ) : null;
                  })()}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Assign Modal */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={handleCloseAssignModal}
        title={`Assign Labour Profiles - ${currentAssignment?.title ?? ""}`}
        size="7xl"
        showFooter
        footerContent={
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between w-full">
            <div className="text-sm text-gray-600">
              Selected: {selectedProfiles.length} / {getRemainingSlots()}
              {selectedProfiles.length >= getRemainingSlots() &&
                getRemainingSlots() > 0 && (
                  <span className="ml-2 text-green-600">(Limit reached)</span>
                )}
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  if (selectedProfiles.length > 0) {
                    setSelectedProfiles([]);
                  } else {
                    const slots = getRemainingSlots();
                    const toSelect = filteredProfiles
                      .slice(0, slots)
                      .map((p) => p.id);
                    setSelectedProfiles(toSelect);
                  }
                }}
                disabled={
                  filteredProfiles.length === 0 || getRemainingSlots() === 0
                }
              >
                {selectedProfiles.length > 0
                  ? "Deselect All"
                  : `Select ${getRemainingSlots()}`}
              </Button>
              <Button variant="outline" onClick={handleCloseAssignModal}>
                Cancel
              </Button>
              <Button
                onClick={handleAssignProfiles}
                disabled={
                  assigningProfiles ||
                  selectedProfiles.length !== getRemainingSlots() ||
                  !getRemainingSlots()
                }
              >
                {assigningProfiles ? "Assigning..." : "Assign Selected"}
              </Button>
            </div>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col md:flex-row gap-4 sticky top-0 bg-white z-10 py-2">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by name, nationality, etc..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Button
              variant="outline"
              onClick={() => {
                if (!currentAssignment) return;
                fetchLabourProfiles(
                  currentAssignment.title,
                  currentAssignment.nationality,
                  currentAssignment.preferredAge || undefined,
                  "APPROVED",
                  verificationStatusFilter,
                  experienceFilter,
                  languagesFilter
                );
              }}
            >
              Apply Filters
            </Button>

            <div className="flex flex-wrap gap-2">
              <select
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                value={nationalityFilter}
                onChange={(e) => setNationalityFilter(e.target.value)}
              >
                <option value="">All Nationalities</option>
                {Array.from(
                  new Set(labourProfiles.map((p) => p.nationality))
                ).map((nat) => (
                  <option key={nat} value={nat}>
                    {nat}
                  </option>
                ))}
              </select>

              <select
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="RECEIVED">Received</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="APPROVED">Approved</option>
              </select>

              <select
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                value={ageFilter}
                onChange={(e) => setAgeFilter(e.target.value)}
              >
                <option value="">All Ages</option>
                <option value="18-25">18-25</option>
                <option value="26-35">26-35</option>
                <option value="36-45">36-45</option>
                <option value="46-100">46+</option>
              </select>

              <select
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                value={verificationStatusFilter}
                onChange={(e) => setVerificationStatusFilter(e.target.value)}
              >
                <option value="VERIFIED">Verified</option>
                <option value="PARTIALLY_VERIFIED">Partially Verified</option>
                <option value="PENDING">Pending</option>
              </select>

              <input
                type="number"
                className="px-3 py-2 border border-gray-300 rounded-md text-sm w-40"
                placeholder="Min Experience (years)"
                value={experienceFilter}
                onChange={(e) => setExperienceFilter(e.target.value)}
                min={0}
              />
              <input
                type="text"
                className="px-3 py-2 border border-gray-300 rounded-md text-sm w-56"
                placeholder="Languages (comma separated)"
                value={languagesFilter.join(",")}
                onChange={(e) =>
                  setLanguagesFilter(
                    e.target.value
                      .split(",")
                      .map((l) => l.trim())
                      .filter(Boolean)
                  )
                }
              />
            </div>
          </div>

          {/* Info messages */}
          {selectedProfiles.length >= targetCount && targetCount > 0 && (
            <div className="text-sm text-green-600">
              You&apos;ve reached the required quantity ({targetCount}{" "}
              profiles). You can deselect some if needed.
            </div>
          )}

          {/* Profiles */}
          {filteredProfiles.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">
                No labour profiles match your search and filters.
              </p>
              {currentAssignment &&
                (() => {
                  const currentRejected =
                    rejectedAssignmentsByJobRole[currentAssignment.id] || [];
                  const acceptedPrimaries =
                    currentRejected.filter(
                      (a) =>
                        a.adminStatus === "ACCEPTED" &&
                        a.clientStatus === "ACCEPTED"
                    ).length || 0;
                  const needsMoreLabour =
                    acceptedPrimaries < currentAssignment.quantity;

                  if (
                    needsMoreLabour &&
                    currentAssignment.agencyStatus === "SUBMITTED"
                  ) {
                    return (
                      <div className="mt-2 text-sm text-red-600">
                        Note: Previously rejected labour profiles have been
                        excluded from the available options.
                      </div>
                    );
                  }
                  return null;
                })()}
              <Button
                variant="outline"
                className="mt-2"
                onClick={() => {
                  setSearchTerm("");
                  setNationalityFilter("");
                  setStatusFilter("");
                  setAgeFilter("");
                }}
              >
                Clear all filters
              </Button>
            </div>
          ) : (
            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              {currentAssignment &&
                (() => {
                  const currentRejected =
                    rejectedAssignmentsByJobRole[currentAssignment.id] || [];
                  const acceptedPrimaries =
                    currentRejected.filter(
                      (a) =>
                        a.adminStatus === "ACCEPTED" &&
                        a.clientStatus === "ACCEPTED"
                    ).length || 0;
                  const needsMoreLabour =
                    acceptedPrimaries < currentAssignment.quantity;
                  if (
                    needsMoreLabour &&
                    currentAssignment.agencyStatus === "SUBMITTED"
                  ) {
                    return (
                      <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded border">
                        <strong>Note:</strong> Previously rejected labour
                        profiles have been excluded from the available options
                        to prevent re-assignment.
                      </div>
                    );
                  }
                  return null;
                })()}

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredProfiles.map((profile) => {
                  const atLimit =
                    selectedProfiles.length >= getRemainingSlots();
                  const isSelected = selectedProfiles.includes(profile.id);

                  return (
                    <div
                      key={profile.id}
                      className={`flex items-start p-3 border rounded-lg transition ${
                        atLimit && !isSelected
                          ? "cursor-not-allowed opacity-70"
                          : "cursor-pointer"
                      } ${isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:bg-gray-50"}`}
                      onClick={() => {
                        if (!atLimit || isSelected)
                          handleProfileSelection(profile.id);
                      }}
                    >
                      <div className="relative w-16 h-16 rounded-full bg-gray-100 mr-3 flex-shrink-0 overflow-hidden">
                        {profile.profileImage ? (
                          <img
                            src={profile.profileImage}
                            alt={profile.name}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0 ml-2">
                        <h4 className="font-medium truncate">{profile.name}</h4>
                        <div className="text-sm text-gray-500 space-y-1 mt-1">
                          <p className="truncate">
                            {profile.age} yrs • {profile.nationality}
                          </p>
                          <p className="truncate">{profile.jobRole}</p>
                          <div className="flex items-center">
                            <span
                              className={`inline-block w-2 h-2 rounded-full mr-1 ${
                                profile.status === "APPROVED"
                                  ? "bg-green-500"
                                  : profile.status === "UNDER_REVIEW"
                                    ? "bg-yellow-500"
                                    : "bg-gray-500"
                              }`}
                            />
                            <span className="text-xs capitalize">
                              {profile.status.toLowerCase().replace("_", " ")}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="ml-2">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleProfileSelection(profile.id)}
                          className="h-4 w-4 text-blue-600 rounded"
                          onClick={(e) => e.stopPropagation()}
                          disabled={!isSelected && atLimit}
                          aria-label={`Select ${profile.name}`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* bottom helper: re-fetch with current server-side filters */}
        <div className="mt-4">
          <Button
            variant="outline"
            onClick={() => {
              if (currentAssignment) {
                fetchLabourProfiles(
                  currentAssignment.title,
                  currentAssignment.nationality,
                  currentAssignment.preferredAge || undefined,
                  "APPROVED",
                  verificationStatusFilter,
                  experienceFilter,
                  languagesFilter
                );
              }
            }}
          >
            Apply Filters
          </Button>
        </div>

        {/* rejected list summary for current requirement */}
        {currentAssignment &&
          (() => {
            const currentRejected =
              rejectedAssignmentsByJobRole[currentAssignment.id] || [];
            if (!currentRejected.length) return null;
            return (
              <div className="mb-4 mt-4">
                <h4 className="text-sm font-semibold text-red-600">
                  Rejected Labourers for this Requirement:
                </h4>
                <ul className="text-xs text-gray-700 space-y-1">
                  {currentRejected.map((a) => (
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
            );
          })()}
      </Modal>
    </div>
  );
}
