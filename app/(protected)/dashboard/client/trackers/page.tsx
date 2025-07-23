/* eslint-disable @next/next/no-img-element */
// app/(protected)/dashboard/client/recruitment/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  User,
  Building,
  Clock,
  FileText,
} from "lucide-react";
import { useToast } from "@/context/toast-provider";
import {
  RequirementStatus,
  LabourStage,
  LabourProfileStatus,
} from "@/lib/generated/prisma";
import { Modal } from "@/components/ui/Modal";
import ProgressTracker from "@/components/ui/ProgressTracker";
import { Button } from "@/components/ui/Button";
import TravelDocumentsViewerModal from "@/components/shared/TravelDocumentsViewerModal";
import ArrivalConfirmationModal from "@/components/ui/ArrivalConfirmationModal";

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
  signedOfferLetterUrl?: string | null;
  visaUrl?: string | null;
  travelDate?: Date | string | null;
  flightTicketUrl?: string | null;
  medicalCertificateUrl?: string | null;
  policeClearanceUrl?: string | null;
  employmentContractUrl?: string | null;
  additionalDocumentsUrls?: string[];
  labour: LabourProfile & {
    stages: {
      id: string;
      stage: LabourStage;
      status: string;
      notes?: string | null;
      createdAt: Date;
      completedAt?: Date | null;
    }[];
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
  stages?: {
    id: string;
    stage: LabourStage;
    status: string;
    notes?: string | null;
    createdAt: Date;
    completedAt?: Date | null;
  }[];
}

interface OfferLetterDetails {
  workingHours: string;
  workingDays: string;
  leaveSalary: string;
  endOfService: string;
  probationPeriod: string;
}

