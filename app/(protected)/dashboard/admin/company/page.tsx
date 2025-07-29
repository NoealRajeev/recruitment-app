// app/(protected)/dashboard/admin/company/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/context/toast-provider";
import { updateCompanyStatus } from "@/lib/api/client";
import CompanyCardContent from "@/components/shared/Cards/CompanyCardContent";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { AccountStatus, DocumentCategory } from "@/lib/generated/prisma";
import { Badge, BadgeProps } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PDFViewer } from "@/components/shared/PDFViewer";
import { FileIcon } from "lucide-react";

interface ClientUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  status: AccountStatus;
  profilePicture?: string;
}

interface ClientWithUser {
  id: string;
  companyName: string;
  registrationNo: string | null;
  companySector: string;
  companySize: string;
  website: string | null;
  address: string;
  city: string;
  country: string;
  postalCode: string | null;
  designation: string;
  createdAt: string;
  user: ClientUser;
}

interface ClientDocument {
  id: string;
  type: string;
  url: string;
  status: AccountStatus;
  uploadedAt: string;
  category: DocumentCategory;
}

export default function ClientReviewPage() {
  const { toast } = useToast();
  const [pendingClients, setPendingClients] = useState<ClientWithUser[]>([]);
  const [verifiedClients, setVerifiedClients] = useState<ClientWithUser[]>([]);
  const [selectedClient, setSelectedClient] = useState<ClientWithUser | null>(
    null
  );
  const [clientDocuments, setClientDocuments] = useState<ClientDocument[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [documentsError, setDocumentsError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [documentStatuses, setDocumentStatuses] = useState<
    Record<string, AccountStatus>
  >({});

  const fetchClients = useCallback(async () => {
    try {
      setLoading(true);
      const [pendingRes, verifiedRes] = await Promise.all([
        fetch(`/api/clients?status=NOT_VERIFIED`),
        fetch(`/api/clients?status=VERIFIED`),
      ]);

      if (!pendingRes.ok || !verifiedRes.ok) {
        throw new Error("Failed to load clients");
      }

      const [pendingData, verifiedData] = await Promise.all([
        pendingRes.json(),
        verifiedRes.json(),
      ]);

      setPendingClients(pendingData);
      setVerifiedClients(verifiedData);
    } catch (error) {
      console.error(error);
      toast({ type: "error", message: "Could not fetch clients." });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const fetchClientDocuments = async (clientId: string) => {
    try {
      setDocumentsLoading(true);
      setDocumentsError(null);
      const res = await fetch(`/api/clients/${clientId}/documents`);

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const docs = await res.json();

      if (!Array.isArray(docs)) {
        throw new Error("Invalid documents format");
      }

      setClientDocuments(docs);

      const statuses: Record<string, AccountStatus> = {};
      docs.forEach((doc: ClientDocument) => {
        statuses[doc.id] = doc.status;
      });
      setDocumentStatuses(statuses);
    } catch (error) {
      console.error("Error fetching documents:", error);
      setDocumentsError(
        error instanceof Error ? error.message : "Failed to load documents"
      );
    } finally {
      setDocumentsLoading(false);
    }
  };

  const handleClientClick = (client: ClientWithUser) => {
    setSelectedClient(client);
    fetchClientDocuments(client.id);
    setIsModalOpen(true);
    setShowRejectInput(false);
    setRejectionReason("");
  };

  const handleDocumentStatusChange = (docId: string, status: AccountStatus) => {
    setDocumentStatuses((prev) => ({
      ...prev,
      [docId]: status,
    }));
  };

  // Check if all important documents are verified
  const allImportantDocumentsVerified = clientDocuments.every((doc) => {
    if (doc.category === DocumentCategory.IMPORTANT) {
      return (
        (documentStatuses[doc.id] || doc.status) === AccountStatus.VERIFIED
      );
    }
    return true;
  });

  const handleStatusChange = async (
    status: "VERIFIED" | "REJECTED" | "NOT_VERIFIED"
  ) => {
    if (!selectedClient) return;

    try {
      setIsUpdating(true);
      const reason =
        status === "VERIFIED"
          ? "Approved by admin"
          : rejectionReason || "Rejected by admin";

      // First update individual document statuses if needed
      if (status === "VERIFIED") {
        await Promise.all(
          clientDocuments.map(async (doc) => {
            if (
              doc.category === DocumentCategory.IMPORTANT &&
              (documentStatuses[doc.id] || doc.status) !==
                AccountStatus.VERIFIED
            ) {
              await fetch(`/api/documents/${doc.id}`, {
                method: "PATCH",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  status: "VERIFIED",
                }),
              });
            }
          })
        );
      }

      // Then update the client status
      const res = await updateCompanyStatus(
        selectedClient.id,
        status,
        reason,
        toast
      );

      if (res.ok) {
        toast({ type: "success", message: `Client ${status.toLowerCase()}` });
        setIsModalOpen(false);
        setSelectedClient(null);
        setClientDocuments([]);
        await fetchClients();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (status: AccountStatus) => {
    const variantMap: Record<AccountStatus, BadgeProps["variant"]> = {
      [AccountStatus.VERIFIED]: "default",
      [AccountStatus.REJECTED]: "destructive",
      [AccountStatus.NOT_VERIFIED]: "outline",
      [AccountStatus.SUBMITTED]: "outline",
      [AccountStatus.SUSPENDED]: "destructive",
    };

    return (
      <Badge variant={variantMap[status]}>
        {status.replace("_", " ").toLowerCase()}
      </Badge>
    );
  };

  const getFileExtension = (filename: string) => {
    return filename.split(".").pop()?.toLowerCase() || "";
  };

  if (loading) {
    return (
      <div className="px-6 py-8 space-y-12">
        <Skeleton className="h-8 w-48 mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-32 rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-8 space-y-12">
      {/* Pending Review Section */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Pending Review</h2>
        {pendingClients.length === 0 ? (
          <p className="text-gray-500">No clients pending review.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {pendingClients.map((client) => (
              <div
                key={client.id}
                onClick={() => handleClientClick(client)}
                className="cursor-pointer hover:shadow-md transition-shadow"
              >
                <CompanyCardContent
                  companyName={client.companyName}
                  email={client.user.email}
                  phoneNo={client.user.phone || "N/A"}
                  logoUrl={client.user.profilePicture}
                  noSub={""}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Verified Companies Section */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Verified Companies</h2>
        {verifiedClients.length === 0 ? (
          <p className="text-gray-500">No verified companies found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {verifiedClients.map((client) => (
              <CompanyCardContent
                key={client.id}
                companyName={client.companyName}
                email={client.user.email}
                phoneNo={client.user.phone || "N/A"}
                logoUrl={client.user.profilePicture}
                noSub={""}
              />
            ))}
          </div>
        )}
      </section>

      {/* Review Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedClient(null);
          setClientDocuments([]);
          setShowRejectInput(false);
          setRejectionReason("");
        }}
        title={`Review Client - ${selectedClient?.companyName || ""}`}
        size="5xl"
        showFooter={true}
        footerContent={
          <div className="w-full">
            {showRejectInput && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Reason for rejection
                </label>
                <textarea
                  className="w-full p-2 border rounded min-h-[100px]"
                  placeholder="Provide specific reasons for rejection..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  required
                />
              </div>
            )}
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                disabled={isUpdating}
              >
                Close
              </Button>
              {showRejectInput ? (
                <Button
                  onClick={() => handleStatusChange("REJECTED")}
                  disabled={!rejectionReason.trim() || isUpdating}
                  variant="destructive"
                >
                  {isUpdating ? "Processing..." : "Confirm Rejection"}
                </Button>
              ) : (
                <>
                  <Button
                    variant="destructive"
                    onClick={() => setShowRejectInput(true)}
                    disabled={isUpdating}
                  >
                    Reject
                  </Button>
                  <Button
                    onClick={() => handleStatusChange("VERIFIED")}
                    disabled={isUpdating || !allImportantDocumentsVerified}
                    title={
                      !allImportantDocumentsVerified
                        ? "Verify all important documents first"
                        : ""
                    }
                  >
                    {isUpdating ? "Processing..." : "Approve"}
                  </Button>
                </>
              )}
            </div>
          </div>
        }
      >
        {selectedClient && (
          <div className="space-y-6 max-h-[70vh] overflow-y-auto">
            {/* Client Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Company Details</h3>
                <div className="space-y-1">
                  <p>
                    <span className="font-medium">Name:</span>{" "}
                    {selectedClient.companyName}
                  </p>
                  <p>
                    <span className="font-medium">Registration No:</span>{" "}
                    {selectedClient.registrationNo || "N/A"}
                  </p>
                  <p>
                    <span className="font-medium">Sector:</span>{" "}
                    {selectedClient.companySector}
                  </p>
                  <p>
                    <span className="font-medium">Size:</span>{" "}
                    {selectedClient.companySize}
                  </p>
                  <p>
                    <span className="font-medium">Website:</span>{" "}
                    {selectedClient.website || "N/A"}
                  </p>
                  <p>
                    <span className="font-medium">Address:</span>{" "}
                    {selectedClient.address}, {selectedClient.city},{" "}
                    {selectedClient.country}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Contact Person</h3>
                <div className="space-y-1">
                  <p>
                    <span className="font-medium">Name:</span>{" "}
                    {selectedClient.user.name}
                  </p>
                  <p>
                    <span className="font-medium">Email:</span>{" "}
                    {selectedClient.user.email}
                  </p>
                  <p>
                    <span className="font-medium">Phone:</span>{" "}
                    {selectedClient.user.phone || "N/A"}
                  </p>
                  <p>
                    <span className="font-medium">Designation:</span>{" "}
                    {selectedClient.designation}
                  </p>
                  <p>
                    <span className="font-medium">Status:</span>{" "}
                    {getStatusBadge(selectedClient.user.status)}
                  </p>
                </div>
              </div>
            </div>
            {/* Documents */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Submitted Documents</h3>
              {!allImportantDocumentsVerified && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-yellow-400"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        All <strong>important</strong> documents must be
                        verified before approval.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {documentsLoading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500" />
                </div>
              ) : documentsError ? (
                <div className="text-red-500">{documentsError}</div>
              ) : clientDocuments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {clientDocuments.map((doc) => {
                    const fileExt = getFileExtension(doc.url);
                    const isImage = [
                      "jpg",
                      "jpeg",
                      "png",
                      "gif",
                      "webp",
                    ].includes(fileExt);
                    const isPdf = fileExt === "pdf";
                    const fileName = doc.url.split("/").pop() || "document";

                    const currentStatus =
                      documentStatuses[doc.id] || doc.status;
                    const isImportant =
                      doc.category === DocumentCategory.IMPORTANT;

                    return (
                      <div
                        key={doc.id}
                        className={`border rounded-lg p-4 space-y-2 ${
                          isImportant ? "border-l-4 border-blue-500" : ""
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium capitalize">
                            {doc.type.toLowerCase().replace(/_/g, " ")}
                            {isImportant && (
                              <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                                Important
                              </span>
                            )}
                          </h4>
                        </div>
                        <div className="mt-2">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-sm font-medium">Status:</span>
                            <select
                              value={currentStatus}
                              onChange={(e) =>
                                handleDocumentStatusChange(
                                  doc.id,
                                  e.target.value as AccountStatus
                                )
                              }
                              className={`text-sm border rounded px-2 py-1 ${
                                isImportant ? "font-semibold" : ""
                              }`}
                            >
                              <option value="NOT_VERIFIED">Not Verified</option>
                              <option value="VERIFIED">Verified</option>
                              <option value="REJECTED">Rejected</option>
                            </select>
                          </div>

                          {/* Document Viewer */}
                          <div className="border rounded-md p-2 h-64 flex flex-col">
                            <div className="flex-1 overflow-hidden flex items-center justify-center">
                              {isImage ? (
                                <img
                                  src={`/api/documents/${encodeURIComponent(doc.url)}`}
                                  alt={doc.type}
                                  className="max-w-full max-h-full object-contain"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src =
                                      "/file-error.png";
                                  }}
                                />
                              ) : isPdf ? (
                                <div className="w-full h-full">
                                  <PDFViewer
                                    url={`/api/documents/${encodeURIComponent(doc.url)}`}
                                  />
                                  <div className="mt-2 text-center">
                                    <a
                                      href={`/api/documents/${encodeURIComponent(doc.url)}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:underline text-sm"
                                    >
                                      Open PDF in new tab
                                    </a>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center justify-center h-full">
                                  <FileIcon className="h-12 w-12 text-gray-400" />
                                  <p className="mt-2 text-sm text-gray-500">
                                    Preview not available
                                  </p>
                                </div>
                              )}
                            </div>
                            <div className="mt-2 flex justify-between items-center">
                              <span className="text-xs text-gray-500 truncate">
                                {fileName}
                              </span>
                              <a
                                href={`/api/documents/${encodeURIComponent(doc.url)}`}
                                download={fileName}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline text-sm"
                              >
                                Download
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500">No documents submitted.</p>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
