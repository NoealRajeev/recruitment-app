import React, { useState } from "react";
import {
  UploadCloud,
  Calendar,
  Plane,
  FileText,
  Stethoscope,
  Shield,
  FileCheck,
  X,
  Download,
  Eye,
} from "lucide-react";
import { Modal } from "../ui/Modal";
import { useToast } from "@/context/toast-provider";

interface Document {
  id: string;
  name: string;
  type: string;
  url?: string;
  file?: File;
  uploadedAt?: string;
}

interface EditDocumentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  labourName: string;
  existingDocuments?: Document[];
  visaUrl?: string;
  existingTravelDate?: string;
  onSave: (data: {
    flightTicket: File | null;
    travelDate?: string;
    documents: Document[];
  }) => void;
}

const documentTypes = [
  {
    key: "flight-ticket",
    name: "Flight Ticket",
    icon: Plane,
    required: true,
    description: "Flight booking confirmation and ticket",
  },
  {
    key: "medical-certificate",
    name: "Medical Certificate",
    icon: Stethoscope,
    required: true,
    description: "Medical fitness certificate from authorized clinic",
  },
  {
    key: "police-clearance",
    name: "Police Clearance",
    icon: Shield,
    required: true,
    description: "Police clearance certificate from home country",
  },
  {
    key: "employment-contract",
    name: "Employment Contract",
    icon: FileCheck,
    required: true,
    description: "Signed employment contract",
  },
  {
    key: "visa-document",
    name: "Visa Document",
    icon: FileText,
    required: false,
    description: "Qatar work visa and related documents (uploaded by client)",
  },
  {
    key: "additional-documents",
    name: "Additional Documents",
    icon: FileText,
    required: false,
    description: "Any other required travel documents",
  },
];

