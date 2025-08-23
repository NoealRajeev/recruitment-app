/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  User,
  Building,
  Clock,
  Menu,
  X as CloseIcon,
} from "lucide-react";
import { useToast } from "@/context/toast-provider";
import {
  RequirementStatus,
  LabourStage,
  LabourProfileStatus,
  StageStatus,
} from "@/lib/generated/prisma";
import { Modal } from "@/components/ui/Modal";
import ProgressTracker from "@/components/ui/ProgressTracker";
import TravelDocumentsViewerModal from "@/components/shared/TravelDocumentsViewerModal";
import EditDocumentsModal from "@/components/shared/EditDocumentsModal";
import TravelConfirmationModal from "@/components/ui/TravelConfirmationModal";

/* =========================
   Types (unchanged)
========================= */
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
  signedOfferLetterUrl?: string | null;
  visaUrl?: string | null;
  travelDate?: Date | string | null;
  flightTicketUrl?: string | null;
  medicalCertificateUrl?: string | null;
  policeClearanceUrl?: string | null;
  employmentContractUrl?: string | null;
  additionalDocumentsUrls?: string[];
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
  stages?: LabourStageHistory[];
}

interface LabourStageHistory {
  id: string;
  stage: LabourStage;
  status: StageStatus;
  notes?: string | null;
  createdAt: Date;
  completedAt?: Date | null;
}

interface OfferLetterDetails {
  workingHours: string;
  workingDays: string;
  leaveSalary: string;
  endOfService: string;
  probationPeriod: string;
}

/* =========================
   Constants (unchanged)
========================= */
const ITEMS_PER_PAGE = 10;
const STATUS_COLORS = {
  PENDING: "text-[#C86300]",
  REJECTED: "text-[#ED1C24]",
  NOT_VERIFIED: "text-[#150B3D]/70",
  VERIFIED: "text-[#00C853]",
  COMPLETED: "text-[#00C853]",
  DEFAULT: "text-[#150B3D]/70",
};

/* =========================
   API helpers (unchanged)
========================= */
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
  stageData: { stage: LabourStage; status: StageStatus; notes: string }
) => {
  const response = await fetch(
    `/api/agencies/labour-profiles/${labourId}/stages`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(stageData),
    }
  );
  if (!response.ok) throw new Error("Failed to update stage");
  return response.json();
};

