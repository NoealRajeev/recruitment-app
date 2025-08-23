import React from "react";
import {
  Calendar,
  Plane,
  FileText,
  Stethoscope,
  Shield,
  FileCheck,
  Download,
  Eye,
} from "lucide-react";
import { Modal } from "../ui/Modal";

interface Document {
  id: string;
  name: string;
  type: string;
  url?: string;
  uploadedAt?: string;
}

interface TravelDocumentsViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  labourName: string;
  existingDocuments?: Document[];
  visaUrl?: string;
  existingTravelDate?: string;
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
] as const;

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
    timeZoneName: "short",
  });
  return formatted.replace(/am|pm/, (m) => m.toUpperCase());
};

const TravelDocumentsViewerModal: React.FC<TravelDocumentsViewerModalProps> = ({
  isOpen,
  onClose,
  labourName,
  existingDocuments = [],
  visaUrl,
  existingTravelDate,
}) => {
  const [documents, setDocuments] =
    React.useState<Document[]>(existingDocuments);

  React.useEffect(() => {
    setDocuments(existingDocuments);
  }, [existingDocuments]);

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
  }, [visaUrl, documents]);

  const getDocumentByType = (type: string) =>
    documents.find((doc) => doc.type === type);
  const getDocumentsByType = (type: string) =>
    documents.filter((doc) => doc.type === type);

  const DocumentCard = ({
    docType,
  }: {
    docType: (typeof documentTypes)[number];
  }) => {
    const document = getDocumentByType(docType.key);
    const IconComponent = docType.icon;

    if (document && document.url && docType.key !== "additional-documents") {
      const isVisaDocument = docType.key === "visa-document";
      const isClientUploaded = isVisaDocument && !!visaUrl;

      return (
        <div className="bg-white border-2 rounded-lg p-4 hover:shadow-md transition-shadow border-green-200">
          <div className="flex items-start gap-3 mb-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <IconComponent className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">{docType.name}</h3>
              <p className="text-sm text-gray-500">{docType.description}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full font-medium">
                  ✓{" "}
                  {isClientUploaded
                    ? "Uploaded by Client"
                    : "Uploaded by Agency"}
                </span>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 border-2 border-green-300 rounded-lg">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">
                  {document.name}
                </span>
                <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                  {isClientUploaded ? "Client Uploaded" : "Agency Uploaded"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.open(document.url!, "_blank")}
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
                className={`${additionalDocs.length > 0 ? "bg-green-50" : "bg-blue-50"} p-2 rounded-lg`}
              >
                <IconComponent
                  className={`w-5 h-5 ${additionalDocs.length > 0 ? "text-green-600" : "text-blue-600"}`}
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
                      {additionalDocs.length !== 1 ? "s" : ""} Uploaded by
                      Agency
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
                  className="flex items-center justify-between p-3 bg-green-50 border-2 border-green-300 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">
                      {doc.name}
                    </span>
                    <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                      Agency Uploaded
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => window.open(doc.url!, "_blank")}
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
                  </div>
                  {doc.uploadedAt && (
                    <p className="text-xs text-gray-500 mt-1">
                      Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500 text-sm">
                No additional documents uploaded
              </p>
            </div>
          )}
        </div>
      );
    }

    if (!document || !document.url) {
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
                {docType.required && (
                  <span className="inline-block mt-1 px-2 py-1 text-xs bg-red-50 text-red-600 rounded">
                    Required
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="text-center py-4">
            <p className="text-gray-500 text-sm">Document not uploaded yet</p>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Travel Documents - ${labourName}`}
      size="7xl"
    >
      <div className="space-y-6 mb-5">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <div>
              <h4 className="font-medium text-blue-900">
                Travel Documents Status
              </h4>
              <p className="text-sm text-blue-700">
                {visaUrl
                  ? "The visa document has been uploaded by the client and is ready for travel. View all uploaded travel documents below."
                  : "View all uploaded travel documents. The visa document will be uploaded by the client."}
              </p>
            </div>
          </div>
        </div>

        {existingTravelDate && (
          <div className="bg-white border rounded-xl shadow-sm p-5 flex flex-col gap-2">
            <div className="flex items-center gap-3 mb-1">
              <Calendar className="w-5 h-5 text-blue-600" />
              <span className="text-base font-semibold text-[#150B3D]">
                Travel Information
              </span>
            </div>
            <div className="flex flex-col md:flex-row md:items-center gap-3 mt-1">
              <label className="text-sm text-[#150B3D]/80 min-w-[120px] font-medium">
                Travel Date & Time
              </label>
              <div className="flex items-center gap-2">
                <span className="text-base font-semibold text-[#3D1673] bg-gray-50 px-3 py-2 rounded-md border border-gray-200">
                  {formatDateTime(existingTravelDate)}
                </span>
                {/* If you track schedule changes, conditionally show this chip */}
                {/* <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full border border-red-200">
                  Flight Rescheduled
                </span> */}
              </div>
            </div>
          </div>
        )}

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Travel Documents
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documentTypes.map((docType) => (
              <DocumentCard key={docType.key} docType={docType} />
            ))}
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Document Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            {[
              ["flight-ticket", "Flight Ticket"],
              ["medical-certificate", "Medical Certificate"],
              ["police-clearance", "Police Clearance"],
              ["employment-contract", "Employment Contract"],
              ["visa-document", "Visa Document"],
            ].map(([key, label]) => (
              <div key={key} className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    key === "visa-document"
                      ? getDocumentByType(key)
                        ? "bg-green-500"
                        : "bg-blue-500"
                      : getDocumentByType(key)
                        ? "bg-green-500"
                        : "bg-red-500"
                  }`}
                />
                <span
                  className={
                    key === "visa-document"
                      ? getDocumentByType(key)
                        ? "text-green-700 font-medium"
                        : "text-blue-600"
                      : getDocumentByType(key)
                        ? "text-green-700 font-medium"
                        : "text-gray-600"
                  }
                >
                  {label}
                  {key === "visa-document" &&
                    (getDocumentByType(key) ? " (Client)" : " (Pending)")}
                </span>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  getDocumentsByType("additional-documents").length > 0
                    ? "bg-green-500"
                    : "bg-gray-400"
                }`}
              />
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
          <div className="mt-3">
            <p className="text-xs text-gray-600">
              Green: Document uploaded | Red: Document missing | Blue: Pending
              client upload
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default TravelDocumentsViewerModal;