export default function ClientRecruitment() {
  const itemsPerPage = 10;
  const { toast } = useToast();
  const [selectedRequirement, setSelectedRequirement] = useState<string | null>(
    null
  );
  const [currentJobRoleIndex, setCurrentJobRoleIndex] = useState<number>(0);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [timelineLabour, setTimelineLabour] = useState<LabourProfile | null>(
    null
  );
  const [timelineAssignment, setTimelineAssignment] =
    useState<LabourAssignment | null>(null);
  const [documentsLabour, setDocumentsLabour] = useState<LabourProfile | null>(
    null
  );
  const [documentsAssignment, setDocumentsAssignment] =
    useState<LabourAssignment | null>(null);
  const [offerLetterDetails, setOfferLetterDetails] =
    useState<OfferLetterDetails | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDocumentViewer, setShowDocumentViewer] = useState(false);
  const [showArrivalConfirmation, setShowArrivalConfirmation] = useState(false);
  const [arrivalConfirmationLabour, setArrivalConfirmationLabour] =
    useState<LabourProfile | null>(null);
  const [detailsForm, setDetailsForm] = useState({
    workingHours: "",
    workingDays: "",
    leaveSalary: "",
    endOfService: "",
    probationPeriod: "",
  });
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Stage order for sorting (DEPLOYED always last)
  const STAGE_ORDER = [
    "OFFER_LETTER_SIGN",
    "VISA_APPLYING",
    "QVC_PAYMENT",
    "CONTRACT_SIGN",
    "MEDICAL_STATUS",
    "FINGERPRINT",
    "VISA_PRINTING",
    "READY_TO_TRAVEL",
    "TRAVEL_CONFIRMATION",
    "ARRIVAL_CONFIRMATION",
    "DEPLOYED",
  ];
  const [stageFilter, setStageFilter] = useState<string>("ALL");

  // Function to refresh requirements data
  const refreshRequirements = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/clients/requirements/accepted");
      if (!response.ok) throw new Error("Failed to fetch requirements");

      const data = await response.json();
      setRequirements(data);

      // Update timeline labour if it exists
      if (timelineLabour) {
        const updatedAssignment = data
          .flatMap((req: Requirement) => req.jobRoles)
          .flatMap((role: JobRole) => role.LabourAssignment)
          .find(
            (assignment: LabourAssignment) =>
              assignment.labour.id === timelineLabour.id
          );

        if (updatedAssignment) {
          console.log(
            "Updated labour current stage:",
            updatedAssignment.labour.currentStage
          );
          setTimelineLabour(updatedAssignment.labour);
          setTimelineAssignment(updatedAssignment);
        }
      }

      // Force a re-render by updating the selected requirement
      if (selectedRequirement) {
        setSelectedRequirement(selectedRequirement);
      }
    } catch (error) {
      console.error("Error refreshing requirements:", error);
      toast({
        type: "error",
        message: "Failed to refresh data",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch client requirements with their job roles and labour assignments
  useEffect(() => {
    const fetchRequirements = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/clients/requirements/accepted");
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

  // Pagination logic
  const paginatedRequirements = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return requirements.slice(startIndex, startIndex + itemsPerPage);
  }, [requirements, currentPage]);

  const totalPages = Math.ceil(requirements.length / itemsPerPage);

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

  // Fetch offer letter details for the selected requirement
  useEffect(() => {
    const fetchDetails = async () => {
      if (!selectedRequirement) return setOfferLetterDetails(null);
      try {
        setDetailsLoading(true);
        const res = await fetch(
          `/api/requirements/${selectedRequirement}/offer-letter-details`
        );
        if (res.ok) {
          const data = await res.json();
          setOfferLetterDetails(data);
        } else if (res.status === 404) {
          setShowDetailsModal(true);
          setOfferLetterDetails(null);
        } else {
          setShowDetailsModal(true);
          setOfferLetterDetails(null);
        }
      } finally {
        setDetailsLoading(false);
      }
    };
    fetchDetails();
  }, [selectedRequirement]);

  // Handler to open modal for editing
  const handleEditDetails = () => {
    setDetailsForm({
      workingHours: offerLetterDetails?.workingHours
        ? offerLetterDetails.workingHours.replace(/\D/g, "")
        : "",
      workingDays: offerLetterDetails?.workingDays
        ? offerLetterDetails.workingDays.replace(/\D/g, "")
        : "",
      leaveSalary: offerLetterDetails?.leaveSalary || "",
      endOfService: offerLetterDetails?.endOfService || "",
      probationPeriod: offerLetterDetails?.probationPeriod || "",
    });
    setShowDetailsModal(true);
  };

  const handleDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let newValue = value;
    // Only allow numbers for workingHours and workingDays
    if (name === "workingHours" || name === "workingDays") {
      newValue = value.replace(/[^\d]/g, "");
    }
    setDetailsForm({ ...detailsForm, [name]: newValue });
  };

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    // Validate workingHours and workingDays
    const hours = Number(detailsForm.workingHours);
    const days = Number(detailsForm.workingDays);
    if (
      isNaN(hours) ||
      hours < 1 ||
      hours > 24 ||
      isNaN(days) ||
      days < 1 ||
      days > 7
    ) {
      setFormError("Working hours must be 1-24 and working days must be 1-7.");
      return;
    }
    setDetailsLoading(true);
    try {
      const res = await fetch(
        `/api/requirements/${selectedRequirement}/offer-letter-details`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(detailsForm),
        }
      );
      if (res.ok) {
        const data = await res.json();
        setOfferLetterDetails(data);
        setShowDetailsModal(false);
        toast({ type: "success", message: "Offer letter details saved." });
      } else {
        toast({
          type: "error",
          message: "Failed to save details",
        });
      }
    } finally {
      setDetailsLoading(false);
    }
  };

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

  const formatRequirementId = (id: string) => {
    return id.slice(0, 8).toUpperCase();
  };

  const handleViewTimeline = (
    labour: LabourProfile,
    assignment: LabourAssignment
  ) => {
    setTimelineLabour(labour);
    setTimelineAssignment(assignment);
  };

  const handleViewDocuments = (
    labour: LabourProfile,
    assignment: LabourAssignment
  ) => {
    console.log("View Documents - Labour:", labour);
    console.log("View Documents - Assignment:", assignment);
    setDocumentsLabour(labour);
    setDocumentsAssignment(assignment);
    setShowDocumentViewer(true);
  };

  const handleTimelineUpload = async (stageKey: string, file: File) => {
    if (!timelineAssignment) return;

    try {
      let endpoint = "";
      let successMessage = "";

      switch (stageKey) {
        case "VISA_PRINTING":
          endpoint = `/api/clients/assignments/${timelineAssignment.id}/upload-visa`;
          successMessage = "Visa uploaded successfully";
          break;
        default:
          toast({
            type: "error",
            message: "Upload not implemented for this stage",
          });
          return;
      }

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to upload file");
      }

      toast({ type: "success", message: successMessage });
      await refreshRequirements();
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        type: "error",
        message:
          error instanceof Error ? error.message : "Failed to upload file",
      });
    }
  };

  const handleTimelineAction = async (stageKey: string) => {
    if (!timelineAssignment) return;

    try {
      let endpoint = "";
      let successMessage = "";

      switch (stageKey) {
        case "OFFER_LETTER_SIGN":
          endpoint = `/api/clients/assignments/${timelineAssignment.id}/verify-offer-letter`;
          successMessage = "Signed offer letter verified successfully";
          break;
        case "VISA_APPLYING":
          endpoint = `/api/clients/assignments/${timelineAssignment.id}/mark-visa-applied`;
          successMessage = "Visa application marked as completed successfully";
          break;
        case "QVC_PAYMENT":
          endpoint = `/api/clients/assignments/${timelineAssignment.id}/mark-qvc-paid`;
          successMessage = "QVC payment marked as completed successfully";
          break;
        case "ARRIVAL_CONFIRMATION_MODAL":
          // Open arrival confirmation modal instead of making API call
          setArrivalConfirmationLabour(timelineLabour);
          setShowArrivalConfirmation(true);
          return;
        default:
          toast({
            type: "error",
            message: "Action not implemented for this stage",
          });
          return;
      }

      const res = await fetch(endpoint, {
        method: "POST",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update stage");
      }

      toast({ type: "success", message: successMessage });
      await refreshRequirements();
    } catch (error) {
      console.error("Error updating stage:", error);
      toast({
        type: "error",
        message:
          error instanceof Error ? error.message : "Failed to update stage",
      });
    }
  };

  const handleArrivalConfirmation = async (
    status: "ARRIVED",
    notes?: string
  ) => {
    if (!arrivalConfirmationLabour || !timelineAssignment) return;

    try {
      const requestBody: {
        status: string;
        notes?: string;
      } = { status, notes };

      const res = await fetch(
        `/api/clients/assignments/${timelineAssignment.id}/confirm-arrival`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.error || "Failed to update arrival confirmation"
        );
      }

      const successMessage = `Arrival status updated to ${status} successfully`;
      toast({ type: "success", message: successMessage });

      // Refresh requirements to update the UI
      await refreshRequirements();

      // Close modal
      setShowArrivalConfirmation(false);
      setArrivalConfirmationLabour(null);
    } catch (error) {
      console.error("Error updating arrival confirmation:", error);
      toast({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to update arrival confirmation",
      });
    }
  };

  const LabourCard = ({
    labour,
    jobRoleId,
    assignment,
  }: {
    labour: LabourProfile;
    jobRoleId: string;
    assignment: LabourAssignment;
  }) => {
    const [viewing, setViewing] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const { toast } = useToast();
    const offerLetterBlocked =
      !offerLetterDetails ||
      !offerLetterDetails.workingHours ||
      !offerLetterDetails.workingDays ||
      !offerLetterDetails.leaveSalary ||
      !offerLetterDetails.endOfService ||
      !offerLetterDetails.probationPeriod;

    // Check if OFFER_LETTER_SIGN stage is completed
    const offerLetterStageCompleted = labour.stages?.some(
      (stage) =>
        stage.stage === "OFFER_LETTER_SIGN" && stage.status === "COMPLETED"
    );

    // Check if signed offer letter exists and stage is not completed
    const canVerifyOfferLetter =
      assignment.signedOfferLetterUrl && !offerLetterStageCompleted;

    const handleViewOfferLetter = async () => {
      setViewing(true);
      try {
        if (assignment.signedOfferLetterUrl) {
          // View signed offer letter
          window.open(assignment.signedOfferLetterUrl, "_blank");
        } else {
          // View generated offer letter
          const url = `/api/offer-letter/generate?labourId=${labour.id}&jobRoleId=${jobRoleId}`;
          window.open(url, "_blank");
        }
      } catch {
        toast({ type: "error", message: "Failed to open offer letter PDF" });
      } finally {
        setViewing(false);
      }
    };

    // Download handler

    // Download handler
    const handleDownloadOfferLetter = async () => {
      setDownloading(true);
      try {
        if (assignment.signedOfferLetterUrl) {
          // Download signed offer letter
          const response = await fetch(assignment.signedOfferLetterUrl);
          if (!response.ok)
            throw new Error("Failed to download signed offer letter");
          const blob = await response.blob();
          const downloadUrl = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = downloadUrl;
          a.download = `SignedOfferLetter-${labour.name.replace(/\s+/g, "_")}.pdf`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          window.URL.revokeObjectURL(downloadUrl);
        } else {
          // Download generated offer letter
          const url = `/api/offer-letter/generate?labourId=${labour.id}&jobRoleId=${jobRoleId}&download=1`;
          const res = await fetch(url);
          if (!res.ok) throw new Error("Failed to download offer letter PDF");
          const blob = await res.blob();
          const downloadUrl = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = downloadUrl;
          a.download = `OfferLetter-${labour.name.replace(/\s+/g, "_")}.pdf`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          window.URL.revokeObjectURL(downloadUrl);
        }
      } catch {
        toast({
          type: "error",
          message: "Failed to download offer letter PDF",
        });
      } finally {
        setDownloading(false);
      }
    };

    const handleVerifyOfferLetter = async () => {
      if (!assignment.signedOfferLetterUrl) {
        toast({ type: "error", message: "No signed offer letter to verify" });
        return;
      }

      setVerifying(true);
      try {
        const res = await fetch(
          `/api/clients/assignments/${assignment.id}/verify-offer-letter`,
          {
            method: "POST",
          }
        );
        if (!res.ok) throw new Error("Failed to verify offer letter");

        toast({
          type: "success",
          message: "Signed offer letter verified successfully",
        });
        // Refresh the requirements to update the UI
        await refreshRequirements();
      } catch {
        toast({
          type: "error",
          message: "Failed to verify signed offer letter",
        });
      } finally {
        setVerifying(false);
      }
    };

    return (
      <div
        className={`rounded-lg overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col ${
          labour.currentStage === "DEPLOYED"
            ? "bg-white shadow border border-gray-200"
            : "bg-[#EDDDF3] p-4 relative"
        }`}
      >
        {labour.currentStage === "DEPLOYED" ? (
          // Modern card design for deployed labour
          <>
            <div className="relative h-40 bg-gray-100">
              {labour.profileImage ? (
                <img
                  src={labour.profileImage}
                  alt={labour.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                  <User className="w-16 h-16 text-gray-400" />
                </div>
              )}
              {/* Deployed badge overlay */}
              <div className="absolute top-2 right-2">
                <span className="inline-flex items-center px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full font-medium">
                  Deployed
                </span>
              </div>
            </div>

            <div className="p-4 flex justify-between items-start border-b border-gray-200">
              <div>
                <h3 className="font-semibold text-lg text-gray-900">
                  {labour.name}
                </h3>
                <p className="text-sm text-gray-500">
                  {labour.nationality} • {labour.age} years •{" "}
                  {labour.gender?.toLowerCase()}
                </p>
                <div className="flex gap-2 mt-2">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${getStatusColor(labour.status)}`}
                  >
                    {labour.status.replace("_", " ").toLowerCase()}
                  </span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${getStatusColor(labour.verificationStatus)}`}
                  >
                    {labour.verificationStatus.replace("_", " ").toLowerCase()}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-600">Current Stage:</span>
                <span className="text-sm font-medium text-green-600">
                  Deployed
                </span>
              </div>

              <button
                className="w-full py-2 px-3 bg-[#150B3D] hover:bg-[#0e0726] text-white text-sm rounded flex items-center justify-center gap-2 mb-2"
                onClick={() => {
                  handleViewTimeline(labour, assignment);
                }}
              >
                <Clock className="w-4 h-4" />
                View Timeline
              </button>

              <button
                className="w-full py-2 px-3 bg-[#150B3D] hover:bg-[#0e0726] text-white text-sm rounded flex items-center justify-center gap-2"
                onClick={() => handleViewDocuments(labour, assignment)}
              >
                <FileText className="w-4 h-4" />
                View Documents
              </button>
            </div>
          </>
        ) : (
          // Legacy design for non-deployed labour
          <>
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
                <span className="text-sm text-[#150B3D]/70">
                  Current Stage:
                </span>
                <span className="text-sm font-medium">
                  {labour.currentStage.replace(/_/g, " ")}
                </span>
              </div>
            </div>
            <button
              className="mt-3 w-full py-1.5 px-3 bg-[#3D1673] hover:bg-[#2b0e54] text-white text-xs rounded flex items-center justify-center gap-1"
              onClick={() => {
                handleViewTimeline(labour, assignment);
              }}
            >
              View Timeline
            </button>
          </>
        )}
        {labour.currentStage !== "DEPLOYED" && (
          <button
            className="mt-2 w-full py-1.5 px-3 bg-[#150B3D] hover:bg-[#0e0726] text-white text-xs rounded flex items-center justify-center gap-1 disabled:opacity-50"
            onClick={
              labour.currentStage === "READY_TO_TRAVEL" ||
              labour.currentStage === "TRAVEL_CONFIRMATION" ||
              labour.currentStage === "ARRIVAL_CONFIRMATION"
                ? () => handleViewDocuments(labour, assignment)
                : handleViewOfferLetter
            }
            disabled={viewing || offerLetterBlocked}
            title={
              offerLetterBlocked
                ? "Offer letter details not filled by client"
                : ""
            }
          >
            {labour.currentStage === "READY_TO_TRAVEL" ||
            labour.currentStage === "TRAVEL_CONFIRMATION" ||
            labour.currentStage === "ARRIVAL_CONFIRMATION"
              ? "View Documents"
              : assignment.signedOfferLetterUrl
                ? "View Signed Offer Letter"
                : "View Offer Letter"}
          </button>
        )}
        {labour.currentStage !== "READY_TO_TRAVEL" &&
          labour.currentStage !== "TRAVEL_CONFIRMATION" &&
          labour.currentStage !== "ARRIVAL_CONFIRMATION" &&
          labour.currentStage !== "DEPLOYED" && (
            <button
              className="mt-2 w-full py-1.5 px-3 bg-[#3D1673] hover:bg-[#2b0e54] text-white text-xs rounded flex items-center justify-center gap-1 disabled:opacity-50"
              onClick={handleDownloadOfferLetter}
              disabled={downloading || offerLetterBlocked}
              title={
                offerLetterBlocked
                  ? "Offer letter details not filled by client"
                  : ""
              }
            >
              {downloading ? (
                <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : null}
              {assignment.signedOfferLetterUrl
                ? "Download Signed Offer Letter"
                : "Download Offer Letter"}
            </button>
          )}

        {canVerifyOfferLetter && (
          <button
            className="mt-2 w-full py-1.5 px-3 bg-[#00C853] hover:bg-[#009e3c] text-white text-xs rounded flex items-center justify-center gap-1 disabled:opacity-50"
            onClick={handleVerifyOfferLetter}
            disabled={verifying}
          >
            {verifying ? "Verifying..." : "Verify Signed Offer Letter"}
          </button>
        )}
      </div>
    );
  };

  // Filter and sort labours before rendering
  const getSortedFilteredAssignments = (assignments: LabourAssignment[]) => {
    let filtered = assignments;
    if (stageFilter !== "ALL") {
      filtered = assignments.filter(
        (a) => a.labour.currentStage === stageFilter
      );
    }
    return filtered.slice().sort((a, b) => {
      const aIdx = STAGE_ORDER.indexOf(a.labour.currentStage);
      const bIdx = STAGE_ORDER.indexOf(b.labour.currentStage);
      return aIdx - bIdx;
    });
  };

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
            {paginatedRequirements.map((requirement) => (
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

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-4">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
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
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
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
                <Building className="w-6 h-6 text-[#150B3D]" />
                <div>
                  <h2 className="text-xl font-semibold text-[#150B3D]">
                    Requirement #
                    {formatRequirementId(selectedRequirementData.id)}
                  </h2>
                  <p className="text-sm text-[#150B3D]/70">
                    Created:{" "}
                    {new Date(
                      selectedRequirementData.createdAt
                    ).toLocaleDateString()}
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
            </div>
            {offerLetterDetails && (
              <div className="mb-4 flex justify-end">
                <Button onClick={handleEditDetails} variant="outline">
                  Edit Offer Letter Details
                </Button>
              </div>
            )}

            <div className="flex justify-between items-center mb-4">
              <div className="font-bold text-lg text-[#150B3D]">
                Recruitment Tracker
              </div>
              <select
                className="border rounded px-2 py-1 text-sm"
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
              >
                <option value="ALL">All Stages</option>
                {STAGE_ORDER.map((stage) => (
                  <option key={stage} value={stage}>
                    {stage.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>
            {/* Labour Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {currentJobRole &&
              getSortedFilteredAssignments(currentJobRole.LabourAssignment)
                .length === 0 ? (
                <div className="col-span-full text-center text-[#150B3D]/50 py-8">
                  No labours found for this stage.
                </div>
              ) : (
                currentJobRole &&
                getSortedFilteredAssignments(
                  currentJobRole.LabourAssignment
                ).map((assignment) => (
                  <LabourCard
                    key={assignment.id}
                    labour={assignment.labour}
                    jobRoleId={currentJobRole.id}
                    assignment={assignment}
                  />
                ))
              )}
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
        {/* Timeline Modal */}
        <Modal
          isOpen={!!timelineLabour}
          onClose={() => {
            setTimelineLabour(null);
            setTimelineAssignment(null);
          }}
          title={
            timelineLabour ? `${timelineLabour.name}'s Onboarding Timeline` : ""
          }
          size="2xl"
        >
          {timelineLabour && (
            <>
              {/* Debug info */}
              {console.log("Timeline Assignment:", timelineAssignment)}
              {console.log("Visa URL:", timelineAssignment?.visaUrl)}
              <ProgressTracker
                currentStage={timelineLabour.currentStage}
                statuses={Object.fromEntries(
                  (timelineLabour.stages || []).map((s) => [s.stage, s.status])
                )}
                userRole="CLIENT_ADMIN"
                onAction={handleTimelineAction}
                onUpload={handleTimelineUpload}
                documents={{
                  VISA_PRINTING: timelineAssignment?.visaUrl || "",
                }}
              />
            </>
          )}
        </Modal>
        <Modal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          title="Enter Offer Letter Details"
          showFooter={false}
        >
          <form onSubmit={handleDetailsSubmit} className="space-y-4 my-5">
            {formError && (
              <div className="text-red-600 text-sm mb-2">{formError}</div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1">
                Working Hours{" "}
                <span className="text-xs text-gray-500">(1-24 hours)</span>
              </label>
              <input
                name="workingHours"
                type="number"
                min={1}
                max={24}
                value={detailsForm.workingHours}
                onChange={handleDetailsChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Working Days{" "}
                <span className="text-xs text-gray-500">(1-7 days)</span>
              </label>
              <input
                name="workingDays"
                type="number"
                min={1}
                max={7}
                value={detailsForm.workingDays}
                onChange={handleDetailsChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Leave Salary
              </label>
              <input
                name="leaveSalary"
                value={detailsForm.leaveSalary}
                onChange={handleDetailsChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                End of Service
              </label>
              <input
                name="endOfService"
                value={detailsForm.endOfService}
                onChange={handleDetailsChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Probation Period
              </label>
              <input
                name="probationPeriod"
                value={detailsForm.probationPeriod}
                onChange={handleDetailsChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 px-4 bg-[#3D1673] text-white rounded"
              disabled={detailsLoading}
            >
              {detailsLoading ? "Saving..." : "Save Details"}
            </button>
          </form>
        </Modal>

        {/* Document Viewer Modal */}
        <TravelDocumentsViewerModal
          isOpen={showDocumentViewer}
          onClose={() => {
            setShowDocumentViewer(false);
            setDocumentsLabour(null);
            setDocumentsAssignment(null);
          }}
          labourName={documentsLabour?.name || ""}
          visaUrl={documentsAssignment?.visaUrl || ""}
          existingTravelDate={
            documentsAssignment?.travelDate
              ? (() => {
                  const travelDate = documentsAssignment.travelDate;
                  if (
                    travelDate &&
                    typeof travelDate === "object" &&
                    "toISOString" in travelDate
                  ) {
                    return (travelDate as Date).toISOString();
                  }
                  if (typeof travelDate === "string") {
                    return travelDate;
                  }
                  return "";
                })()
              : ""
          }
          existingDocuments={
            documentsLabour && documentsAssignment
              ? (() => {
                  const documents = [];

                  // Add flight ticket if available
                  if (documentsAssignment.flightTicketUrl) {
                    documents.push({
                      id: "flight-ticket-1",
                      name: "Flight Ticket",
                      type: "flight-ticket",
                      url: documentsAssignment.flightTicketUrl,
                      uploadedAt: new Date().toISOString(),
                    });
                  }

                  // Add medical certificate if available
                  if (documentsAssignment.medicalCertificateUrl) {
                    documents.push({
                      id: "medical-certificate-1",
                      name: "Medical Certificate",
                      type: "medical-certificate",
                      url: documentsAssignment.medicalCertificateUrl,
                      uploadedAt: new Date().toISOString(),
                    });
                  }

                  // Add police clearance if available
                  if (documentsAssignment.policeClearanceUrl) {
                    documents.push({
                      id: "police-clearance-1",
                      name: "Police Clearance",
                      type: "police-clearance",
                      url: documentsAssignment.policeClearanceUrl,
                      uploadedAt: new Date().toISOString(),
                    });
                  }

                  // Add employment contract if available
                  if (documentsAssignment.employmentContractUrl) {
                    documents.push({
                      id: "employment-contract-1",
                      name: "Employment Contract",
                      type: "employment-contract",
                      url: documentsAssignment.employmentContractUrl,
                      uploadedAt: new Date().toISOString(),
                    });
                  }

                  // Add additional documents if available
                  if (
                    documentsAssignment.additionalDocumentsUrls &&
                    documentsAssignment.additionalDocumentsUrls.length > 0
                  ) {
                    documentsAssignment.additionalDocumentsUrls.forEach(
                      (url, index) => {
                        documents.push({
                          id: `additional-documents-${index + 1}`,
                          name: `Additional Document ${index + 1}`,
                          type: "additional-documents",
                          url: url,
                          uploadedAt: new Date().toISOString(),
                        });
                      }
                    );
                  }

                  return documents;
                })()
              : []
          }
        />

        {/* Arrival Confirmation Modal */}
        <ArrivalConfirmationModal
          isOpen={showArrivalConfirmation}
          onClose={() => {
            setShowArrivalConfirmation(false);
            setArrivalConfirmationLabour(null);
          }}
          onConfirm={handleArrivalConfirmation}
          labourName={arrivalConfirmationLabour?.name || ""}
        />
      </div>
    </div>
  );
}
