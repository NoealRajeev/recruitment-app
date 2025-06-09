"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Info, ArrowLeft, ArrowRight, ListFilter } from "lucide-react";
import { useToast } from "@/context/toast-provider";
import { updateCompanyStatus } from "@/lib/api/client";
import CompanyCardContent from "@/components/shared/Cards/CompanyCardContent";
import { ClientWithUser } from "@/types";

export default function Company() {
  const [pendingIndex, setPendingIndex] = useState(0);
  const [pendingCompanies, setPendingCompanies] = useState<ClientWithUser[]>(
    []
  );
  const [verifiedCompanies, setVerifiedCompanies] = useState<ClientWithUser[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const [pendingRes, verifiedRes] = await Promise.all([
        fetch("/api/clients?status=PENDING_REVIEW"),
        fetch("/api/clients?status=VERIFIED"),
      ]);

      if (!pendingRes.ok || !verifiedRes.ok) {
        throw new Error("Failed to fetch companies");
      }

      const [pendingData, verifiedData] = await Promise.all([
        pendingRes.json(),
        verifiedRes.json(),
      ]);

      setPendingCompanies(pendingData);
      setVerifiedCompanies(verifiedData);
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
      // Error toast is handled in updateCompanyStatus
    }
  };

  const visibleCompanies = pendingCompanies.slice(
    pendingIndex,
    pendingIndex + 2
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
      {/* Header and Filter
      <div className="flex justify-between items-center">
        <ListFilter className="text-[#3D1673] cursor-pointer" />
      </div> */}

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
    </div>
  );
}
