/* eslint-disable @typescript-eslint/no-unused-expressions */
import React from "react";
import {
  CheckCircle,
  XCircle,
  UploadCloud,
  AlertTriangle,
  Eye,
  Download,
} from "lucide-react";

// Define the onboarding steps in order
export const ONBOARDING_STEPS = [
  {
    key: "OFFER_LETTER_SIGN",
    label: "Offer Letter Sign",
    owner: "Agency",
    action: "Upload Signed Offer",
  },
  {
    key: "VISA_APPLYING",
    label: "Visa Applying",
    owner: "Client",
    action: "Mark as Applied",
  },
  {
    key: "QVC_PAYMENT",
    label: "QVC Payment",
    owner: "Client",
    action: "Mark as Paid",
  },
  {
    key: "CONTRACT_SIGN",
    label: "Contract Sign",
    owner: "Agency",
    action: "Mark as Signed",
  },
  {
    key: "MEDICAL_STATUS",
    label: "Medical Status",
    owner: "Agency",
    action: "Mark as Fit",
  },
  {
    key: "FINGERPRINT",
    label: "Fingerprint",
    owner: "Agency",
    action: "Mark as Passed",
  },
  {
    key: "VISA_PRINTING",
    label: "Visa Printing",
    owner: "Client",
    action: "Upload Visa",
  },
  {
    key: "READY_TO_TRAVEL",
    label: "Ready to Travel",
    owner: "Agency",
    action: "",
  },
  {
    key: "TRAVEL_CONFIRMATION",
    label: "Travel Confirmation",
    owner: "Agency",
    action: "Confirm Travel",
  },
  {
    key: "ARRIVAL_CONFIRMATION",
    label: "Arrival Confirmation",
    owner: "Client",
    action: "Confirm Arrival",
  },
  { key: "DEPLOYED", label: "Deployed", owner: "System", action: "" },
] as const;

type StepKey = (typeof ONBOARDING_STEPS)[number]["key"];

interface ProgressTrackerProps {
  currentStage: string; // LabourStage
  statuses: Record<string, string>; // { [stageKey]: statusValue }
  userRole: "CLIENT_ADMIN" | "RECRUITMENT_AGENCY" | "RECRUITMENT_ADMIN";
  onAction?: (stageKey: string) => void;
  onUpload?: (stageKey: string, file: File) => void;
  replacementNeeded?: boolean;
  documents?: Record<string, string>; // { [stageKey]: documentUrl }
}

const failedStatuses = ["REFUSED", "UNFIT", "FAILED", "CANCELED", "REJECTED"];
const uploadSteps: StepKey[] = ["VISA_PRINTING"];
const completedStatuses = [
  "COMPLETED",
  "PAID",
  "FIT",
  "PASSED",
  "FILLED",
  "TRAVELED",
  "ARRIVED",
  "VISA_PRINTED",
  "VERIFIED",
];