/* =========================
   LabourCard (unchanged UI)
========================= */
const LabourCard = ({
  labour,
  jobRoleId,
  onViewTimeline,
  offerLetterDetails,
  signedOfferLetterUrl,
  assignmentId,
  onSignedOfferLetterUploaded,
  onEditDocuments,
  setDocumentViewerLabour,
  setShowDocumentViewer,
  setTravelConfirmationLabour,
  setShowTravelConfirmation,
}: {
  labour: LabourProfile;
  jobRoleId: string;
  onViewTimeline: () => void;
  offerLetterDetails: OfferLetterDetails | null;
  signedOfferLetterUrl: string | null;
  assignmentId: string;
  onSignedOfferLetterUploaded: () => void;
  onEditDocuments: () => void;
  setDocumentViewerLabour: (labour: LabourProfile) => void;
  setShowDocumentViewer: (open: boolean) => void;
  setTravelConfirmationLabour: (labour: LabourProfile) => void;
  setShowTravelConfirmation: (open: boolean) => void;
}) => {
  const [downloading, setDownloading] = useState(false);
  const [viewing, setViewing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const offerLetterBlocked =
    !offerLetterDetails ||
    !offerLetterDetails.workingHours ||
    !offerLetterDetails.workingDays ||
    !offerLetterDetails.leaveSalary ||
    !offerLetterDetails.endOfService ||
    !offerLetterDetails.probationPeriod;

  const handleDownloadOfferLetter = async () => {
    setDownloading(true);
    try {
      if (signedOfferLetterUrl) {
        const response = await fetch(signedOfferLetterUrl);
        if (!response.ok)
          throw new Error("Failed to download signed offer letter");
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `SignedOfferLetter-${labour.name.replace(/\s+/g, "_")}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } else {
        const res = await fetch(
          `/api/offer-letter/generate?labourId=${labour.id}&jobRoleId=${jobRoleId}`
        );
        if (!res.ok) throw new Error("Failed to generate offer letter PDF");
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `OfferLetter-${labour.name.replace(/\s+/g, "_")}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      }
    } catch {
      toast({ type: "error", message: "Failed to download offer letter PDF" });
    } finally {
      setDownloading(false);
    }
  };

  const handleViewOfferLetter = async () => {
    setViewing(true);
    try {
      const url = `/api/offer-letter/generate?labourId=${labour.id}&jobRoleId=${jobRoleId}`;
      window.open(url, "_blank");
    } catch {
      toast({ type: "error", message: "Failed to open offer letter PDF" });
    } finally {
      setViewing(false);
    }
  };

  const handleViewSignedOfferLetter = () => {
    if (signedOfferLetterUrl) window.open(signedOfferLetterUrl, "_blank");
  };

  const handleUploadClick = () => fileInputRef.current?.click();

  const { toast: _toast } = useToast(); // to keep provider in scope

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      _toast({ type: "error", message: "Only PDF files are allowed." });
      return;
    }
    const url = URL.createObjectURL(file);
    setSelectedFile(file);
    setPreviewUrl(url);
    setShowPreviewModal(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleAcceptUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("assignmentId", assignmentId);
      const res = await fetch("/api/offer-letter/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Failed to upload signed offer letter");
      _toast({ type: "success", message: "Signed offer letter uploaded." });
      onSignedOfferLetterUploaded();
      setShowPreviewModal(false);
    } catch {
      _toast({
        type: "error",
        message: "Failed to upload signed offer letter.",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDiscardUpload = () => {
    setShowPreviewModal(false);
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const getStatusColor = (status: string) =>
    STATUS_COLORS[status as keyof typeof STATUS_COLORS] ||
    STATUS_COLORS.DEFAULT;

  const isAfterReadyToTravel = [
    "TRAVEL_CONFIRMATION",
    "ARRIVAL_CONFIRMATION",
    "DEPLOYED",
  ].includes(labour.currentStage);

  return (
    <>
      <div
        className={`rounded-lg overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col ${
          labour.currentStage === "DEPLOYED"
            ? "bg-white shadow border border-gray-200"
            : "bg-[#EDDDF3] p-4 relative"
        }`}
      >
        {labour.currentStage === "DEPLOYED" ? (
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
                onClick={onViewTimeline}
              >
                <Clock className="w-4 h-4" />
                View Timeline
              </button>
            </div>
          </>
        ) : (
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
              onClick={onViewTimeline}
            >
              View Timeline
            </button>
          </>
        )}

        {isAfterReadyToTravel ? (
          <>
            {labour.currentStage === "DEPLOYED" ? (
              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-center">
                <div className="text-green-600 text-xs font-medium">
                  ✅ Successfully Deployed
                </div>
                <div className="text-green-500 text-xs mt-1">
                  Labour has been deployed and is working
                </div>
              </div>
            ) : (
              <>
                <button
                  className="mt-2 w-full py-1.5 px-3 bg-[#150B3D] hover:bg-[#0e0726] text-white text-xs rounded flex items-center justify-center gap-1"
                  onClick={() => {
                    setDocumentViewerLabour(labour);
                    setShowDocumentViewer(true);
                  }}
                >
                  View Documents
                </button>
                {labour.currentStage === "TRAVEL_CONFIRMATION" && (
                  <button
                    className="mt-2 w-full bg-[#150B3D] hover:bg-[#0e0726] text-white py-1.5 px-3 text-xs rounded flex items-center justify-center gap-1"
                    onClick={() => {
                      setTravelConfirmationLabour(labour);
                      setShowTravelConfirmation(true);
                    }}
                  >
                    Update Travel Status
                  </button>
                )}
              </>
            )}
          </>
        ) : (
          <>
            {signedOfferLetterUrl ? (
              <button
                className="mt-2 w-full py-1.5 px-3 bg-[#150B3D] hover:bg-[#0e0726] text-white text-xs rounded flex items-center justify-center gap-1"
                onClick={handleViewSignedOfferLetter}
              >
                View Signed Offer Letter
              </button>
            ) : (
              <button
                className="mt-2 w-full py-1.5 px-3 bg-[#150B3D] hover:bg-[#0e0726] text-white text-xs rounded flex items-center justify-center gap-1 disabled:opacity-50"
                onClick={handleViewOfferLetter}
                disabled={viewing || offerLetterBlocked}
                title={
                  offerLetterBlocked
                    ? "Offer letter details not filled by client"
                    : ""
                }
              >
                View Offer Letter
              </button>
            )}
            <button
              className="mt-2 w-full py-1.5 px-3 bg-[#150B3D] hover:bg-[#0e0726] text-white text-xs rounded flex items-center justify-center gap-1 disabled:opacity-50"
              onClick={
                labour.currentStage === "READY_TO_TRAVEL" &&
                signedOfferLetterUrl
                  ? onEditDocuments
                  : handleDownloadOfferLetter
              }
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
              {labour.currentStage === "READY_TO_TRAVEL" && signedOfferLetterUrl
                ? "Update Documents"
                : signedOfferLetterUrl
                  ? "Download Signed Offer Letter"
                  : "Download Offer Letter"}
            </button>
            {!signedOfferLetterUrl && (
              <input
                type="file"
                accept="application/pdf"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
              />
            )}
            {!signedOfferLetterUrl && (
              <button
                className="mt-2 w-full py-1.5 px-3 bg-[#00C853] hover:bg-[#009e3c] text-white text-xs rounded flex items-center justify-center gap-1 disabled:opacity-50"
                onClick={handleUploadClick}
                disabled={uploading || !!signedOfferLetterUrl}
              >
                {uploading ? "Uploading..." : "Upload Signed Offer Letter"}
              </button>
            )}
          </>
        )}
      </div>

      {/* PDF Preview Modal */}
      <Modal
        isOpen={showPreviewModal}
        onClose={handleDiscardUpload}
        title="Preview Signed Offer Letter"
        size="4xl"
        showFooter
        onConfirm={handleAcceptUpload}
        onCancel={handleDiscardUpload}
        confirmText={uploading ? "Uploading..." : "Accept & Upload"}
        cancelText="Discard"
        confirmDisabled={uploading}
        className="max-w-[95vw]" /* responsive width */
      >
        <div className="space-y-4">
          <div className="text-sm text-[#150B3D]/70">
            <p>File: {selectedFile?.name}</p>
            <p>
              Size:{" "}
              {selectedFile?.size
                ? (selectedFile.size / 1024 / 1024).toFixed(2)
                : "0"}{" "}
              MB
            </p>
          </div>
          <div className="border rounded-lg overflow-hidden h-[60vh] md:h-[500px]">
            {previewUrl && (
              <iframe
                src={previewUrl}
                className="w-full h-full"
                title="PDF Preview"
              />
            )}
          </div>
          <div className="text-sm text-[#150B3D]/70">
            <p>
              Please review the PDF above. Click &quot;Accept &amp; Upload&quot;
              to proceed or &quot;Discard&quot; to cancel.
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
};

/* =========================
   Sidebar (responsive)
========================= */
const RequirementsSidebar = ({
  requirements,
  currentPage,
  totalPages,
  selectedRequirement,
  onRequirementSelect,
  onPageChange,
  loading,
  mobileOpen, // NEW
  onCloseMobile, // NEW
}: {
  requirements: Requirement[];
  currentPage: number;
  totalPages: number;
  selectedRequirement: string | null;
  onRequirementSelect: (id: string) => void;
  onPageChange: (page: number) => void;
  loading: boolean;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}) => {
  const paginatedRequirements = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return requirements.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [requirements, currentPage]);

  const formatRequirementId = (id: string) => id.slice(0, 8).toUpperCase();

  // Wrapper classes to support overlay on mobile
  return (
    <div
      className={[
        // base panel styling
        "rounded-lg p-4 overflow-y-auto bg-transparent",
        // width: full on mobile, 1/4 on md, 1/6 on lg+
        "w-full md:w-1/4 lg:w-1/6",
        // height handling: make it scrollable within viewport on mobile
        "max-h-[70vh] md:max-h-none",
        // overlay behavior for mobile when opened
        mobileOpen
          ? "fixed inset-0 z-40 bg-black/20 p-0 md:static md:bg-transparent"
          : "relative",
      ].join(" ")}
    >
      {/* Mobile slide-in panel */}
      <div
        className={[
          "md:static md:translate-x-0 md:shadow-none",
          mobileOpen
            ? "absolute left-0 top-0 h-full w-80 shadow-2xl"
            : "hidden md:block",
          "bg-white rounded-r-lg p-4 overflow-y-auto",
        ].join(" ")}
      >
        {/* Mobile header */}
        <div className="flex items-center justify-between md:hidden mb-2">
          <span className="font-semibold text-[#150B3D]">Requirements</span>
          <button
            onClick={onCloseMobile}
            className="p-2 rounded-full hover:bg-gray-100 text-[#150B3D]"
            aria-label="Close sidebar"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

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
                onClick={() => {
                  onRequirementSelect(requirement.id);
                  onCloseMobile?.();
                }}
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
    </div>
  );
};

/* =========================
   JobRoleHeader (unchanged layout, responsive by flex)
========================= */
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
  const formatRequirementId = (id: string) => id.slice(0, 8).toUpperCase();

  return (
    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 mb-6 bg-[#EDDDF3]/50 p-4 rounded-2xl">
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

/* =========================
   UpdateStageModal (unchanged)
========================= */
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
      toast({ type: "success", message: "Stage updated successfully" });
      onClose();
    } catch (error) {
      console.error("Error updating stage:", error);
      toast({ type: "error", message: "Failed to update stage" });
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
      className="max-w-[95vw]" /* responsive width */
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
            {Object.values(LabourStage).map((st) => (
              <option key={st} value={st}>
                {st.replace(/_/g, " ")}
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

/* =========================
   Main Page (responsive layout)
========================= */
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
  const { toast } = useToast();
  const [timelineLabour, setTimelineLabour] = useState<LabourProfile | null>(
    null
  );
  const [editDocumentsLabour, setEditDocumentsLabour] =
    useState<LabourProfile | null>(null);
  const [offerLetterDetails, setOfferLetterDetails] =
    useState<OfferLetterDetails | null>(null);
  const [showDocumentViewer, setShowDocumentViewer] = useState(false);
  const [documentViewerLabour, setDocumentViewerLabour] =
    useState<LabourProfile | null>(null);
  const [showEditDocuments, setShowEditDocuments] = useState(false);
  const [showTravelConfirmation, setShowTravelConfirmation] = useState(false);
  const [travelConfirmationLabour, setTravelConfirmationLabour] =
    useState<LabourProfile | null>(null);

  const [stageFilter, setStageFilter] = useState<string>("ALL");
  const [sidebarOpen, setSidebarOpen] = useState(false); // NEW: mobile sidebar

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

  // Fetch requirements
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
        toast({ type: "error", message: "Failed to load requirements" });
      } finally {
        setLoading(false);
      }
    };
    loadRequirements();
  }, [selectedRequirement, toast]);

  // Offer letter details
  useEffect(() => {
    const fetchDetails = async () => {
      if (!selectedRequirement) return setOfferLetterDetails(null);
      try {
        const res = await fetch(
          `/api/requirements/${selectedRequirement}/offer-letter-details`
        );
        if (res.ok) {
          const data = await res.json();
          setOfferLetterDetails(data);
        } else {
          setOfferLetterDetails(null);
        }
      } catch {
        toast({
          type: "error",
          message: "Failed to download offer letter PDF",
        });
      }
    };
    fetchDetails();
  }, [selectedRequirement, toast]);

  const selectedRequirementData = useMemo(
    () => requirements.find((r) => r.id === selectedRequirement),
    [requirements, selectedRequirement]
  );

  const currentJobRole = useMemo(
    () => selectedRequirementData?.jobRoles[currentJobRoleIndex],
    [selectedRequirementData, currentJobRoleIndex]
  );

  const totalPages = Math.ceil(requirements.length / ITEMS_PER_PAGE);

  const handlePreviousJobRole = useCallback(() => {
    if (currentJobRoleIndex > 0)
      setCurrentJobRoleIndex(currentJobRoleIndex - 1);
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

  const handlePageChange = useCallback(
    (page: number) => setCurrentPage(page),
    []
  );

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
    (labour: LabourProfile) => setTimelineLabour(labour),
    []
  );
  const handleCloseModal = useCallback(() => {
    setSelectedLabour(null);
    setShowStageForm(false);
  }, []);
  const handleCloseTimelineModal = useCallback(
    () => setTimelineLabour(null),
    []
  );

  const handleTravelConfirmation = async (
    status: "TRAVELED" | "RESCHEDULED" | "CANCELED",
    rescheduledDate?: string,
    notes?: string,
    flightTicketFile?: File | null
  ) => {
    if (!travelConfirmationLabour) return;

    try {
      const assignment = requirements
        .flatMap((req) => req.jobRoles)
        .flatMap((role) => role.LabourAssignment)
        .find((as) => as.labour.id === travelConfirmationLabour.id);

      if (!assignment) {
        toast({ type: "error", message: "Assignment not found" });
        return;
      }

      if (status === "RESCHEDULED" && flightTicketFile) {
        const formData = new FormData();
        formData.append("flightTicket", flightTicketFile);
        formData.append("status", status);
        if (rescheduledDate)
          formData.append("rescheduledTravelDate", rescheduledDate);
        if (notes) formData.append("notes", notes);

        const res = await fetch(
          `/api/agencies/assignments/${assignment.id}/travel-confirmation`,
          { method: "POST", body: formData }
        );
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(
            errorData.error || "Failed to update travel confirmation"
          );
        }
      } else {
        const requestBody: {
          status: string;
          notes?: string;
          rescheduledTravelDate?: string;
        } = {
          status,
          notes,
        };
        if (status === "RESCHEDULED" && rescheduledDate) {
          requestBody.rescheduledTravelDate = rescheduledDate;
        }
        const res = await fetch(
          `/api/agencies/assignments/${assignment.id}/travel-confirmation`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
          }
        );
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(
            errorData.error || "Failed to update travel confirmation"
          );
        }
      }

      toast({
        type: "success",
        message: `Travel status updated to ${status} successfully`,
      });

      const updatedRequirements = await fetchRequirements();
      setRequirements(updatedRequirements);

      if (timelineLabour && timelineLabour.id === travelConfirmationLabour.id) {
        const updatedLabour = updatedRequirements
          .flatMap((req) => req.jobRoles)
          .flatMap((role) => role.LabourAssignment)
          .find((as) => as.labour.id === travelConfirmationLabour.id)?.labour;
        if (updatedLabour) setTimelineLabour(updatedLabour);
      }

      setShowTravelConfirmation(false);
      setTravelConfirmationLabour(null);
    } catch (error) {
      console.error("Error updating travel confirmation:", error);
      toast({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to update travel confirmation",
      });
    }
  };

  const handleTimelineUpload = async (stageKey: string, file: File) => {
    if (!timelineLabour) return;
    try {
      const assignment = requirements
        .flatMap((req) => req.jobRoles)
        .flatMap((role) => role.LabourAssignment)
        .find((as) => as.labour.id === timelineLabour.id);

      if (!assignment) {
        toast({ type: "error", message: "Assignment not found" });
        return;
      }

      if (stageKey === "OFFER_LETTER_SIGN") {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("assignmentId", assignment.id);
        const res = await fetch("/api/offer-letter/upload", {
          method: "POST",
          body: formData,
        });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(
            errorData.error || "Failed to upload signed offer letter"
          );
        }
        toast({
          type: "success",
          message: "Signed offer letter uploaded successfully",
        });

        const updatedRequirements = await fetchRequirements();
        setRequirements(updatedRequirements);

        const updatedLabour = updatedRequirements
          .flatMap((req) => req.jobRoles)
          .flatMap((role) => role.LabourAssignment)
          .find((as) => as.labour.id === timelineLabour.id)?.labour;
        if (updatedLabour) setTimelineLabour(updatedLabour);
      } else {
        toast({
          type: "error",
          message: "Upload not implemented for this stage",
        });
      }
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
    if (!timelineLabour) return;
    try {
      const assignment = requirements
        .flatMap((req) => req.jobRoles)
        .flatMap((role) => role.LabourAssignment)
        .find((as) => as.labour.id === timelineLabour.id);

      if (!assignment) {
        toast({ type: "error", message: "Assignment not found" });
        return;
      }

      let endpoint = "";
      let successMessage = "";
      if (stageKey === "CONTRACT_SIGN_APPROVE") {
        endpoint = `/api/agencies/assignments/${assignment.id}/approve-contract`;
        successMessage = "Contract approved successfully";
      } else if (stageKey === "CONTRACT_SIGN_REFUSE") {
        endpoint = `/api/agencies/assignments/${assignment.id}/refuse-contract`;
        successMessage = "Contract refused successfully";
      } else if (stageKey === "MEDICAL_STATUS_FIT") {
        endpoint = `/api/agencies/assignments/${assignment.id}/mark-medical-fit`;
        successMessage = "Medical status marked as fit successfully";
      } else if (stageKey === "MEDICAL_STATUS_UNFIT") {
        endpoint = `/api/agencies/assignments/${assignment.id}/mark-medical-unfit`;
        successMessage = "Medical status marked as unfit successfully";
      } else if (stageKey === "FINGERPRINT_PASS") {
        endpoint = `/api/agencies/assignments/${assignment.id}/mark-fingerprint-pass`;
        successMessage = "Fingerprint marked as passed successfully";
      } else if (stageKey === "FINGERPRINT_FAIL") {
        endpoint = `/api/agencies/assignments/${assignment.id}/mark-fingerprint-fail`;
        successMessage = "Fingerprint marked as failed successfully";
      } else if (stageKey === "TRAVEL_CONFIRMATION_TRAVELED") {
        endpoint = `/api/agencies/assignments/${assignment.id}/travel-confirmation`;
        successMessage = "Travel status updated to Traveled successfully";
      } else if (stageKey === "TRAVEL_CONFIRMATION_RESCHEDULED") {
        endpoint = `/api/agencies/assignments/${assignment.id}/travel-confirmation`;
        successMessage = "Travel status updated to Rescheduled successfully";
      } else if (stageKey === "TRAVEL_CONFIRMATION_CANCELED") {
        endpoint = `/api/agencies/assignments/${assignment.id}/travel-confirmation`;
        successMessage = "Travel status updated to Canceled successfully";
      } else if (stageKey === "TRAVEL_CONFIRMATION_MODAL") {
        setTravelConfirmationLabour(timelineLabour);
        setShowTravelConfirmation(true);
        return;
      } else {
        toast({
          type: "error",
          message: "Action not implemented for this stage",
        });
        return;
      }

      let requestBody = {};
      if (stageKey.startsWith("TRAVEL_CONFIRMATION_")) {
        const status = stageKey.split("_")[2];
        requestBody = { status };
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: Object.keys(requestBody).length
          ? JSON.stringify(requestBody)
          : undefined,
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update stage");
      }

      toast({ type: "success", message: successMessage });

      const updatedRequirements = await fetchRequirements();
      setRequirements(updatedRequirements);

      const updatedLabour = updatedRequirements
        .flatMap((req) => req.jobRoles)
        .flatMap((role) => role.LabourAssignment)
        .find((as) => as.labour.id === timelineLabour.id)?.labour;
      if (updatedLabour) setTimelineLabour(updatedLabour);
    } catch (error) {
      console.error("Error updating stage:", error);
      toast({
        type: "error",
        message:
          error instanceof Error ? error.message : "Failed to update stage",
      });
    }
  };

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

  /* =========================
     Responsive Layout starts here
  ========================= */
  return (
    <div className="px-4 md:px-6 min-h-[100dvh]">
      {/* Top bar (mobile): menu + filter */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 md:hidden">
        <div className="flex items-center justify-between py-3">
          <button
            className="inline-flex items-center gap-2 text-[#150B3D] px-2 py-2 rounded-md hover:bg-[#EDDDF3]/60"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
            <span className="text-sm font-medium">Requirements</span>
          </button>

          <div className="pr-1">
            <select
              className="border rounded px-2 py-2 text-sm"
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
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar: overlays on mobile, column on md+ */}
        <RequirementsSidebar
          requirements={requirements}
          currentPage={currentPage}
          totalPages={totalPages}
          selectedRequirement={selectedRequirement}
          onRequirementSelect={(id) => {
            handleRequirementSelect(id);
            setSidebarOpen(false);
          }}
          onPageChange={handlePageChange}
          loading={loading}
          mobileOpen={sidebarOpen}
          onCloseMobile={() => setSidebarOpen(false)}
        />

        {/* Main content */}
        <div className="w-full md:flex-1 rounded-lg p-0 md:p-6 overflow-visible md:overflow-y-auto">
          {/* Desktop filter row */}
          <div className="hidden md:flex justify-end items-center mb-4">
            <select
              className="border rounded px-2 py-1.5 text-sm"
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

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

              {/* Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
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
                      onViewTimeline={() =>
                        handleViewTimeline(assignment.labour)
                      }
                      offerLetterDetails={offerLetterDetails}
                      signedOfferLetterUrl={
                        assignment.signedOfferLetterUrl ?? null
                      }
                      assignmentId={assignment.id}
                      onSignedOfferLetterUploaded={async () => {
                        const updatedRequirements = await fetchRequirements();
                        setRequirements(updatedRequirements);
                      }}
                      onEditDocuments={() => {
                        setEditDocumentsLabour(assignment.labour);
                        setShowEditDocuments(true);
                      }}
                      setDocumentViewerLabour={setDocumentViewerLabour}
                      setShowDocumentViewer={setShowDocumentViewer}
                      setTravelConfirmationLabour={setTravelConfirmationLabour}
                      setShowTravelConfirmation={setShowTravelConfirmation}
                    />
                  ))
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-[40vh]">
              <p className="text-[#150B3D]/50">
                {requirements.length === 0
                  ? "No accepted requirements found"
                  : "Select a requirement to view job roles"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Timeline Modal */}
      <Modal
        isOpen={!!timelineLabour}
        onClose={handleCloseTimelineModal}
        title={
          timelineLabour ? `${timelineLabour.name}'s Onboarding Timeline` : ""
        }
        size="2xl"
        className="max-w-[95vw] md:max-w-2xl"
      >
        {timelineLabour && (
          <ProgressTracker
            currentStage={timelineLabour.currentStage}
            statuses={Object.fromEntries(
              (timelineLabour.stages || []).map((s) => [s.stage, s.status])
            )}
            userRole="RECRUITMENT_AGENCY"
            onUpload={handleTimelineUpload}
            onAction={handleTimelineAction}
            documents={{
              VISA_PRINTING:
                requirements
                  .flatMap((req) => req.jobRoles)
                  .flatMap((role) => role.LabourAssignment)
                  .find(
                    (assignment) => assignment.labour.id === timelineLabour.id
                  )?.visaUrl || "",
            }}
          />
        )}
      </Modal>

      {/* Update Stage Modal */}
      <UpdateStageModal
        isOpen={showStageForm}
        onClose={handleCloseModal}
        labour={selectedLabour?.profile || ({} as LabourProfile)}
        currentStage={
          selectedLabour?.profile.currentStage || LabourStage.CONTRACT_SIGN
        }
        onUpdate={handleUpdateStage}
      />

      {/* Document Viewer Modal */}
      <TravelDocumentsViewerModal
        isOpen={showDocumentViewer}
        onClose={() => {
          setShowDocumentViewer(false);
          setDocumentViewerLabour(null);
        }}
        labourName={documentViewerLabour?.name || ""}
        existingDocuments={
          documentViewerLabour
            ? (() => {
                const assignment = requirements
                  .flatMap((req) => req.jobRoles)
                  .flatMap((role) => role.LabourAssignment)
                  .find((a) => a.labour.id === documentViewerLabour.id);
                if (!assignment) return [];
                const docs: any[] = [];
                if (assignment.flightTicketUrl)
                  docs.push({
                    id: "flight-ticket-1",
                    name: "Flight Ticket",
                    type: "flight-ticket",
                    url: assignment.flightTicketUrl,
                    uploadedAt: new Date().toISOString(),
                  });
                if (assignment.medicalCertificateUrl)
                  docs.push({
                    id: "medical-certificate-1",
                    name: "Medical Certificate",
                    type: "medical-certificate",
                    url: assignment.medicalCertificateUrl,
                    uploadedAt: new Date().toISOString(),
                  });
                if (assignment.policeClearanceUrl)
                  docs.push({
                    id: "police-clearance-1",
                    name: "Police Clearance",
                    type: "police-clearance",
                    url: assignment.policeClearanceUrl,
                    uploadedAt: new Date().toISOString(),
                  });
                if (assignment.employmentContractUrl)
                  docs.push({
                    id: "employment-contract-1",
                    name: "Employment Contract",
                    type: "employment-contract",
                    url: assignment.employmentContractUrl,
                    uploadedAt: new Date().toISOString(),
                  });
                if (assignment.additionalDocumentsUrls?.length) {
                  assignment.additionalDocumentsUrls.forEach((url, index) =>
                    docs.push({
                      id: `additional-documents-${index + 1}`,
                      name: `Additional Document ${index + 1}`,
                      type: "additional-documents",
                      url,
                      uploadedAt: new Date().toISOString(),
                    })
                  );
                }
                return docs;
              })()
            : []
        }
        visaUrl={
          requirements
            .flatMap((req) => req.jobRoles)
            .flatMap((role) => role.LabourAssignment)
            .find((a) => a.labour.id === documentViewerLabour?.id)?.visaUrl ||
          ""
        }
        existingTravelDate={(() => {
          const assignment = requirements
            .flatMap((req) => req.jobRoles)
            .flatMap((role) => role.LabourAssignment)
            .find((a) => a.labour.id === documentViewerLabour?.id);
          if (!assignment?.travelDate) return "";
          const travelDate = assignment.travelDate;
          if (
            travelDate &&
            typeof travelDate === "object" &&
            "toISOString" in travelDate
          )
            return (travelDate as Date).toISOString();
          if (typeof travelDate === "string") return travelDate;
          return "";
        })()}
      />

      {/* Edit Documents Modal */}
      <EditDocumentsModal
        isOpen={showEditDocuments}
        onClose={() => {
          setShowEditDocuments(false);
          setEditDocumentsLabour(null);
        }}
        labourName={editDocumentsLabour?.name || ""}
        visaUrl={
          requirements
            .flatMap((req) => req.jobRoles)
            .flatMap((role) => role.LabourAssignment)
            .find((a) => a.labour.id === editDocumentsLabour?.id)?.visaUrl || ""
        }
        existingTravelDate={(() => {
          const assignment = requirements
            .flatMap((req) => req.jobRoles)
            .flatMap((role) => role.LabourAssignment)
            .find((a) => a.labour.id === editDocumentsLabour?.id);
          if (!assignment?.travelDate) return "";
          const travelDate = assignment.travelDate;
          if (
            travelDate &&
            typeof travelDate === "object" &&
            "toISOString" in travelDate
          )
            return (travelDate as Date).toISOString().split("T")[0];
          if (typeof travelDate === "string") return travelDate;
          return "";
        })()}
        existingDocuments={
          editDocumentsLabour
            ? (() => {
                const assignment = requirements
                  .flatMap((req) => req.jobRoles)
                  .flatMap((role) => role.LabourAssignment)
                  .find((a) => a.labour.id === editDocumentsLabour.id);
                if (!assignment) return [];
                const docs: any[] = [];
                if (assignment.visaUrl)
                  docs.push({
                    id: "visa-document-1",
                    name: "Visa Document",
                    type: "visa-document",
                    url: assignment.visaUrl,
                    uploadedAt: new Date().toISOString(),
                  });
                if (assignment.signedOfferLetterUrl)
                  docs.push({
                    id: "signed-offer-letter-1",
                    name: "Signed Offer Letter",
                    type: "offer-letter",
                    url: assignment.signedOfferLetterUrl,
                    uploadedAt: new Date().toISOString(),
                  });
                if (assignment.flightTicketUrl)
                  docs.push({
                    id: "flight-ticket-1",
                    name: "Flight Ticket",
                    type: "flight-ticket",
                    url: assignment.flightTicketUrl,
                    uploadedAt: new Date().toISOString(),
                  });
                if (assignment.medicalCertificateUrl)
                  docs.push({
                    id: "medical-certificate-1",
                    name: "Medical Certificate",
                    type: "medical-certificate",
                    url: assignment.medicalCertificateUrl,
                    uploadedAt: new Date().toISOString(),
                  });
                if (assignment.policeClearanceUrl)
                  docs.push({
                    id: "police-clearance-1",
                    name: "Police Clearance",
                    type: "police-clearance",
                    url: assignment.policeClearanceUrl,
                    uploadedAt: new Date().toISOString(),
                  });
                if (assignment.employmentContractUrl)
                  docs.push({
                    id: "employment-contract-1",
                    name: "Employment Contract",
                    type: "employment-contract",
                    url: assignment.employmentContractUrl,
                    uploadedAt: new Date().toISOString(),
                  });
                if (assignment.additionalDocumentsUrls?.length) {
                  assignment.additionalDocumentsUrls.forEach((url, index) =>
                    docs.push({
                      id: `additional-documents-${index + 1}`,
                      name: `Additional Document ${index + 1}`,
                      type: "additional-documents",
                      url,
                      uploadedAt: new Date().toISOString(),
                    })
                  );
                }
                return docs;
              })()
            : []
        }
        onSave={async (data) => {
          try {
            if (!editDocumentsLabour) {
              toast({ type: "error", message: "Labour profile not found" });
              return;
            }
            const assignment = requirements
              .flatMap((req) => req.jobRoles)
              .flatMap((role) => role.LabourAssignment)
              .find((a) => a.labour.id === editDocumentsLabour.id);
            if (!assignment) {
              toast({ type: "error", message: "Assignment not found" });
              return;
            }
            const formData = new FormData();
            if (typeof data.travelDate === "string" && data.travelDate.trim()) {
              formData.append("travelDate", data.travelDate);
            }
            if (data.flightTicket)
              formData.append("flightTicket", data.flightTicket);
            data.documents.forEach((doc) => {
              if (doc.file && doc.type !== "visa-document") {
                switch (doc.type) {
                  case "medical-certificate":
                    formData.append("medicalCertificate", doc.file);
                    break;
                  case "police-clearance":
                    formData.append("policeClearance", doc.file);
                    break;
                  case "employment-contract":
                    formData.append("employmentContract", doc.file);
                    break;
                  case "additional-documents":
                    formData.append("additionalDocuments", doc.file);
                    break;
                }
              }
            });
            const res = await fetch(
              `/api/agencies/assignments/${assignment.id}/travel-documents`,
              { method: "POST", body: formData }
            );
            if (!res.ok) {
              const errorData = await res.json();
              throw new Error(
                errorData.error || "Failed to save travel documents"
              );
            }
            toast({
              type: "success",
              message: "Travel documents saved successfully",
            });

            const updatedRequirements = await fetchRequirements();
            setRequirements(updatedRequirements);

            const updatedLabour = updatedRequirements
              .flatMap((req) => req.jobRoles)
              .flatMap((role) => role.LabourAssignment)
              .find((a) => a.labour.id === editDocumentsLabour.id)?.labour;
            if (updatedLabour) setEditDocumentsLabour(updatedLabour);
          } catch (error) {
            console.error("Error saving travel documents:", error);
            toast({
              type: "error",
              message:
                error instanceof Error
                  ? error.message
                  : "Failed to save travel documents",
            });
          }
        }}
      />

      {/* Travel Confirmation Modal */}
      <TravelConfirmationModal
        isOpen={showTravelConfirmation}
        onClose={() => {
          setShowTravelConfirmation(false);
          setTravelConfirmationLabour(null);
        }}
        onConfirm={handleTravelConfirmation}
        labourName={travelConfirmationLabour?.name || ""}
        currentTravelDate={(() => {
          const assignment = requirements
            .flatMap((req) => req.jobRoles)
            .flatMap((role) => role.LabourAssignment)
            .find((a) => a.labour.id === travelConfirmationLabour?.id);
          if (!assignment?.travelDate) return "";
          const travelDate = assignment.travelDate;
          if (
            travelDate &&
            typeof travelDate === "object" &&
            "toISOString" in travelDate
          )
            return (travelDate as Date).toISOString();
          if (typeof travelDate === "string") return travelDate;
          return "";
        })()}
      />
    </div>
  );
}
