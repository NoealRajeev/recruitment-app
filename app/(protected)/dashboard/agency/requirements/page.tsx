/* eslint-disable @next/next/no-img-element */
// app/(protected)/dashboard/agency/requirements/page.tsx
"use client";

import { Card, CardContent, CardHeader } from "@/components/shared/Card";
import { Badge } from "@/components/ui/badge";
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
import { useState, useEffect } from "react";
import { RequirementStatus, ContractDuration } from "@/lib/generated/prisma";
import { Modal } from "@/components/ui/Modal";

interface JobRoleAssignment {
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
  ticketFrequency: string[];
  workLocations: string[];
  previousExperience: string[];
  totalExperienceYears: number | null;
  preferredAge: number | null;
  languageRequirements: string[];
  specialRequirements: string | null;
  agencyStatus: RequirementStatus;
  createdAt: Date;
  updatedAt: Date;
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

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [nationalityFilter, setNationalityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [ageFilter, setAgeFilter] = useState("");

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/requirements/assignments");
        if (response.ok) {
          const data = await response.json();

          // Filter out rejected assignments older than 1 hour
          const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
          const filteredAssignments = data.assignments.filter(
            (assignment: any) => {
              if (assignment.agencyStatus === "REJECTED") {
                return new Date(assignment.updatedAt) > oneHourAgo;
              }
              return true;
            }
          );

          // Sort with APPROVED first, then others, then REJECTED
          filteredAssignments.sort((a: any, b: any) => {
            if (a.agencyStatus === "ACCEPTED" && b.agencyStatus !== "ACCEPTED")
              return -1;
            if (a.agencyStatus !== "ACCEPTED" && b.agencyStatus === "ACCEPTED")
              return 1;
            if (a.agencyStatus === "REJECTED" && b.agencyStatus !== "REJECTED")
              return 1;
            if (a.agencyStatus !== "REJECTED" && b.agencyStatus === "REJECTED")
              return -1;
            return (
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
          });

          setAssignments(filteredAssignments);
        } else {
          throw new Error("Failed to fetch assignments");
        }
      } catch (error) {
        console.error("Error fetching assignments:", error);
        toast({
          type: "error",
          message: "Failed to load assigned requirements",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();

    // Refresh every hour to clean up old rejected requests
    const interval = setInterval(fetchAssignments, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [toast]);

  const fetchLabourProfiles = async (jobRole: string, nationality: string) => {
    try {
      const response = await fetch(
        `/api/agencies/labour-profiles?jobRole=${encodeURIComponent(jobRole)}&nationality=${encodeURIComponent(nationality)}`
      );
      if (response.ok) {
        const data = await response.json();
        setLabourProfiles(data.labourProfiles);
        setFilteredProfiles(data.labourProfiles); // Initialize filtered profiles
      } else {
        throw new Error("Failed to fetch labour profiles");
      }
    } catch (error) {
      console.error("Error fetching labour profiles:", error);
      toast({
        type: "error",
        message: "Failed to load labour profiles",
      });
    }
  };

  // Apply search and filters
  useEffect(() => {
    if (labourProfiles.length === 0) return;

    let result = [...labourProfiles];

    // Apply search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (profile) =>
          profile.name.toLowerCase().includes(term) ||
          profile.nationality.toLowerCase().includes(term) ||
          profile.jobRole.toLowerCase().includes(term)
      );
    }

    // Apply nationality filter
    if (nationalityFilter) {
      result = result.filter(
        (profile) => profile.nationality === nationalityFilter
      );
    }

    // Apply status filter
    if (statusFilter) {
      result = result.filter((profile) => profile.status === statusFilter);
    }

    // Apply age filter
    if (ageFilter) {
      const [min, max] = ageFilter.split("-").map(Number);
      if (max) {
        result = result.filter(
          (profile) => profile.age >= min && profile.age <= max
        );
      } else {
        // For "46+" case
        result = result.filter((profile) => profile.age >= min);
      }
    }

    setFilteredProfiles(result);
  }, [searchTerm, nationalityFilter, statusFilter, ageFilter, labourProfiles]);

  const handleOpenAssignModal = async (assignment: JobRoleAssignment) => {
    setCurrentAssignment(assignment);
    await fetchLabourProfiles(assignment.title, assignment.nationality);
    setIsAssignModalOpen(true);
  };

  const handleCloseAssignModal = () => {
    setIsAssignModalOpen(false);
    setSelectedProfiles([]);
    setCurrentAssignment(null);
    // Reset filters when closing modal
    setSearchTerm("");
    setNationalityFilter("");
    setStatusFilter("");
    setAgeFilter("");
  };

  const handleProfileSelection = (profileId: string) => {
    setSelectedProfiles((prev) => {
      if (prev.includes(profileId)) {
        return prev.filter((id) => id !== profileId);
      }
      if (prev.length < (currentAssignment?.quantity || 0)) {
        return [...prev, profileId];
      }
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
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            profileIds: selectedProfiles,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `Failed to assign profiles: ${response.statusText}`
        );
      }

      const result = await response.json();

      // Update the assignments list with the new status
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error("Failed to update assignment status");
      }

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
      case "REJECTED":
        return <Badge className="bg-red-500 hover:bg-red-600">Rejected</Badge>;
      case "FORWARDED":
        return <Badge className="bg-blue-500 hover:bg-blue-600">New</Badge>;
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
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getDuration = (duration: ContractDuration | null) => {
    if (!duration) return "To be determined";
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

  if (assignments.length === 0) {
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assignments.map((assignment) => (
          <Card
            key={assignment.id}
            className="hover:shadow-lg transition-shadow border border-[#EDDDF3] bg-[#EDDDF3]/20"
          >
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{assignment.title}</h3>
                </div>
                {getStatusBadge(assignment.agencyStatus)}
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
                        Quantity: {assignment.quantity}
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
                      <span>
                        Tickets: {assignment.ticketFrequency.join(", ")}
                      </span>
                    </div>

                    {/* Allowances Section */}
                    <div className="pt-2">
                      <h4 className="text-sm font-medium mb-1">Allowances:</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center">
                          <Utensils className="h-4 w-4 mr-1 text-gray-500" />
                          {assignment.foodProvidedByCompany
                            ? "Food provided"
                            : `${assignment.foodAllowance} ${assignment.salaryCurrency}`}
                        </div>
                        <div className="flex items-center">
                          <Home className="h-4 w-4 mr-1 text-gray-500" />
                          {assignment.housingProvidedByCompany
                            ? "Housing provided"
                            : `${assignment.housingAllowance} ${assignment.salaryCurrency}`}
                        </div>
                        <div className="flex items-center">
                          <Bus className="h-4 w-4 mr-1 text-gray-500" />
                          {assignment.transportationProvidedByCompany
                            ? "Transport provided"
                            : `${assignment.transportationAllowance} ${assignment.salaryCurrency}`}
                        </div>
                        <div className="flex items-center">
                          <Smartphone className="h-4 w-4 mr-1 text-gray-500" />
                          {assignment.mobileProvidedByCompany
                            ? "Mobile provided"
                            : `${assignment.mobileAllowance} ${assignment.salaryCurrency}`}
                        </div>
                      </div>
                    </div>

                    {/* Requirements Section */}
                    <div className="pt-2">
                      <h4 className="text-sm font-medium mb-1">
                        Requirements:
                      </h4>
                      <div className="text-sm space-y-1">
                        <div>
                          <span className="font-medium">Work Locations: </span>
                          {assignment.workLocations.join(", ")}
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
                  </div>
                </div>

                {assignment.agencyStatus === "FORWARDED" && (
                  <div className="flex justify-between pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleUpdateAssignmentStatus(assignment.id, "REJECTED")
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
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Assign Labour Profiles Modal */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={handleCloseAssignModal}
        title={`Assign Labour Profiles - ${currentAssignment?.title}`}
        size="7xl"
        showFooter={true}
        footerContent={
          <div className="flex justify-between w-full">
            <div className="text-sm text-gray-600">
              Selected: {selectedProfiles.length} /{" "}
              {currentAssignment?.quantity || 0}
              {selectedProfiles.length >=
                (currentAssignment?.quantity || 0) && (
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
                    const quantity = currentAssignment?.quantity || 0;
                    const profilesToSelect = filteredProfiles
                      .slice(0, quantity)
                      .map((profile) => profile.id);
                    setSelectedProfiles(profilesToSelect);
                  }
                }}
                disabled={filteredProfiles.length === 0}
              >
                {selectedProfiles.length > 0
                  ? "Deselect All"
                  : `Select ${currentAssignment?.quantity || 0}`}
              </Button>
              <Button variant="outline" onClick={handleCloseAssignModal}>
                Cancel
              </Button>
              <Button
                onClick={handleAssignProfiles}
                disabled={
                  selectedProfiles.length !==
                    (currentAssignment?.quantity || 0) || assigningProfiles
                }
              >
                {assigningProfiles ? "Assigning..." : "Assign Selected"}
              </Button>
            </div>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
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

            {/* Select All Button */}
            <Button
              variant="outline"
              onClick={() => {
                if (selectedProfiles.length > 0) {
                  // If some profiles are selected, deselect all
                  setSelectedProfiles([]);
                } else {
                  // If none are selected, select up to the required quantity
                  const quantity = currentAssignment?.quantity || 0;
                  const profilesToSelect = filteredProfiles
                    .slice(0, quantity)
                    .map((profile) => profile.id);
                  setSelectedProfiles(profilesToSelect);
                }
              }}
              disabled={filteredProfiles.length === 0}
            >
              {selectedProfiles.length > 0
                ? "Deselect All"
                : `Select ${currentAssignment?.quantity || 0}`}
            </Button>

            {/* Filter Dropdowns */}
            <div className="flex gap-2">
              <select
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-md text-sm"
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
            </div>
          </div>

          {selectedProfiles.length >= (currentAssignment?.quantity || 0) && (
            <div className="text-sm text-green-600">
              You&apos;ve reached the required quantity (
              {currentAssignment?.quantity} profiles). You can deselect some if
              needed.
            </div>
          )}

          {filteredProfiles.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">
                No labour profiles match your search and filters.
              </p>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProfiles.map((profile) => (
                  <div
                    key={profile.id}
                    className={`flex items-start p-3 border rounded-lg ${
                      selectedProfiles.length >=
                        (currentAssignment?.quantity || 0) &&
                      !selectedProfiles.includes(profile.id)
                        ? "cursor-not-allowed opacity-70"
                        : "cursor-pointer"
                    } ${
                      selectedProfiles.includes(profile.id)
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                    onClick={() => {
                      if (
                        selectedProfiles.length <
                          (currentAssignment?.quantity || 0) ||
                        selectedProfiles.includes(profile.id)
                      ) {
                        handleProfileSelection(profile.id);
                      }
                    }}
                  >
                    <div className="relative w-16 h-16 rounded-full bg-gray-100 mr-3 flex-shrink-0 overflow-hidden">
                      {profile.profileImage ? (
                        <img
                          src={profile.profileImage}
                          alt={profile.name}
                          className="object-cover"
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
                          ></span>
                          <span className="text-xs capitalize">
                            {profile.status.toLowerCase().replace("_", " ")}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="ml-2">
                      <input
                        type="checkbox"
                        checked={selectedProfiles.includes(profile.id)}
                        onChange={() => handleProfileSelection(profile.id)}
                        className="h-4 w-4 text-blue-600 rounded"
                        onClick={(e) => e.stopPropagation()}
                        disabled={
                          !selectedProfiles.includes(profile.id) &&
                          selectedProfiles.length >=
                            (currentAssignment?.quantity || 0)
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