const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  currentStage,
  statuses,
  userRole,
  onAction,
  onUpload,
  replacementNeeded,
  documents,
}) => {
  const currentIndex = ONBOARDING_STEPS.findIndex(
    (step) => step.key === currentStage
  );
  const hasFailed = Object.entries(statuses).some(([, status]) =>
    failedStatuses.includes(status?.toUpperCase?.())
  );

  return (
    <div className="flex flex-col gap-4 w-full mb-8">
      {replacementNeeded || hasFailed ? (
        <div className="flex items-center gap-2 bg-red-100 border border-red-400 text-red-700 rounded p-2 mb-2">
          <AlertTriangle className="w-5 h-5" />
          <span>
            Replacement Needed: Candidate was refused, unfit, failed, canceled,
            or rejected.
          </span>
        </div>
      ) : null}

      {ONBOARDING_STEPS.map((step, idx) => {
        const isActive = idx === currentIndex;
        const isCompleted = idx < currentIndex;
        const rawStatus = statuses[step.key] ?? "PENDING";
        const status = rawStatus.toUpperCase?.() || "PENDING";
        const isFailed = failedStatuses.includes(status);
        const isCompletedStatus = completedStatuses.includes(status);

        const isOwner =
          (userRole === "CLIENT_ADMIN" && step.owner === "Client") ||
          (userRole === "RECRUITMENT_AGENCY" && step.owner === "Agency");

        const showAction =
          isActive &&
          isOwner &&
          !isFailed &&
          !hasFailed &&
          !isCompletedStatus &&
          status !== "SIGNED" &&
          step.key !== "READY_TO_TRAVEL";

        const showUpload =
          showAction && uploadSteps.includes(step.key as StepKey);
        const showOfferLetterUpload =
          showAction &&
          step.key === "OFFER_LETTER_SIGN" &&
          userRole === "RECRUITMENT_AGENCY";
        const showOfferLetterVerify =
          step.key === "OFFER_LETTER_SIGN" &&
          status === "SIGNED" &&
          userRole === "CLIENT_ADMIN";
        const showContractActions =
          step.key === "CONTRACT_SIGN" &&
          status === "PENDING" &&
          userRole === "RECRUITMENT_AGENCY" &&
          currentStage === "CONTRACT_SIGN";
        const showMedicalActions =
          step.key === "MEDICAL_STATUS" &&
          status === "PENDING" &&
          userRole === "RECRUITMENT_AGENCY" &&
          currentStage === "MEDICAL_STATUS";
        const showFingerprintActions =
          step.key === "FINGERPRINT" &&
          status === "PENDING" &&
          userRole === "RECRUITMENT_AGENCY" &&
          currentStage === "FINGERPRINT";
        const showTravelConfirmationActions =
          step.key === "TRAVEL_CONFIRMATION" &&
          (status === "PENDING" || status === "RESCHEDULED") &&
          userRole === "RECRUITMENT_AGENCY" &&
          currentStage === "TRAVEL_CONFIRMATION";
        const showArrivalConfirmationActions =
          step.key === "ARRIVAL_CONFIRMATION" &&
          status === "PENDING" &&
          userRole === "CLIENT_ADMIN" &&
          currentStage === "ARRIVAL_CONFIRMATION";

        const showVisaUpload =
          step.key === "VISA_PRINTING" &&
          status === "PENDING" &&
          userRole === "CLIENT_ADMIN" &&
          !documents?.[step.key] &&
          currentStage === "VISA_PRINTING";

        const showVisaDocument =
          step.key === "VISA_PRINTING" && !!documents?.[step.key];

        return (
          <div
            key={step.key}
            className={`flex flex-col md:flex-row items-start md:items-center gap-3 p-3 rounded-lg border transition-colors relative ${
              isFailed
                ? "bg-red-50 border-red-400"
                : showVisaDocument
                  ? "bg-green-50 border-green-400"
                  : isCompletedStatus
                    ? "bg-green-50 border-green-400"
                    : status === "UPLOADED" ||
                        status === "VERIFIED" ||
                        status === "SIGNED"
                      ? "bg-blue-50 border-blue-400"
                      : isActive
                        ? "bg-purple-100 border-purple-500"
                        : isCompleted
                          ? "bg-green-50 border-green-400"
                          : "bg-gray-50 border-gray-200"
            }`}
          >
            <div className="flex flex-col min-w-[120px]">
              <span className="font-semibold text-sm">{step.label}</span>
              <span className="text-xs text-gray-500">{step.owner}</span>
            </div>

            <div className="flex-1 flex items-center gap-2">
              {(isCompleted || isCompletedStatus) && !isFailed && (
                <CheckCircle className="w-4 h-4 text-green-500" />
              )}
              {isFailed && <XCircle className="w-4 h-4 text-red-500" />}
              {status &&
                ["UPLOADED", "VERIFIED", "SIGNED"].includes(status) &&
                !isFailed &&
                !isCompletedStatus && (
                  <CheckCircle className="w-4 h-4 text-blue-500" />
                )}
              <span
                className={`text-xs font-medium ${
                  isFailed
                    ? "text-red-600"
                    : showVisaDocument
                      ? "text-green-600"
                      : isCompletedStatus
                        ? "text-green-600"
                        : ["UPLOADED", "VERIFIED", "SIGNED"].includes(status)
                          ? "text-blue-600"
                          : isCompleted
                            ? "text-green-600"
                            : isActive
                              ? "text-purple-700"
                              : "text-gray-500"
                }`}
              >
                {showVisaDocument
                  ? "Visa Available"
                  : status.replaceAll("_", " ").toLowerCase()}
              </span>
            </div>

            {(showAction ||
              showOfferLetterVerify ||
              showContractActions ||
              showMedicalActions ||
              showFingerprintActions ||
              showTravelConfirmationActions ||
              showArrivalConfirmationActions ||
              showVisaUpload) && (
              <div className="flex items-center gap-2">
                {showUpload && step.key !== "VISA_PRINTING" ? (
                  <label className="flex items-center gap-1 cursor-pointer text-xs px-2 py-1 bg-blue-100 border border-blue-300 rounded hover:bg-blue-200">
                    <UploadCloud className="w-4 h-4" />
                    Upload
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) onUpload?.(step.key, f);
                      }}
                    />
                  </label>
                ) : showVisaUpload ? (
                  <label className="flex items-center gap-1 cursor-pointer text-xs px-2 py-1 bg-blue-100 border border-blue-300 rounded hover:bg-blue-200">
                    <UploadCloud className="w-4 h-4" />
                    Upload Visa
                    <input
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) onUpload?.(step.key, f);
                      }}
                    />
                  </label>
                ) : showOfferLetterUpload ? (
                  <label className="flex items-center gap-1 cursor-pointer text-xs px-2 py-1 bg-blue-100 border border-blue-300 rounded hover:bg-blue-200">
                    <UploadCloud className="w-4 h-4" />
                    Upload Signed Offer
                    <input
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) onUpload?.(step.key, f);
                      }}
                    />
                  </label>
                ) : showOfferLetterVerify ? (
                  <button
                    className="px-3 py-1 bg-green-600 text-white rounded text-xs shadow hover:bg-green-700"
                    onClick={() => onAction?.(step.key)}
                  >
                    Verify
                  </button>
                ) : showContractActions ? (
                  <div className="flex gap-2">
                    <button
                      className="px-3 py-1 bg-green-600 text-white rounded text-xs shadow hover:bg-green-700"
                      onClick={() => onAction?.(`${step.key}_APPROVE`)}
                    >
                      Approve
                    </button>
                    <button
                      className="px-3 py-1 bg-red-600 text-white rounded text-xs shadow hover:bg-red-700"
                      onClick={() => onAction?.(`${step.key}_REFUSE`)}
                    >
                      Refuse
                    </button>
                  </div>
                ) : showMedicalActions ? (
                  <div className="flex gap-2">
                    <button
                      className="px-3 py-1 bg-green-600 text-white rounded text-xs shadow hover:bg-green-700"
                      onClick={() => onAction?.(`${step.key}_FIT`)}
                    >
                      Fit
                    </button>
                    <button
                      className="px-3 py-1 bg-red-600 text-white rounded text-xs shadow hover:bg-red-700"
                      onClick={() => onAction?.(`${step.key}_UNFIT`)}
                    >
                      Unfit
                    </button>
                  </div>
                ) : showFingerprintActions ? (
                  <div className="flex gap-2">
                    <button
                      className="px-3 py-1 bg-green-600 text-white rounded text-xs shadow hover:bg-green-700"
                      onClick={() => onAction?.(`${step.key}_PASS`)}
                    >
                      Pass
                    </button>
                    <button
                      className="px-3 py-1 bg-red-600 text-white rounded text-xs shadow hover:bg-red-700"
                      onClick={() => onAction?.(`${step.key}_FAIL`)}
                    >
                      Fail
                    </button>
                  </div>
                ) : showTravelConfirmationActions ? (
                  <button
                    className="px-3 py-1 bg-purple-600 text-white rounded text-xs shadow hover:bg-purple-700"
                    onClick={() => onAction?.(`${step.key}_MODAL`)}
                  >
                    Update Travel Status
                  </button>
                ) : showArrivalConfirmationActions ? (
                  <button
                    className="px-3 py-1 bg-green-600 text-white rounded text-xs shadow hover:bg-green-700"
                    onClick={() => onAction?.(`${step.key}_MODAL`)}
                  >
                    Confirm Labour Arrived
                  </button>
                ) : (
                  step.action && (
                    <button
                      className="px-3 py-1 bg-purple-600 text-white rounded text-xs shadow hover:bg-purple-700"
                      onClick={() => onAction?.(step.key)}
                    >
                      {step.action}
                    </button>
                  )
                )}

                {/* Generic view/download for non-visa uploaded docs */}
                {documents?.[step.key] && step.key !== "VISA_PRINTING" && (
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <a
                      href={documents[step.key]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto px-3 py-2 bg-blue-600 text-white rounded text-xs shadow hover:bg-blue-700 flex items-center justify-center sm:justify-start gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      <span className="whitespace-nowrap">View</span>
                    </a>
                    <a
                      href={documents[step.key]}
                      download
                      className="w-full sm:w-auto px-3 py-2 bg-green-600 text-white rounded text-xs shadow hover:bg-green-700 flex items-center justify-center sm:justify-start gap-1"
                    >
                      <Download className="w-3 h-3" />
                      <span className="whitespace-nowrap">Download</span>
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Visa doc controls */}
            {showVisaDocument && (
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <a
                  href={documents![step.key]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-3 py-2 bg-blue-600 text-white rounded text-xs shadow hover:bg-blue-700 flex items-center justify-center sm:justify-start gap-1"
                >
                  <Eye className="w-3 h-3" />
                  <span className="whitespace-nowrap">View Visa</span>
                </a>
                <a
                  href={documents![step.key]}
                  download
                  className="w-full sm:w-auto px-3 py-2 bg-green-600 text-white rounded text-xs shadow hover:bg-green-700 flex items-center justify-center sm:justify-start gap-1"
                >
                  <Download className="w-3 h-3" />
                  <span className="whitespace-nowrap">Download Visa</span>
                </a>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ProgressTracker;
