// app/(protected)/dashboard/agency/requirements/page.tsx
"use client";

import { Card, CardContent, CardHeader } from "@/components/shared/Card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/Button";
import { Clock, Calendar, Briefcase, Flag, Check, X } from "lucide-react";
import { useToast } from "@/context/toast-provider";
import { useState, useEffect } from "react";
import { RequirementStatus } from "@/lib/generated/prisma";

interface RequirementAssignment {
  id: string;
  quantity: number;
  status: RequirementStatus;
  createdAt: Date;
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
}

export default function AssignedRequirements() {
  const [assignments, setAssignments] = useState<RequirementAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingAssignment, setUpdatingAssignment] = useState<string | null>(
    null
  );
  const { toast } = useToast();

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/agencies/requirements/assignments");
        if (response.ok) {
          const data = await response.json();

          // Filter out rejected assignments older than 1 hour
          const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
          const filteredAssignments = data.assignments.filter(
            (assignment: any) => {
              if (assignment.status === "REJECTED") {
                return new Date(assignment.updatedAt) > oneHourAgo;
              }
              return true;
            }
          );

          // Sort with APPROVED first, then others, then REJECTED
          filteredAssignments.sort((a: any, b: any) => {
            if (a.status === "APPROVED" && b.status !== "APPROVED") return -1;
            if (a.status !== "APPROVED" && b.status === "APPROVED") return 1;
            if (a.status === "REJECTED" && b.status !== "REJECTED") return 1;
            if (a.status !== "REJECTED" && b.status === "REJECTED") return -1;
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

  const handleUpdateAssignmentStatus = async (
    assignmentId: string,
    status: "APPROVED" | "REJECTED"
  ) => {
    try {
      setUpdatingAssignment(assignmentId);
      const response = await fetch(
        `/api/agencies/requirements/${assignmentId}/status`,
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
      if (!updatedAssignment.jobRole || !updatedAssignment.requirement) {
        const refreshResponse = await fetch(
          "/api/agencies/requirements/assignments"
        );
        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          setAssignments(data.assignments);
        }
      } else {
        // Otherwise update just this assignment
        setAssignments((prev) =>
          prev.map((a) => (a.id === assignmentId ? updatedAssignment : a))
        );
      }

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
                            <span className="font-medium">Duration: </span>
                            {getDuration(jobRole.contractDuration)}
                          </div>
                        </div>

                        <div className="flex items-start space-x-2">
                          <div>
                            <span className="font-medium">Languages: </span>
                            {assignment.requirement.languages.join(", ") ||
                              "Not specified"}
                          </div>
                        </div>

                        <div className="flex items-start space-x-2">
                          <div>
                            <span className="font-medium">Experience: </span>
                            {getExperienceLevel(
                              assignment.requirement.minExperience
                            )}
                          </div>
                        </div>

                        <div className="flex items-start space-x-2">
                          <div>
                            <span className="font-medium">Max Age: </span>
                            {assignment.requirement.maxAge || "Not specified"}
                          </div>
                        </div>

                        <div className="flex items-start space-x-2">
                          <div>
                            <span className="font-medium">Ticket: </span>
                            {getTicketType(assignment.requirement.ticketType)}
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
                        disabled={updatingAssignment === assignment.id}
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
                        disabled={updatingAssignment === assignment.id}
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Accept
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
