"use client";

import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/context/toast-provider";
import { Button } from "@/components/ui/Button";
import { Check, X, Clock, Calendar, Flag, Users, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/shared/Card";
import { RequirementStatus } from "@/lib/generated/prisma";
import { LabourProfile } from "@prisma/client";

interface Agency {
  id: string;
  agencyName: string;
  user: {
    status: "PENDING_REVIEW" | "REJECTED" | "NOT_VERIFIED" | "VERIFIED";
  };
  createdAt: Date;
  pendingAssignmentsCount?: number;
}

interface JobRoleWithAssignments {
  id: string;
  title: string;
  quantity: number;
  nationality: string;
  salaryCurrency: string;
  basicSalary: number;
  startDate: Date | null;
  contractDuration: string | null;
  agencyStatus: RequirementStatus;
  adminStatus: RequirementStatus;
  requirement: {
    id: string;
    status: RequirementStatus;
    client: {
      id: string;
      companyName: string;
    };
  };
  LabourAssignment: Array<{
    id: string;
    labourId: string;
    labour: LabourProfile;
    agencyStatus: RequirementStatus;
    adminStatus: RequirementStatus;
    clientStatus: RequirementStatus;
    adminFeedback?: string;
    clientFeedback?: string;
  }>;
  needsMoreLabour: boolean;
}

interface AgencyWithAssignments extends Agency {
  JobRole?: JobRoleWithAssignments[];
}

export default function LabourAssignmentReview() {
  const [selectedAgency, setSelectedAgency] = useState<string | null>(null);
  const [agencies, setAgencies] = useState<AgencyWithAssignments[]>([]);
  const [assignments, setAssignments] = useState<JobRoleWithAssignments[]>([]);
  const [loadingAgencies, setLoadingAgencies] = useState(true);
  const [loadingAssignments, setLoadingAssignments] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [viewingProfiles, setViewingProfiles] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch agencies with assignment counts
  const fetchAgencies = useCallback(async () => {
    try {
      setLoadingAgencies(true);
      const response = await fetch("/api/agencies/assignments");
      if (!response.ok) throw new Error("Failed to fetch agencies");

      const data = await response.json();
      setAgencies(data);

      // Preserve selected agency if it exists in the new data
      if (selectedAgency && data.some((a) => a.id === selectedAgency)) {
        return;
      }

      // Select first agency by default if none selected
      if (data.length > 0 && !selectedAgency) {
        setSelectedAgency(data[0].id);
      }
    } catch (error) {
      console.error("Error fetching agencies:", error);
      toast({
        type: "error",
        message: "Failed to load agencies",
      });
    } finally {
      setLoadingAgencies(false);
    }
  }, [selectedAgency, toast]);

  // Fetch assignments for selected agency
  const fetchAssignments = useCallback(
    async (agencyId: string) => {
      if (!agencyId) return;

      try {
        setLoadingAssignments(true);
        const response = await fetch(`/api/agencies/${agencyId}/assignments`);
        if (!response.ok) throw new Error("Failed to fetch assignments");

        const data = await response.json();
        setAssignments(data);

        // Update the agencies state to include the assignments
        setAgencies((prev: AgencyWithAssignments[]) =>
          prev.map((agency: AgencyWithAssignments) =>
            agency.id === agencyId ? { ...agency, JobRole: data } : agency
          )
        );
      } catch (error) {
        console.error("Error fetching assignments:", error);
        toast({
          type: "error",
          message: "Failed to load agency assignments",
        });
      } finally {
        setLoadingAssignments(false);
      }
    },
    [toast]
  );

  // Initial load and refresh handling
  useEffect(() => {
    fetchAgencies();
  }, [fetchAgencies]);

  // Fetch assignments when selected agency changes
  useEffect(() => {
    if (selectedAgency) {
      fetchAssignments(selectedAgency);
    }
  }, [selectedAgency, fetchAssignments]);

  // Status color helper
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

  // Status text helper
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

  // Date formatting
  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return "Flexible";
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Duration formatting
  const getDuration = (duration: string | null) => {
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

  // Determine job role status
  const getJobRoleStatus = (jobRole: JobRoleWithAssignments) => {
    if (!jobRole.LabourAssignment?.length) return "NO_SUBMISSIONS";

    const acceptedCount = jobRole.LabourAssignment.filter(
      (a) => a.adminStatus === "ACCEPTED"
    ).length;
    const rejectedCount = jobRole.LabourAssignment.filter(
      (a) => a.adminStatus === "REJECTED"
    ).length;

    const proceeded = jobRole.LabourAssignment.filter(
      (a: {
        adminStatus: string;
        agencyStatus: string;
        clientStatus: string;
      }) =>
        a.adminStatus === "ACCEPTED" &&
        a.agencyStatus === "ACCEPTED" &&
        a.clientStatus === "SUBMITTED"
    );

    // If any assignments are rejected, status should be NEEDS_REVISION
    if (rejectedCount > 0) return "NEEDS_REVISION";

    if (acceptedCount === 0) return "NO_SUBMISSIONS";
    if (acceptedCount < jobRole.quantity) return "PARTIAL_SUBMISSIONS";
    if (jobRole.LabourAssignment.every((a) => a.adminStatus === "ACCEPTED"))
      return "FULLY_ACCEPTED";
    if (proceeded) return "PROCEEDED";
    return "UNDER_REVIEW";
  };

  // Document Verification Status Component
  const VerificationStatusIcon = ({ status }: { status: string }) => {
    switch (status) {
      case "VERIFIED":
        return <Check className="w-4 h-4 text-green-500" />;
      case "PARTIALLY_VERIFIED":
        return <Check className="w-4 h-4 text-yellow-500" />;
      case "REJECTED":
        return <X className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  // Handle labor status updates
  const handleUpdateLabourStatus = async (
    assignmentId: string | string[],
    status: "ACCEPTED" | "REJECTED",
    feedback?: string
  ) => {
    try {
      // Set updating status to indicate processing
      setUpdatingStatus(
        Array.isArray(assignmentId) ? "bulk-update" : assignmentId
      );

      const isBulk = Array.isArray(assignmentId);
      const endpoint = isBulk
        ? "/api/admin/assignments/bulk-status"
        : `/api/admin/assignments/${assignmentId}/status`;

      const response = await fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignmentIds: isBulk ? assignmentId : undefined,
          status,
          feedback,
        }),
      });

      if (!response.ok) throw new Error("Failed to update assignment status");

      // Refresh the assignments
      await fetchAssignments(selectedAgency!);

      toast({
        type: "success",
        message: isBulk
          ? `${assignmentId.length} profiles ${status.toLowerCase()} successfully`
          : `Labour profile ${status.toLowerCase()} successfully`,
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
      setUpdatingStatus(null);
    }
  };

  // Get current agency and job role data
  const currentAgency = agencies.find((a) => a.id === selectedAgency);
  const currentJobRole = viewingProfiles
    ? assignments.find((jr) => jr.id === viewingProfiles)
    : null;

  // Labour Profile Card Component
  const LabourProfileCard = ({
    profile,
    assignment,
    onStatusUpdate,
  }: {
    profile: LabourProfile;
    assignment: {
      id: string;
      adminStatus: RequirementStatus;
      clientStatus: RequirementStatus;
      adminFeedback?: string;
      clientFeedback?: string;
    };
    onStatusUpdate: (
      assignmentId: string,
      status: "ACCEPTED" | "REJECTED",
      feedback?: string
    ) => Promise<void>;
  }) => {
    const statusColors = {
      RECEIVED: "bg-blue-100 text-blue-800",
      UNDER_REVIEW: "bg-yellow-100 text-yellow-800",
      APPROVED: "bg-green-100 text-green-800",
      REJECTED: "bg-red-100 text-red-800",
      SHORTLISTED: "bg-purple-100 text-purple-800",
      DEPLOYED: "bg-indigo-100 text-indigo-800",
    };

    const verificationColors = {
      PENDING: "bg-gray-100 text-gray-800",
      PARTIALLY_VERIFIED: "bg-yellow-100 text-yellow-800",
      VERIFIED: "bg-green-100 text-green-800",
      REJECTED: "bg-red-100 text-red-800",
    };

    const [feedback, setFeedback] = useState("");
    const [isUpdating, setIsUpdating] = useState(false);

    const handleAccept = async () => {
      setIsUpdating(true);
      try {
        await onStatusUpdate(assignment.id, "ACCEPTED");
      } finally {
        setIsUpdating(false);
      }
    };

    const handleReject = async () => {
      if (!feedback) {
        alert("Please provide feedback before rejecting");
        return;
      }
      setIsUpdating(true);
      try {
        await onStatusUpdate(assignment.id, "REJECTED", feedback);
        setFeedback("");
      } finally {
        setIsUpdating(false);
      }
    };

    return (
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col">
        <div className="relative h-40 bg-gray-100">
          {profile.profileImage ? (
            <img
              src={profile.profileImage}
              alt={profile.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <User className="w-16 h-16 text-gray-400" />
            </div>
          )}
        </div>

        <div className="p-4 flex justify-between items-start border-b border-gray-200">
          <div>
            <h3 className="font-semibold text-lg text-gray-900">
              {profile.name}
            </h3>
            <p className="text-sm text-gray-500">
              {profile.nationality} • {profile.age} years •{" "}
              {profile.gender.toLowerCase()}
            </p>
            {profile.jobRole && (
              <p className="text-xs text-gray-500 mt-1">
                Job Role: {profile.jobRole}
              </p>
            )}
          </div>
          <div className="flex flex-col items-end">
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                statusColors[profile.status as keyof typeof statusColors] ||
                "bg-gray-100 text-gray-800"
              }`}
            >
              {profile.status.replace("_", " ")}
            </span>
            <span
              className={`text-xs px-2 py-1 rounded-full mt-1 ${
                verificationColors[
                  profile.verificationStatus as keyof typeof verificationColors
                ]
              }`}
            >
              <div className="flex items-center gap-1">
                <VerificationStatusIcon status={profile.verificationStatus} />
                {profile.verificationStatus.replace("_", " ")}
              </div>
            </span>
          </div>
        </div>

        <div className="p-4 space-y-3 flex-grow">
          <div className="text-sm">
            <p className="text-gray-500">Passport</p>
            <div className="flex items-center gap-1">
              {profile.passportVerified ? (
                <Check className="w-3 h-3 text-green-500" />
              ) : (
                <X className="w-3 h-3 text-red-500" />
              )}
              <span>{profile.passportNumber || "Not provided"}</span>
            </div>
          </div>

          {profile.skills?.length > 0 && (
            <div className="mt-2">
              <p className="text-xs text-gray-500 mb-1">Skills</p>
              <div className="flex flex-wrap gap-1">
                {profile.skills.slice(0, 3).map((skill: string) => (
                  <span
                    key={skill}
                    className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                  >
                    {skill}
                  </span>
                ))}
                {profile.skills.length > 3 && (
                  <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                    +{profile.skills.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}

          {assignment.adminStatus === "REJECTED" &&
            assignment.adminFeedback && (
              <div className="mt-2 p-2 bg-red-50 rounded">
                <p className="text-xs font-medium text-red-700">
                  Rejection Reason:
                </p>
                <p className="text-xs text-red-600">
                  {assignment.adminFeedback}
                </p>
              </div>
            )}

          {assignment.clientStatus === "REJECTED" &&
            assignment.clientFeedback && (
              <div className="mt-2 p-2 bg-red-50 rounded">
                <p className="text-xs font-medium text-red-700">
                  Client Rejection Reason:
                </p>
                <p className="text-xs text-red-600">
                  {assignment.clientFeedback}
                </p>
              </div>
            )}
        </div>

        <div className="p-4 border-t border-gray-200">
          {assignment.adminStatus === "ACCEPTED" ? (
            <div className="flex justify-center">
              <Badge variant="success" className="px-3 py-1">
                Accepted
              </Badge>
            </div>
          ) : assignment.adminStatus === "REJECTED" ? (
            <div className="flex justify-center">
              <Badge variant="destructive" className="px-3 py-1">
                Rejected
              </Badge>
            </div>
          ) : (
            <>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Feedback (required for rejection)"
                className="w-full text-xs p-2 border rounded mb-2 h-12"
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={handleReject}
                  disabled={isUpdating}
                >
                  {isUpdating ? "Processing..." : "Reject"}
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="flex-1"
                  onClick={handleAccept}
                  disabled={isUpdating}
                >
                  {isUpdating ? "Processing..." : "Accept"}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="px-6 flex gap-6">
      {/* Left Sidebar - Agencies */}
      <div className="w-1/6 rounded-lg overflow-y-auto">
        {loadingAgencies ? (
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
            {agencies.map((agency) => (
              <div
                key={agency.id}
                onClick={() => {
                  setSelectedAgency(agency.id);
                  setViewingProfiles(null);
                }}
                className={`p-3 rounded-lg cursor-pointer transition-colors border-l-4 ${
                  selectedAgency === agency.id
                    ? "bg-[#EDDDF3] border-l-[#150B3D]"
                    : "bg-gray-50 hover:bg-[#EDDDF3]/50 border-l-gray-200"
                }`}
              >
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-[#150B3D]">
                    {agency.agencyName}
                  </h3>
                  {agency.pendingAssignmentsCount ? (
                    <Badge className="bg-blue-500">
                      {agency.pendingAssignmentsCount}
                    </Badge>
                  ) : null}
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span
                    className={`text-xs ${getStatusColor(agency.user.status)}`}
                  >
                    {getStatusText(agency.user.status)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="w-5/6 rounded-lg overflow-y-auto">
        {loadingAssignments ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <Card
                key={i}
                className="border border-[#EDDDF3] bg-[#EDDDF3]/20 h-64 animate-pulse"
              />
            ))}
          </div>
        ) : selectedAgency ? (
          <>
            {viewingProfiles ? (
              // Individual job role labor assignments view
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-[#EDDDF3]/50 p-4 rounded-2xl">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setViewingProfiles(null)}
                    >
                      &larr; Back
                    </Button>
                    <h2 className="text-xl font-semibold text-[#150B3D]">
                      {currentJobRole?.title} - Labor Assignments
                    </h2>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">
                      {currentJobRole?.LabourAssignment?.filter(
                        (a) => a.adminStatus === "ACCEPTED"
                      ).length ?? 0}{" "}
                      /{currentJobRole?.quantity ?? 0} Accepted
                    </span>

                    {/* Add Accept/Reject All buttons */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const unaccepted =
                            currentJobRole?.LabourAssignment?.filter(
                              (a) => a.adminStatus !== "ACCEPTED"
                            );
                          if (unaccepted && unaccepted.length > 0) {
                            if (
                              confirm(
                                `Accept all ${unaccepted.length} unaccepted profiles?`
                              )
                            ) {
                              handleUpdateLabourStatus(
                                unaccepted.map((a) => a.id),
                                "ACCEPTED"
                              );
                            }
                          }
                        }}
                        disabled={updatingStatus === "bulk-update"}
                      >
                        {updatingStatus === "bulk-update"
                          ? "Processing..."
                          : "Accept All"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const unrejected =
                            currentJobRole?.LabourAssignment?.filter(
                              (a) => a.adminStatus !== "REJECTED"
                            );
                          if (unrejected && unrejected.length > 0) {
                            const feedback = prompt(
                              `Enter rejection reason for all ${unrejected.length} profiles:`
                            );
                            if (feedback) {
                              handleUpdateLabourStatus(
                                unrejected.map((a) => a.id),
                                "REJECTED",
                                feedback
                              );
                            }
                          }
                        }}
                        disabled={updatingStatus === "bulk-update"}
                      >
                        {updatingStatus === "bulk-update"
                          ? "Processing..."
                          : "Reject All"}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {currentJobRole?.LabourAssignment?.map((assignment) => (
                    <LabourProfileCard
                      key={assignment.id}
                      profile={assignment.labour}
                      assignment={assignment}
                      onStatusUpdate={handleUpdateLabourStatus}
                    />
                  ))}
                </div>
              </div>
            ) : (
              // All job roles view
              <>
                <div className="flex justify-between items-center mb-6 bg-[#EDDDF3]/50 p-4 rounded-2xl">
                  <h2 className="text-xl font-semibold text-[#150B3D]">
                    Assignments from {currentAgency?.agencyName}
                  </h2>
                </div>

                {assignments.length === 0 ? (
                  <div className="text-center py-12">
                    <h2 className="text-xl font-medium text-gray-500">
                      No assignments found for this agency
                    </h2>
                    <p className="mt-2 text-gray-400">
                      Approved assignments will appear here
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {assignments.map((jobRole) => {
                      const status = getJobRoleStatus(jobRole);
                      const acceptedCount =
                        jobRole.LabourAssignment?.filter(
                          (a) => a.adminStatus === "ACCEPTED"
                        ).length ?? 0;

                      return (
                        <Card
                          key={jobRole.id}
                          className="hover:shadow-lg transition-shadow border border-[#EDDDF3] bg-[#EDDDF3]/20"
                        >
                          <CardHeader>
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-medium">{jobRole.title}</h3>
                                <p className="text-sm text-gray-500 mt-1">
                                  For:{" "}
                                  {jobRole.requirement.id
                                    .slice(0, 8)
                                    .toUpperCase()}
                                </p>
                              </div>
                              <Badge
                                variant={
                                  status === "FULLY_ACCEPTED"
                                    ? "success"
                                    : status === "NEEDS_REVISION"
                                      ? "warning"
                                      : status === "PARTIAL_SUBMISSIONS"
                                        ? "warning"
                                        : status === "PROCEEDED" // New status check
                                          ? "success" // You can choose a different variant if you prefer
                                          : "default"
                                }
                              >
                                {status === "FULLY_ACCEPTED"
                                  ? "Ready for Client"
                                  : status === "NEEDS_REVISION"
                                    ? "Needs Revision"
                                    : status === "PARTIAL_SUBMISSIONS"
                                      ? "Partial Submissions"
                                      : status === "PROCEEDED" // New status text
                                        ? "Proceeded" // Or whatever text you want to display
                                        : "Under Review"}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              <div className="border-t border-[#EDDDF3] pt-4">
                                <div className="pl-3 border-l-2 border-[#EDDDF3]">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <div className="flex items-center text-sm text-gray-500 mt-1">
                                        <Flag className="h-4 w-4 mr-1" />
                                        {jobRole.nationality}
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <span className="text-sm font-medium">
                                        {acceptedCount} / {jobRole.quantity}{" "}
                                        Accepted
                                      </span>
                                      <div className="text-sm text-gray-500">
                                        {jobRole.basicSalary}{" "}
                                        {jobRole.salaryCurrency}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="mt-3 space-y-2 text-sm">
                                    <div className="flex items-start space-x-2">
                                      <Calendar className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                                      <div>
                                        <span className="font-medium">
                                          Start:{" "}
                                        </span>
                                        {formatDate(jobRole.startDate)}
                                      </div>
                                    </div>

                                    <div className="flex items-start space-x-2">
                                      <Clock className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                                      <div>
                                        <span className="font-medium">
                                          Duration:{" "}
                                        </span>
                                        {getDuration(jobRole.contractDuration)}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="pt-4">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full"
                                  onClick={() => setViewingProfiles(jobRole.id)}
                                >
                                  <Users className="h-4 w-4 mr-2" />
                                  View Labor Assignments (
                                  {jobRole.LabourAssignment?.length ?? 0})
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-[#150B3D]/50">
              Select an agency to view assignments
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
