"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Info, ArrowLeft, ArrowRight } from "lucide-react";
import { useToast } from "@/context/toast-provider";
import { updateCompanyStatus } from "@/lib/api/client";
import CompanyCardContent from "@/components/shared/Cards/CompanyCardContent";
import { ClientDocument, ClientWithUser } from "@/types";
import { Modal } from "@/components/ui/Modal";
import { DocumentViewer } from "@/components/shared/DocumentViewer";
import { Button } from "@/components/ui/Button";

export default function Company() {
  const [pendingIndex, setPendingIndex] = useState(0);
  const [verifiedIndex, setVerifiedIndex] = useState(0);
  const [pendingCompanies, setPendingCompanies] = useState<ClientWithUser[]>(
    []
  );
  const [verifiedCompanies, setVerifiedCompanies] = useState<ClientWithUser[]>(
    []
  );
  const [submittedCompanies, setSubmittedCompanies] = useState<
    ClientWithUser[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState<ClientWithUser | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [companyDocuments, setCompanyDocuments] = useState<ClientDocument[]>(
    []
  );
  const router = useRouter();
  const { toast } = useToast();

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const [pendingRes, verifiedRes, submittedRes] = await Promise.all([
        fetch("/api/clients?status=PENDING_REVIEW"),
        fetch("/api/clients?status=VERIFIED"),
        fetch("/api/clients?status=SUBMITTED"),
      ]);

      if (!pendingRes.ok || !verifiedRes.ok || !submittedRes.ok) {
        throw new Error("Failed to fetch companies");
      }

      const [pendingData, verifiedData, submittedData] = await Promise.all([
        pendingRes.json(),
        verifiedRes.json(),
        submittedRes.json(),
      ]);

      setPendingCompanies(pendingData);
      setVerifiedCompanies(verifiedData);
      setSubmittedCompanies(submittedData);
    } catch (error) {
      console.error("Error fetching companies:", error);
      toast({
        type: "error",
        message: "Failed to load companies. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanyDocuments = async (companyId: string) => {
    try {
      const response = await fetch(`/api/clients/${companyId}/documents`);
      if (!response.ok) {
        throw new Error("Failed to fetch documents");
      }
      const documents = await response.json();
      setCompanyDocuments(documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      toast({
        type: "error",
        message: "Failed to load documents. Please try again.",
      });
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleUpdateStatus = async (
    clientId: string,
    status: "VERIFIED" | "REJECTED" | "PENDING_SUBMISSION"
  ) => {
    try {
      const reason =
        status === "VERIFIED"
          ? "Approved by admin after review"
          : "Rejected by admin after review";

      await updateCompanyStatus(clientId, status, reason, toast);

      // Update local state
      if (status === "VERIFIED") {
        const updatedCompany = pendingCompanies.find((c) => c.id === clientId);
        if (updatedCompany) {
          setVerifiedCompanies((prev) => [
            ...prev,
            {
              ...updatedCompany,
              user: { ...updatedCompany.user, status: "VERIFIED" },
            },
          ]);
        }
      } else if (status === "PENDING_SUBMISSION") {
        const updatedCompany = pendingCompanies.find((c) => c.id === clientId);
        if (updatedCompany) {
          setSubmittedCompanies((prev) => [
            ...prev,
            {
              ...updatedCompany,
              user: { ...updatedCompany.user, status: "SUBMITTED" },
            },
          ]);
        }
      }

      setPendingCompanies((prev) => prev.filter((c) => c.id !== clientId));
      setPendingIndex((prev) =>
        Math.max(0, Math.min(prev, pendingCompanies.length - 3))
      );

      toast({
        type: "success",
        message: `Company ${status.toLowerCase()} successfully`,
      });
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleCompanyClick = async (company: ClientWithUser) => {
    setSelectedCompany(company);
    await fetchCompanyDocuments(company.id);
    setIsModalOpen(true);
  };

  const visibleCompanies = pendingCompanies.slice(
    pendingIndex,
    pendingIndex + 2
  );

  const visibleSubmittedCompanies = submittedCompanies.slice(
    verifiedIndex,
    verifiedIndex + 4
  );

  if (loading) {
    return (
      <div className="px-6 py-8 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3D1673]"></div>
      </div>
    );
  }

  return (
    <div className="px-6 space-y-8">
      {/* Pending Companies */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Pending Review</h2>
        {pendingCompanies.length === 0 ? (
          <p className="text-gray-500">No companies pending review</p>
        ) : (
          <>
            <div className="space-y-4">
              {visibleCompanies.map((company) => (
                <CompanyCard
                  key={company.id}
                  company={company}
                  onStatusUpdate={handleUpdateStatus}
                />
              ))}
            </div>
            <PaginationControls
              currentIndex={pendingIndex}
              totalItems={pendingCompanies.length}
              itemsPerPage={2}
              onPrev={() => setPendingIndex((prev) => Math.max(0, prev - 1))}
              onNext={() =>
                setPendingIndex((prev) =>
                  Math.min(pendingCompanies.length - 2, prev + 1)
                )
              }
            />
          </>
        )}
      </section>

      {/* Submitted Companies (Documents Submitted) */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          Documents Submissions Pending
        </h2>
        {submittedCompanies.length === 0 ? (
          <p className="text-gray-500">No companies with submitted documents</p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {visibleSubmittedCompanies.map((company) => (
                <div
                  key={company.id}
                  onClick={() => handleCompanyClick(company)}
                  className="cursor-pointer"
                >
                  <CompanyCardContent
                    companyName={company.companyName}
                    email={company.user.email}
                    logoUrl={company.image || "/default-company.png"}
                    onClick={() => {}}
                    phoneNo={""}
                    noSub={""}
                  />
                </div>
              ))}
            </div>
            {submittedCompanies.length > 4 && (
              <PaginationControls
                currentIndex={verifiedIndex}
                totalItems={submittedCompanies.length}
                itemsPerPage={4}
                onPrev={() => setVerifiedIndex((prev) => Math.max(0, prev - 1))}
                onNext={() =>
                  setVerifiedIndex((prev) =>
                    Math.min(submittedCompanies.length - 4, prev + 1)
                  )
                }
              />
            )}
          </>
        )}
      </section>

      {/* Verified Companies */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Verified Companies</h2>
        {verifiedCompanies.length === 0 ? (
          <p className="text-gray-500">No verified companies found</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
            {verifiedCompanies.map((company) => (
              <CompanyCardContent
                key={company.id}
                companyName={company.companyName}
                email={company.user.email}
                phoneNo={company.phone || "N/A"}
                noSub={company.requirements?.length.toString() || "0"}
                logoUrl={company.image || "/default-company.png"}
                onClick={() => router.push(`/companies/${company.id}`)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Document Viewer Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCompany(null);
          setCompanyDocuments([]);
        }}
        title={`Review Documents - ${selectedCompany?.companyName || ""}`}
        size="xl"
        showFooter={true}
        footerContent={
          <div className="flex justify-end space-x-4 w-full">
            <div className="flex space-x-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedCompany(null);
                  setCompanyDocuments([]);
                }}
              >
                Close
              </Button>
              {selectedCompany && (
                <Button
                  onClick={() => {
                    handleUpdateStatus(selectedCompany.id, "VERIFIED");
                    setIsModalOpen(false);
                    setCompanyDocuments([]);
                  }}
                >
                  Approve
                </Button>
              )}
            </div>
          </div>
        }
      >
        {companyDocuments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto">
            {companyDocuments.map((doc) => (
              <div key={doc.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium capitalize">
                    {doc.type.toLowerCase().replace("_", " ")}
                  </h3>
                  <span className="text-xs text-gray-500">
                    {new Date(doc.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="mt-2 h-64">
                  <DocumentViewer url={doc.url} type={doc.type} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No documents submitted for review</p>
          </div>
        )}
      </Modal>
    </div>
  );
}

function CompanyCard({
  company,
  onStatusUpdate,
}: {
  company: ClientWithUser;
  onStatusUpdate: (
    id: string,
    status: "PENDING_SUBMISSION" | "REJECTED"
  ) => void;
}) {
  return (
    <div className="flex w-full">
      <div className="bg-[#EDDDF3] p-6 rounded-xl flex flex-col lg:flex-row justify-between gap-6 items-center shadow-md text-[#2C0053] w-full">
        {/* Company Info */}
        <div className="flex items-center gap-5">
          {company.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={company.image}
              alt={company.companyName}
              className="w-16 h-16 object-contain rounded-full"
            />
          ) : (
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-lg font-bold text-gray-500">
                {company.companyName.charAt(0)}
              </span>
            </div>
          )}
          <div>
            <h2 className="text-xl font-bold text-[#524B6B]">
              {company.companyName}
            </h2>
            <p className="text-sm text-[#524B6B]">
              Registration: {company.registrationNo || "N/A"}
            </p>
            <p className="text-sm text-[#524B6B]">
              Sector: {company.companySector || "N/A"}
            </p>
            {company.website && (
              <a
                href={company.website}
                className="text-sm text-blue-600 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Visit Website
              </a>
            )}
          </div>
        </div>

        {/* Contact Info */}
        <div className="text-sm text-[#524B6B]">
          <h3 className="text-lg font-bold mb-2">Contact</h3>
          <p>{company.user.name}</p>
          <p>{company.user.email}</p>
          <p>{company.phone || "N/A"}</p>
        </div>

        {/* Status */}
        <div className="flex flex-col items-center">
          <div className="text-center">
            <Info className="hidden md:inline text-white bg-black/80 rounded-full h-10 w-10 mb-3" />
            <span className="text-red-700 px-3 py-1 text-xs">Pending</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col justify-evenly ml-4">
        <button
          className="bg-[#3D1673] text-white px-4 py-1.5 rounded-md hover:bg-[#2b0e54]"
          onClick={() => onStatusUpdate(company.id, "PENDING_SUBMISSION")}
        >
          Approve
        </button>
        <button
          className="bg-red-600 text-white px-4 py-1.5 rounded-md hover:bg-red-700 mt-2"
          onClick={() => onStatusUpdate(company.id, "REJECTED")}
        >
          Reject
        </button>
      </div>
    </div>
  );
}

function PaginationControls({
  currentIndex,
  totalItems,
  itemsPerPage,
  onPrev,
  onNext,
}: {
  currentIndex: number;
  totalItems: number;
  itemsPerPage: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  const canPrev = currentIndex > 0;
  const canNext = currentIndex + itemsPerPage < totalItems;

  return (
    <div className="flex justify-between items-center mt-4">
      <button
        onClick={onPrev}
        disabled={!canPrev}
        className={`flex items-center gap-1 ${canPrev ? "text-[#3D1673] hover:text-[#2b0e54]" : "text-gray-400 cursor-not-allowed"}`}
      >
        <ArrowLeft className={canPrev ? "" : "opacity-50"} />
        Previous
      </button>
      <span className="text-sm text-gray-600">
        {Math.min(currentIndex + 1, totalItems)}-
        {Math.min(currentIndex + itemsPerPage, totalItems)} of {totalItems}
      </span>
      <button
        onClick={onNext}
        disabled={!canNext}
        className={`flex items-center gap-1 ${canNext ? "text-[#3D1673] hover:text-[#2b0e54]" : "text-gray-400 cursor-not-allowed"}`}
      >
        Next
        <ArrowRight className={canNext ? "" : "opacity-50"} />
      </button>
      More actions
    </div>
  );
}