const EditDocumentsModal: React.FC<EditDocumentsModalProps> = ({
  isOpen,
  onClose,
  labourName,
  existingDocuments = [],
  visaUrl,
  existingTravelDate,
  onSave,
}) => {
  const [documents, setDocuments] = useState<Document[]>(existingDocuments);
  const { toast } = useToast();
  const [dateInput, setDateInput] = useState("");
  const [timeInput, setTimeInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update documents when existingDocuments changes
  React.useEffect(() => {
    setDocuments(existingDocuments);
  }, [existingDocuments]);

  // Add visa document to state if visaUrl is provided and not already present
  React.useEffect(() => {
    if (visaUrl && !documents.some((doc) => doc.type === "visa-document")) {
      setDocuments((prev) => [
        ...prev,
        {
          id: "visa-document-1",
          name: "Visa Document",
          type: "visa-document",
          url: visaUrl,
          uploadedAt: new Date().toISOString(),
        },
      ]);
    }
  }, [visaUrl]);

  // When modal opens, if no existingTravelDate, reset date/time input
  React.useEffect(() => {
    if (isOpen && !existingTravelDate) {
      setDateInput("");
      setTimeInput("");
    }
  }, [isOpen, existingTravelDate]);

  const handleFileUpload = (type: string, file: File) => {
    const newDocument: Document = {
      id: `${type}-${Date.now()}`,
      name: file.name,
      type,
      file,
      uploadedAt: new Date().toISOString(),
    };
    setDocuments((prev) => {
      // For additional documents, allow multiple files
      if (type === "additional-documents") {
        return [...prev, newDocument];
      }
      // For other documents, remove existing document of the same type
      const filtered = prev.filter((doc) => doc.type !== type);
      return [...filtered, newDocument];
    });
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: string
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(type, file);
    }
  };

  const removeDocument = (documentId: string) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== documentId));
  };

  const getDocumentByType = (type: string) => {
    return documents.find((doc) => doc.type === type);
  };

  const getDocumentsByType = (type: string) => {
    return documents.filter((doc) => doc.type === type);
  };

  const formatDateTime = (isoString: string) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    let formatted = date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
      timeZone: "UTC",
      timeZoneName: "short",
    });
    // Make AM/PM uppercase
    formatted = formatted.replace(/am|pm/, (match) => match.toUpperCase());
    return formatted;
  };

  const handleSubmit = async () => {
    // Validate travel date is required only when a new flight ticket is being uploaded
    const flightTicket = getDocumentByType("flight-ticket");
    const isUploadingNewFlightTicket = flightTicket && flightTicket.file;
    if (isUploadingNewFlightTicket && !(dateInput && timeInput)) {
      toast({
        type: "error",
        message: "Travel date is required when flight ticket is uploaded",
      });
      return;
    }

    let travelDateToSend: string | undefined = undefined;
    if (!existingTravelDate && dateInput && timeInput) {
      // Normalize time to always have seconds
      let normalizedTime = timeInput;
      if (/^\d{2}:\d{2}$/.test(timeInput)) {
        normalizedTime = timeInput + ":00";
      }
      const dateTimeString = `${dateInput}T${normalizedTime}Z`;
      const dateObj = new Date(dateTimeString);
      if (isNaN(dateObj.getTime())) {
        toast({
          type: "error",
          message: "Invalid date or time format. Please check your inputs.",
        });
        return;
      }
      travelDateToSend = dateObj.toISOString();
    }

    setIsSubmitting(true);
    try {
      const flightTicketFile = flightTicket?.file || null;
      await onSave({
        flightTicket: flightTicketFile,
        travelDate: travelDateToSend,
        documents,
      });
      onClose();
    } catch (error) {
      console.error("Error saving documents:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to check if all required docs and travel date are present
  const allRequiredDocsPresent = [
    "flight-ticket",
    "medical-certificate",
    "police-clearance",
    "employment-contract",
  ].every((type) => documents.some((doc) => doc.type === type));
  const travelDatePresent =
    !!existingTravelDate || (!!dateInput && !!timeInput);
  const hasNewAdditionalDoc = documents.some(
    (doc) => doc.type === "additional-documents" && doc.file
  );
  const isUploadingNewFlightTicket = (() => {
    const flightTicket = getDocumentByType("flight-ticket");
    return flightTicket && flightTicket.file;
  })();

  const DocumentCard = ({
    docType,
  }: {
    docType: (typeof documentTypes)[0];
  }) => {
    const document = getDocumentByType(docType.key);
    const IconComponent = docType.icon;

    // Show uploaded documents with beautiful UI (including visa and all other uploaded docs)
    if (
      document &&
      (document.url || document.file) &&
      docType.key !== "additional-documents"
    ) {
      const isVisaDocument = docType.key === "visa-document";
      const isClientUploaded = isVisaDocument && visaUrl;

      return (
        <div
          className={`bg-white border-2 rounded-lg p-4 hover:shadow-md transition-shadow ${"border-green-200"}`}
        >
          <div className="flex items-start gap-3 mb-3">
            <div
              className={`p-2 rounded-lg ${
                document.file ? "bg-orange-50" : "bg-green-50"
              }`}
            >
              <IconComponent
                className={`w-5 h-5 ${
                  document.file ? "text-orange-600" : "text-green-600"
                }`}
              />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">{docType.name}</h3>
              <p className="text-sm text-gray-500">{docType.description}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full font-medium">
                  ✓{" "}
                  {isClientUploaded
                    ? "Uploaded by Client"
                    : document.file
                      ? "New Upload"
                      : "Uploaded by Agency"}
                </span>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div
              className={`flex items-center justify-between p-3 rounded-lg ${
                document.file
                  ? "bg-orange-50 border-2 border-orange-300"
                  : "bg-green-50 border-2 border-green-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <FileText
                  className={`w-4 h-4 ${
                    document.file ? "text-orange-600" : "text-green-600"
                  }`}
                />
                <span className="text-sm font-medium text-green-800">
                  {document.name}
                </span>
                <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                  {isClientUploaded
                    ? "Client Uploaded"
                    : document.file
                      ? "New Upload"
                      : "Agency Uploaded"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {document.url && (
                  <>
                    <button
                      onClick={() => window.open(document.url, "_blank")}
                      className="p-1 text-green-600 hover:text-green-800 transition-colors"
                      title="View document"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        const link = window.document.createElement("a");
                        link.href = document.url!;
                        link.download = document.name;
                        link.click();
                      }}
                      className="p-1 text-green-600 hover:text-green-800 transition-colors"
                      title="Download document"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </>
                )}
                {!isClientUploaded && document.file && (
                  <button
                    onClick={() => removeDocument(document.id)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    title="Remove newly uploaded document (not yet saved)"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            {document.uploadedAt && (
              <p className="text-xs text-gray-500">
                Uploaded: {new Date(document.uploadedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      );
    }
    // Special handling for additional documents (multiple files)
    if (docType.key === "additional-documents") {
      const additionalDocs = getDocumentsByType("additional-documents");
      return (
        <div
          className={`bg-white border-2 rounded-lg p-4 hover:shadow-md transition-shadow ${
            additionalDocs.length > 0 ? "border-green-200" : "border-gray-200"
          }`}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg ${
                  additionalDocs.length > 0 ? "bg-green-50" : "bg-blue-50"
                }`}
              >
                <IconComponent
                  className={`w-5 h-5 ${
                    additionalDocs.length > 0
                      ? "text-green-600"
                      : "text-blue-600"
                  }`}
                />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{docType.name}</h3>
                <p className="text-sm text-gray-500">{docType.description}</p>
                <div className="flex items-center gap-2 mt-1">
                  {docType.required && (
                    <span className="inline-block px-2 py-1 text-xs bg-red-50 text-red-600 rounded">
                      Required
                    </span>
                  )}
                  {additionalDocs.length > 0 && (
                    <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full font-medium">
                      ✓ {additionalDocs.length} Document
                      {additionalDocs.length !== 1 ? "s" : ""}{" "}
                      {additionalDocs.some((doc) => doc.file)
                        ? "New Upload"
                        : "Uploaded by Agency"}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          {additionalDocs.length > 0 ? (
            <div className="space-y-3">
              {additionalDocs.map((doc) => (
                <div
                  key={doc.id}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    doc.file
                      ? "bg-orange-50 border-2 border-orange-300"
                      : "bg-green-50 border-2 border-green-300"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FileText
                      className={`w-4 h-4 ${
                        doc.file ? "text-orange-600" : "text-green-600"
                      }`}
                    />
                    <span className="text-sm font-medium text-green-800">
                      {doc.name}
                    </span>
                    <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                      {doc.file ? "New Upload" : "Agency Uploaded"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {doc.url && (
                      <>
                        <button
                          onClick={() => window.open(doc.url, "_blank")}
                          className="p-1 text-green-600 hover:text-green-800 transition-colors"
                          title="View document"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            const link = window.document.createElement("a");
                            link.href = doc.url!;
                            link.download = doc.name;
                            link.click();
                          }}
                          className="p-1 text-green-600 hover:text-green-800 transition-colors"
                          title="Download document"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    {doc.file && (
                      <button
                        onClick={() => removeDocument(doc.id)}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        title="Remove newly uploaded document (not yet saved)"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  {doc.uploadedAt && (
                    <p className="text-xs text-gray-500 mt-1">
                      Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => handleFileChange(e, docType.key)}
                  className="hidden"
                  id={`file-${docType.key}-additional`}
                />
                <label
                  htmlFor={`file-${docType.key}-additional`}
                  className="cursor-pointer"
                >
                  <UploadCloud className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Add another document</p>
                  <p className="text-xs text-gray-500 mt-1">PDF files only</p>
                </label>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => handleFileChange(e, docType.key)}
                  className="hidden"
                  id={`file-${docType.key}`}
                />
                <label
                  htmlFor={`file-${docType.key}`}
                  className="cursor-pointer"
                >
                  <UploadCloud className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    Click to upload {docType.name.toLowerCase()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">PDF files only</p>
                </label>
              </div>
            </div>
          )}
        </div>
      );
    }
    // Documents that are not uploaded yet: show upload interface
    if (!document || (!document.url && !document.file)) {
      return (
        <div className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <IconComponent className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{docType.name}</h3>
                <p className="text-sm text-gray-500">{docType.description}</p>
                <div className="flex items-center gap-2 mt-1">
                  {docType.required && (
                    <span className="inline-block px-2 py-1 text-xs bg-red-50 text-red-600 rounded">
                      Required
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => handleFileChange(e, docType.key)}
                className="hidden"
                id={`file-${docType.key}`}
              />
              <label htmlFor={`file-${docType.key}`} className="cursor-pointer">
                <UploadCloud className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  Click to upload {docType.name.toLowerCase()}
                </p>
                <p className="text-xs text-gray-500 mt-1">PDF files only</p>
              </label>
            </div>
          </div>
        </div>
      );
    }
    // If document is uploaded and not additional-documents, do not show upload input
    return null;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Travel Documents Management - ${labourName}`}
      size="7xl"
      showFooter
      onConfirm={handleSubmit}
      onCancel={onClose}
      confirmText={isSubmitting ? "Saving..." : "Save Documents"}
      cancelText="Cancel"
      confirmDisabled={
        isSubmitting ||
        (isUploadingNewFlightTicket
          ? !(dateInput && timeInput)
          : getDocumentByType("flight-ticket") && !travelDatePresent) ||
        (!isUploadingNewFlightTicket &&
          allRequiredDocsPresent &&
          travelDatePresent &&
          !hasNewAdditionalDoc)
      }
    >
      <div className="space-y-6 mb-5">
        {/* Document Status Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <div>
              <h4 className="font-medium text-blue-900">
                Travel Documents Status
              </h4>
              <p className="text-sm text-blue-700">
                {visaUrl
                  ? "The visa document has been uploaded by the client and is ready for travel. Upload the remaining required documents to complete the travel preparation process."
                  : "Upload all required travel documents to complete the travel preparation process. The visa document will be uploaded by the client."}
              </p>
            </div>
          </div>
        </div>

        {/* Travel Information Section - Minimalist Card */}
        <div className="bg-white border rounded-xl shadow-sm p-5 flex flex-col gap-2">
          <div className="flex items-center gap-3 mb-1">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span className="text-base font-semibold text-[#150B3D]">
              Travel Information
            </span>
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-3 mt-1">
            <label className="text-sm text-[#150B3D]/80 min-w-[120px] font-medium mb-0 md:mb-0 md:mr-2">
              Travel Date & Time
            </label>
            {existingTravelDate ? (
              <span className="text-base font-semibold text-[#3D1673] bg-gray-50 px-3 py-2 rounded-md border border-gray-200">
                {formatDateTime(existingTravelDate)}
              </span>
            ) : (
              <div className="flex gap-2 items-center w-full md:w-auto">
                <input
                  type="date"
                  value={dateInput}
                  onChange={(e) => setDateInput(e.target.value)}
                  className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 text-sm"
                  required={!!getDocumentByType("flight-ticket")}
                  min={new Date().toISOString().split("T")[0]}
                  style={{ maxWidth: 150 }}
                />
                <input
                  type="time"
                  value={timeInput}
                  onChange={(e) => setTimeInput(e.target.value)}
                  className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 text-sm"
                  required={!!getDocumentByType("flight-ticket")}
                  step="1"
                  style={{ maxWidth: 120 }}
                />
              </div>
            )}
          </div>
          {!existingTravelDate &&
            getDocumentByType("flight-ticket") &&
            (!dateInput || !timeInput) && (
              <p className="text-xs text-red-500 mt-1 ml-[120px]">
                Travel date and time are required when flight ticket is uploaded
              </p>
            )}
        </div>
        {/* Documents Grid */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Required Travel Documents
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documentTypes.map((docType) => (
              <DocumentCard key={docType.key} docType={docType} />
            ))}
          </div>
        </div>
        {/* Summary */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Document Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${getDocumentByType("flight-ticket") ? "bg-green-500" : "bg-red-500"}`}
              ></div>
              <span
                className={
                  getDocumentByType("flight-ticket")
                    ? "text-green-700 font-medium"
                    : "text-gray-600"
                }
              >
                Flight Ticket
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${getDocumentByType("medical-certificate") ? "bg-green-500" : "bg-red-500"}`}
              ></div>
              <span
                className={
                  getDocumentByType("medical-certificate")
                    ? "text-green-700 font-medium"
                    : "text-gray-600"
                }
              >
                Medical Certificate
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${getDocumentByType("police-clearance") ? "bg-green-500" : "bg-red-500"}`}
              ></div>
              <span
                className={
                  getDocumentByType("police-clearance")
                    ? "text-green-700 font-medium"
                    : "text-gray-600"
                }
              >
                Police Clearance
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${getDocumentByType("employment-contract") ? "bg-green-500" : "bg-red-500"}`}
              ></div>
              <span
                className={
                  getDocumentByType("employment-contract")
                    ? "text-green-700 font-medium"
                    : "text-gray-600"
                }
              >
                Employment Contract
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${getDocumentByType("visa-document") ? "bg-green-500" : "bg-blue-500"}`}
              ></div>
              <span
                className={
                  getDocumentByType("visa-document")
                    ? "text-green-700 font-medium"
                    : "text-blue-600"
                }
              >
                Visa Document{" "}
                {getDocumentByType("visa-document") ? "(Client)" : "(Pending)"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${getDocumentsByType("additional-documents").length > 0 ? "bg-green-500" : "bg-gray-400"}`}
              ></div>
              <span
                className={
                  getDocumentsByType("additional-documents").length > 0
                    ? "text-green-700 font-medium"
                    : "text-gray-600"
                }
              >
                Additional Documents (
                {getDocumentsByType("additional-documents").length})
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between mt-3">
            <p className="text-xs text-gray-600">
              Green: Document uploaded | Red: Document missing | Blue: Pending
              client upload |{" "}
              <span className="text-orange-600">
                Orange: New upload (can be deleted)
              </span>
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default EditDocumentsModal;
