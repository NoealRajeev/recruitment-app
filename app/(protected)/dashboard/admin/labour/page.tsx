// app/(protected)/dashboard/admin/labour/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/context/toast-provider";
import { Button } from "@/components/ui/Button";
import { Check, X, Clock, Calendar, Briefcase, Flag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/shared/Card";
import { RequirementStatus } from "@/lib/generated/prisma";

interface Agency {
  id: string;
  agencyName: string;
  user: {
    status: "PENDING_REVIEW" | "REJECTED" | "NOT_VERIFIED" | "VERIFIED";
  };
  createdAt: Date;
}

interface RequirementAssignment {
  id: string;
  quantity: number;
  status: RequirementStatus;
  createdAt: Date;
  updatedAt: Date;
  jobRole: {
    id: string;
    title: string;
    nationality: string;
    salary: number | null;
    salaryCurrency: string;
    startDate: Date | null;
    contractDuration: string | null;
  };
  requirement: {
    id: string;
    languages: string[];
    minExperience: string | null;
    maxAge: number | null;
    ticketType: string | null;
    ticketProvided: boolean;
  };
  agency: {
    id: string;
    agencyName: string;
  };
}

export default function LabourProfile() {
  const [selectedAgency, setSelectedAgency] = useState<string | null>(null);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [assignments, setAssignments] = useState<RequirementAssignment[]>([]);
  const [loadingAgencies, setLoadingAgencies] = useState(true);
  const [loadingAssignments, setLoadingAssignments] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchAgencies = useCallback(async () => {
    try {
      setLoadingAgencies(true);
      const response = await fetch("/api/agencies?status=VERIFIED");
      if (response.ok) {
        const data = await response.json();
        setAgencies(data);
        if (data.length > 0 && !selectedAgency) {
          setSelectedAgency(data[0].id);
        }
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

  const fetchAssignments = useCallback(
    async (agencyId: string) => {
      try {
        setLoadingAssignments(true);
        const response = await fetch(
          `/api/admin/requirements/assignments?agencyId=${agencyId}`
        );
        if (response.ok) {
          const data = await response.json();
          setAssignments(data.assignments);
        }
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

  useEffect(() => {
    fetchAgencies();
  }, [fetchAgencies]);

  useEffect(() => {
    if (selectedAgency) {
      fetchAssignments(selectedAgency);
    }
  }, [selectedAgency, fetchAssignments]);

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

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return "Flexible";
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getDuration = (duration: string | null) => {
    switch (duration) {
      case "ONE_YEAR":
        return "1 Year";
      case "TWO_YEARS":
        return "2 Years";
      case "THREE_YEARS":
        return "3 Years";
      case "UNLIMITED":
        return "Open-ended";
      default:
        return "To be determined";
    }
  };

  const getExperienceLevel = (level: string | null) => {
    switch (level) {
      case "FRESH":
        return "Fresh";
      case "ONE_YEAR":
        return "1 Year";
      case "TWO_YEARS":
        return "2 Years";
      case "THREE_YEARS":
        return "3 Years";
      case "FOUR_YEARS":
        return "4 Years";
      case "FIVE_PLUS_YEARS":
        return "5+ Years";
      default:
        return "Not specified";
    }
  };

  const getTicketType = (type: string | null) => {
    switch (type) {
      case "ONE_WAY":
        return "One Way";
      case "TWO_WAY":
        return "Two Way";
      case "NONE":
        return "None";
      default:
        return "Not specified";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return (
          <Badge className="bg-green-500 hover:bg-green-600">Accepted</Badge>
        );
      case "REJECTED":
        return <Badge className="bg-red-500 hover:bg-red-600">Rejected</Badge>;
      case "SUBMITTED":
        return <Badge className="bg-blue-500 hover:bg-blue-600">New</Badge>;
      case "FULFILLED":
        return (
          <Badge className="bg-purple-500 hover:bg-purple-600">Fulfilled</Badge>
        );
      case "CLOSED":
        return <Badge className="bg-gray-500 hover:bg-gray-600">Closed</Badge>;
      default:
        return (
          <Badge className="bg-gray-500 hover:bg-gray-600">{status}</Badge>
        );
    }
  };

  const handleUpdateAssignmentStatus = async (
    assignmentId: string,
    status: "APPROVED" | "REJECTED"
  ) => {
    try {
      setUpdatingStatus(assignmentId);
      const response = await fetch(
        `/api/admin/requirements/assignments/${assignmentId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

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
      setUpdatingStatus(null);
    }
  };

  return (
    <div className="px-6 flex gap-6">
      {/* Left Sidebar - Agencies (1/6 width) */}
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
                onClick={() => setSelectedAgency(agency.id)}
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
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span
                    className={`text-xs ${getStatusColor(agency.user.status)}`}
                  >
                    {getStatusText(agency.user.status)}
                  </span>
                  <span className="text-xs text-[#150B3D]/50">
                    • {formatTimeAgo(new Date(agency.createdAt))}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Content - Assignment Details (5/6 width) */}
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
            {/* Agency Header */}
            <div className="flex justify-between items-center mb-6 bg-[#EDDDF3]/50 p-4 rounded-2xl">
              <h2 className="text-xl font-semibold text-[#150B3D]">
                Assignments from{" "}
                {agencies.find((a) => a.id === selectedAgency)?.agencyName}
              </h2>
            </div>

            {/* Assignments Grid */}
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
                {assignments.map((assignment) => {
                  const jobRole = assignment.jobRole;

                  return (
                    <Card
                      key={assignment.id}
                      className="hover:shadow-lg transition-shadow border border-[#EDDDF3] bg-[#EDDDF3]/20"
                    >
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">Job Assignment</h3>
                            <p className="text-sm text-gray-500 mt-1">
                              Assigned: {formatDate(assignment.createdAt)}
                            </p>
                          </div>
                          {getStatusBadge(assignment.status)}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="border-t border-[#EDDDF3] pt-4">
                            <h3 className="font-medium mb-3 flex items-center">
                              <Briefcase className="h-5 w-5 mr-2" />
                              {jobRole.title}
                            </h3>
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
                                    Quantity: {assignment.quantity}
                                  </span>
                                  {jobRole.salary && (
                                    <div className="text-sm text-gray-500">
                                      {jobRole.salary} {jobRole.salaryCurrency}
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="mt-3 space-y-2 text-sm">
                                <div className="flex items-start space-x-2">
                                  <Calendar className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                                  <div>
                                    <span className="font-medium">Start: </span>
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

                                <div className="flex items-start space-x-2">
                                  <div>
                                    <span className="font-medium">
                                      Languages:{" "}
                                    </span>
                                    {assignment.requirement.languages.join(
                                      ", "
                                    ) || "Not specified"}
                                  </div>
                                </div>

                                <div className="flex items-start space-x-2">
                                  <div>
                                    <span className="font-medium">
                                      Experience:{" "}
                                    </span>
                                    {getExperienceLevel(
                                      assignment.requirement.minExperience
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-start space-x-2">
                                  <div>
                                    <span className="font-medium">
                                      Max Age:{" "}
                                    </span>
                                    {assignment.requirement.maxAge ||
                                      "Not specified"}
                                  </div>
                                </div>

                                <div className="flex items-start space-x-2">
                                  <div>
                                    <span className="font-medium">
                                      Ticket:{" "}
                                    </span>
                                    {getTicketType(
                                      assignment.requirement.ticketType
                                    )}
                                    {assignment.requirement.ticketProvided
                                      ? " (Provided)"
                                      : ""}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {assignment.status === "SUBMITTED" && (
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
                                disabled={updatingStatus === assignment.id}
                              >
                                <X className="h-4 w-4 mr-2" />
                                Reject
                              </Button>
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleUpdateAssignmentStatus(
                                    assignment.id,
                                    "APPROVED"
                                  )
                                }
                                disabled={updatingStatus === assignment.id}
                              >
                                <Check className="h-4 w-4 mr-2" />
                                Accept
                              </Button>
                            </div>
                          )}

                          {assignment.status === "APPROVED" && (
                            <div className="pt-4">
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                                onClick={() => {
                                  // TODO: Navigate to labour profiles for this assignment
                                }}
                              >
                                View Labour Profiles
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
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
