// app/(protected)/dashboard/admin/agencies/page.tsx
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/shared/Card";
import AgencyCardContent from "@/components/shared/Cards/AgencyCardContent";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Trash2, Undo2 } from "lucide-react";
import { AccountStatus, UserRole } from "@prisma/client";
import { useToast } from "@/context/toast-provider";
import { DocumentViewer } from "@/components/shared/DocumentViewer";
import logSecurityEvent from "@/lib/utils/helpers";
import { Pagination } from "@/components/ui/Pagination";
import { useLanguage } from "@/context/LanguageContext";
import { HorizontalSelect } from "@/components/ui/HorizontalSelect";
interface AgencyDocument {
  id: string;
  type: string;
  url: string;
  verified: boolean;
  createdAt: Date;
}

interface Agency {
  id: string;
  agencyName: string;
  registrationNo: string;
  licenseExpiry: Date;
  country: string;
  contactPerson: string;
  phone: string;
  logoUrl?: string;
  createdAt: Date;
  status: AccountStatus;
  user: {
    id: string;
    email: string;
    status: AccountStatus;
    deleteAt?: Date | null;
    deletionType?: string;
  };
  documents?: AgencyDocument[];
}

interface RegistrationFormData {
  agencyName: string;
  registrationNo: string;
  licenseNumber: string;
  licenseExpiry: string;
  country: string;
  email: string;
  phone: string;
  countryCode: string;
  address: string;
  city: string;
  postalCode: string;
}

// Constants moved to separate file
const COUNTRY_CODES = [
  { code: "+974", name: "Qatar" },
  { code: "+971", name: "UAE" },
  { code: "+966", name: "Saudi Arabia" },
  { code: "+965", name: "Kuwait" },
  { code: "+973", name: "Bahrain" },
  { code: "+968", name: "Oman" },
  { code: "+20", name: "Egypt" },
  { code: "+91", name: "India" },
  { code: "+92", name: "Pakistan" },
  { code: "+94", name: "Sri Lanka" },
  { code: "+880", name: "Bangladesh" },
  { code: "+95", name: "Myanmar" },
  { code: "+977", name: "Nepal" },
] as const;

const ITEMS_PER_PAGE = 10;

export default function Agencies() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useLanguage();

  // State management
  const [registrationData, setRegistrationData] =
    useState<RegistrationFormData>({
      agencyName: "",
      registrationNo: "",
      licenseNumber: "",
      licenseExpiry: "",
      country: "",
      email: "",
      phone: "",
      countryCode: "+974",
      address: "",
      city: "",
      postalCode: "",
    });
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "all" | "pending" | "verified" | "rejected"
  >("all");
  const [selectedAgency, setSelectedAgency] = useState<Agency | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [agencyToDelete, setAgencyToDelete] = useState<Agency | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Memoized utility functions
  const isOlderThan12Hours = useCallback((date: Date) => {
    const now = new Date();
    const twelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000);
    return date < twelveHoursAgo;
  }, []);

  const getRemainingTime = useCallback((deleteAt?: Date): string => {
    if (!deleteAt) return "No deletion scheduled";

    const now = new Date();
    const diffInMs = deleteAt.getTime() - now.getTime();

    if (diffInMs <= 0) return "Pending deletion";

    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInMinutes = Math.floor(
      (diffInMs % (1000 * 60 * 60)) / (1000 * 60)
    );

    return `${diffInHours}h ${diffInMinutes}m remaining`;
  }, []);

  const formatTimeAgo = useCallback((date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds} sec ago`;
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} min ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hrs ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  }, []);

  const getStatusColor = useCallback((status: AccountStatus) => {
    switch (status) {
      case AccountStatus.PENDING_REVIEW:
        return "text-[#C86300]/70";
      case AccountStatus.REJECTED:
        return "text-[#ED1C24]/70";
      case AccountStatus.NOT_VERIFIED:
        return "text-[#150B3D]/70";
      case AccountStatus.VERIFIED:
        return "text-[#00C853]/70";
      default:
        return "text-[#150B3D]/70";
    }
  }, []);

  // Fetch agencies from API
  useEffect(() => {
    if (status === "loading") return;

    // Redirect if not admin
    if (
      status === "unauthenticated" ||
      session?.user.role !== UserRole.RECRUITMENT_ADMIN
    ) {
      router.push("/dashboard");
      return;
    }

    const fetchAgencies = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/agencies");

        if (!response.ok) {
          throw new Error("Failed to fetch agencies");
        }

        const data: Agency[] = await response.json();

        // First normalize ALL data
        const normalizedData = data.map((agency) => ({
          ...agency,
          user: {
            ...agency.user,
            deleteAt: agency.user.deleteAt || null, // Ensure deleteAt exists
          },
          documents: [], // Initialize empty documents array
        }));

        // Then fetch documents for pending agencies using the normalized data
        const agenciesWithDocuments = await Promise.all(
          normalizedData.map(async (agency) => {
            if (agency.user.status === AccountStatus.PENDING_REVIEW) {
              try {
                const docsResponse = await fetch(
                  `/api/agencies/${agency.id}/documents`
                );
                if (docsResponse.ok) {
                  const documents = await docsResponse.json();
                  return { ...agency, documents };
                }
              } catch (error) {
                console.error(
                  `Error fetching documents for agency ${agency.id}:`,
                  error
                );
              }
            }
            return agency; // Return agency as-is (already has empty documents array)
          })
        );

        setAgencies(agenciesWithDocuments);
        logSecurityEvent("AGENCIES_FETCHED", {
          count: agenciesWithDocuments.length,
        });
      } catch (error) {
        console.error("Error fetching agencies:", error);
        toast({
          type: "error",
          message: "Failed to load agencies",
        });
        logSecurityEvent("AGENCIES_FETCH_FAILED", {
          error: error instanceof Error ? error.message : "Unknown error",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgencies();
  }, [status, session, router, toast]);

  // Filtered and paginated agencies
  const filteredAgencies = useMemo(() => {
    return agencies.filter((agency) => {
      if (
        agency.user.status === AccountStatus.VERIFIED &&
        isOlderThan12Hours(new Date(agency.createdAt))
      ) {
        return false;
      }

      if (activeTab === "all") return true;
      return agency.user.status === (activeTab.toUpperCase() as AccountStatus);
    });
  }, [agencies, activeTab, isOlderThan12Hours]);

  const countryOptions = useMemo(
    () =>
      t.nationalityOptions?.map((nat) => ({
        value: nat,
        label: nat,
      })) || [],
    [t.nationalityOptions]
  );

  const paginatedAgencies = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAgencies.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredAgencies, currentPage]);

  // Event handlers
  const handleImmediateDelete = async (agencyId: string) => {
    try {
      const response = await fetch(
        `/api/agencies/${agencyId}/delete-immediate`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) throw new Error("Failed to delete account");

      const { id, user } = await response.json();

      setAgencies((prev) =>
        prev.map((agency) =>
          agency.id === id
            ? {
                ...agency,
                user: {
                  ...agency.user,
                  ...user,
                },
              }
            : agency
        )
      );

      setIsDeleteModalOpen(false);
      toast({
        type: "success",
        message: "Account will be permanently deleted in 1 hour",
      });
      logSecurityEvent("AGENCY_DELETED", {
        agencyId,
        deletionType: "IMMEDIATE",
      });
    } catch (error) {
      console.error("Error deleting account:", error);
      toast({
        type: "error",
        message:
          error instanceof Error ? error.message : "Failed to delete account",
      });
      logSecurityEvent("AGENCY_DELETE_FAILED", {
        agencyId,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  const handleRowClick = (agency: Agency) => {
    if (agency.user.status === AccountStatus.PENDING_REVIEW) {
      setSelectedAgency(agency);
      setIsModalOpen(true);
    }
  };

  const handleRegistrationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegistrationData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRegistration = async () => {
    try {
      const response = await fetch("/api/agencies/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registrationData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Registration failed");
      }

      const newAgency = await response.json();
      setAgencies((prev) => [newAgency, ...prev]);
      setRegistrationData({
        agencyName: "",
        registrationNo: "",
        licenseNumber: "",
        licenseExpiry: "",
        country: "",
        email: "",
        phone: "",
        countryCode: "+974",
        address: "",
        city: "",
        postalCode: "",
      });

      toast({
        type: "success",
        message: "Agency registered successfully",
      });
      logSecurityEvent("AGENCY_REGISTERED", { agencyId: newAgency.id });
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        type: "error",
        message: error instanceof Error ? error.message : "Registration failed",
      });
      logSecurityEvent("AGENCY_REGISTRATION_FAILED", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  const handleStatusUpdate = async (
    agencyId: string,
    newStatus: AccountStatus,
    reason?: string
  ) => {
    try {
      const response = await fetch(`/api/agencies/${agencyId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
          reason,
          deletionType:
            newStatus === AccountStatus.REJECTED ? "SCHEDULED" : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      const updatedAgency = await response.json();
      setAgencies((prev) =>
        prev.map((agency) =>
          agency.id === updatedAgency.id ? updatedAgency : agency
        )
      );

      if (newStatus !== AccountStatus.PENDING_REVIEW) {
        setIsModalOpen(false);
        setSelectedAgency(null);
        setRejectionReason("");
      }

      toast({
        type: "success",
        message: `Agency status updated to ${newStatus.toLowerCase()}`,
      });
      logSecurityEvent("AGENCY_STATUS_UPDATED", {
        agencyId,
        newStatus,
        reason: reason || "No reason provided",
      });
    } catch (error) {
      console.error("Status update error:", error);
      toast({
        type: "error",
        message: "Failed to update agency status",
      });
      logSecurityEvent("AGENCY_STATUS_UPDATE_FAILED", {
        agencyId,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  const handleRecoverAccount = async (agencyId: string) => {
    try {
      const response = await fetch(`/api/agencies/${agencyId}/recover`, {
        method: "PUT",
      });

      if (!response.ok) {
        throw new Error("Failed to recover account");
      }

      const updatedAgency = await response.json();
      setAgencies(
        agencies.map((agency) =>
          agency.id === updatedAgency.id ? updatedAgency : agency
        )
      );

      toast({
        type: "success",
        message: "Account recovery successful",
      });
      logSecurityEvent("AGENCY_RECOVERED", { agencyId });
    } catch (error) {
      console.error("Error recovering account:", error);
      toast({
        type: "error",
        message:
          error instanceof Error ? error.message : "Failed to recover account",
      });
      logSecurityEvent("AGENCY_RECOVERY_FAILED", {
        agencyId,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="px-6 flex justify-center items-center min-h-screen bg-[#F8F6FB]">
        <div
          className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3D1673]"
          aria-label="Loading..."
        />
      </div>
    );
  }

  return (
    <div className="px-6 space-y-6">
      {/* Top Section - Registration and Verification */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-0">
        <div className="flex items-center space-x-3 mb-4">
          <div className="h-[1.5rem] w-[2px] bg-[#635372]/37 rounded-full" />
          <h2 className="text-xl font-semibold text-[#2C0053]">Registration</h2>
        </div>
        <div className="flex items-center space-x-3 mb-4">
          <div className="h-[1.5rem] w-[2px] bg-[#635372]/37 rounded-full" />
          <h2 className="text-xl font-semibold text-[#2C0053]">Verification</h2>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Registration Card */}
        <Card className="p-6 bg-[#EDDDF3]">
          <div className="space-y-4">
            <Input
              variant="horizontal"
              label="Agency Name :"
              name="agencyName"
              value={registrationData.agencyName}
              onChange={handleRegistrationChange}
              placeholder="Enter agency name"
              required
              aria-required="true"
            />
            <Input
              variant="horizontal"
              label="Registration Number :"
              name="registrationNo"
              value={registrationData.registrationNo}
              onChange={handleRegistrationChange}
              placeholder="Enter registration number"
              required
              aria-required="true"
            />
            <Input
              variant="horizontal"
              label="License Number :"
              name="licenseNumber"
              value={registrationData.licenseNumber}
              onChange={handleRegistrationChange}
              placeholder="Enter license number"
              required
              aria-required="true"
            />
            <Input
              variant="horizontal"
              label="License Expiry Date :"
              name="licenseExpiry"
              type="date"
              value={registrationData.licenseExpiry}
              onChange={handleRegistrationChange}
              required
              aria-required="true"
            />
            <Input
              variant="horizontal"
              label="Email Address :"
              name="email"
              type="email"
              value={registrationData.email}
              onChange={handleRegistrationChange}
              placeholder="Enter email address"
              required
              aria-required="true"
            />
            <div className="flex items-center gap-14">
              <label
                htmlFor="phone"
                className="w-1/4 text-sm font-medium text-gray-700"
              >
                Phone Number :<span className="text-red-500 ml-1">*</span>
              </label>

              <div className="flex-1">
                <div className="flex border rounded-md overflow-hidden">
                  {/* Country Code */}
                  <select
                    name="countryCode"
                    value={registrationData.countryCode}
                    onChange={(e) =>
                      setRegistrationData({
                        ...registrationData,
                        countryCode: e.target.value,
                      })
                    }
                    className="px-3 py-2 text-sm text-gray-700 outline-none"
                    required
                    aria-required="true"
                  >
                    {COUNTRY_CODES.map((cc) => (
                      <option key={cc.code} value={cc.code}>
                        {cc.code} ({cc.name})
                      </option>
                    ))}
                  </select>

                  {/* Phone Input */}
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={registrationData.phone}
                    onChange={handleRegistrationChange}
                    placeholder="Enter phone number"
                    className="flex-1 px-3 py-2 text-sm outline-none"
                    required
                    aria-required="true"
                  />
                </div>
              </div>
            </div>
            <Input
              variant="horizontal"
              label="Address :"
              name="address"
              value={registrationData.address}
              onChange={handleRegistrationChange}
              placeholder="Enter full address"
              required
              aria-required="true"
            />
            <Input
              variant="horizontal"
              label="City :"
              name="city"
              value={registrationData.city}
              onChange={handleRegistrationChange}
              placeholder="Enter city"
              required
              aria-required="true"
            />
            <HorizontalSelect
              label="Country :"
              name="country"
              value={registrationData.country}
              onChange={(e) =>
                setRegistrationData({
                  ...registrationData,
                  country: e.target.value,
                })
              }
              options={countryOptions}
              required
              aria-required="true"
            />
            <Input
              variant="horizontal"
              label="Postal Code :"
              name="postalCode"
              value={registrationData.postalCode}
              onChange={handleRegistrationChange}
              placeholder="Enter postal code"
            />
            <div className="flex justify-center mt-4">
              <Button
                onClick={handleRegistration}
                className="w-1/3 bg-[#3D1673] hover:bg-[#2b0e54] text-white py-2 px-4 rounded-md"
                aria-label="Register agency"
              >
                Register
              </Button>
            </div>
          </div>
        </Card>

        {/* Verification Card */}
        <Card className="p-6 bg-[#EDDDF3]">
          <div className="flex space-x-4 mb-4" role="tablist">
            <Button
              variant={activeTab === "all" ? "default" : "outline"}
              onClick={() => setActiveTab("all")}
              role="tab"
              aria-selected={activeTab === "all"}
            >
              All
            </Button>
            <Button
              variant={activeTab === "pending" ? "default" : "outline"}
              onClick={() => setActiveTab("pending")}
              role="tab"
              aria-selected={activeTab === "pending"}
            >
              Pending
            </Button>
            <Button
              variant={activeTab === "verified" ? "default" : "outline"}
              onClick={() => setActiveTab("verified")}
              role="tab"
              aria-selected={activeTab === "verified"}
            >
              Verified
            </Button>
            <Button
              variant={activeTab === "rejected" ? "default" : "outline"}
              onClick={() => setActiveTab("rejected")}
              role="tab"
              aria-selected={activeTab === "rejected"}
            >
              Rejected
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-[#635372]/40">
                  <th className="text-left py-2 px-3 text-sm font-medium text-[#150B3D]">
                    Agency Name
                  </th>
                  <th className="text-left py-2 px-3 text-sm font-medium text-[#150B3D]">
                    Email Address
                  </th>
                  <th className="text-left py-2 px-3 text-sm font-medium text-[#150B3D]">
                    Status
                  </th>
                  <th className="text-left py-2 px-3 text-sm font-medium text-[#150B3D]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-transparent">
                {paginatedAgencies.map((agency) => (
                  <tr
                    key={agency.id}
                    className={`hover:bg-blue-25 ${
                      agency.user.status === AccountStatus.PENDING_REVIEW
                        ? "cursor-pointer hover:bg-[#EDDDF3]"
                        : ""
                    }`}
                    onClick={() => handleRowClick(agency)}
                    aria-label={`Agency ${agency.agencyName}`}
                  >
                    <td className="py-2 px-3 text-sm text-[#150B3D]/70">
                      {agency.agencyName}
                      {agency.user.deleteAt && (
                        <span className="text-xs text-red-500 ml-2">
                          (Deletion Pending)
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-sm text-[#150B3D]/70">
                      {agency.user.email}
                    </td>
                    <td
                      className={`py-2 px-3 text-sm font-medium ${getStatusColor(
                        agency.user.status
                      )}`}
                    >
                      {agency.user.status.toLowerCase().replace("_", " ")}
                    </td>
                    <td className="py-2 px-3 text-sm text-[#150B3D]/70 space-x-2">
                      {agency.user.status === AccountStatus.PENDING_REVIEW && (
                        <>
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusUpdate(
                                agency.id,
                                AccountStatus.VERIFIED
                              );
                            }}
                            aria-label={`Approve ${agency.agencyName}`}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedAgency(agency);
                              setIsModalOpen(true);
                            }}
                            aria-label={`Reject ${agency.agencyName}`}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                      {agency.user.status === AccountStatus.REJECTED && (
                        <>
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusUpdate(
                                agency.id,
                                AccountStatus.PENDING_REVIEW
                              );
                            }}
                            aria-label={`Re-review ${agency.agencyName}`}
                          >
                            Re-review
                          </Button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setAgencyToDelete(agency);
                              setIsDeleteModalOpen(true);
                            }}
                            className="text-red-500 hover:text-red-700"
                            title="Delete account"
                            aria-label={`Delete ${agency.agencyName}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      {agency.user.status === AccountStatus.NOT_VERIFIED && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setAgencyToDelete(agency);
                            setIsDeleteModalOpen(true);
                          }}
                          className="text-red-500 hover:text-red-700"
                          title="Delete account"
                          aria-label={`Delete ${agency.agencyName}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                      {agency.user.status === AccountStatus.VERIFIED && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setAgencyToDelete(agency);
                            setIsDeleteModalOpen(true);
                          }}
                          className="text-red-500 hover:text-red-700"
                          title="Delete account"
                          aria-label={`Delete ${agency.agencyName}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredAgencies.length > ITEMS_PER_PAGE && (
              <div className="mt-4 flex justify-center">
                <Pagination
                  currentPage={currentPage}
                  totalPages={Math.ceil(
                    filteredAgencies.length / ITEMS_PER_PAGE
                  )}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </div>
        </Card>
      </div>
      {/* Document Viewer Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedAgency(null);
          setRejectionReason("");
        }}
        title={`Review Documents - ${selectedAgency?.agencyName || ""}`}
        size="xl"
        showFooter={true}
        footerContent={
          <div className="flex justify-end space-x-4 w-full">
            <Input
              label="Rejection Reason (if rejecting)"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter reason for rejection (optional)"
              className="flex-1"
              aria-label="Rejection reason"
            />
            <div className="flex space-x-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedAgency(null);
                }}
                aria-label="Cancel review"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (selectedAgency) {
                    handleStatusUpdate(
                      selectedAgency.id,
                      AccountStatus.VERIFIED
                    );
                  }
                }}
                aria-label="Approve agency"
              >
                Approve
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (selectedAgency) {
                    handleStatusUpdate(
                      selectedAgency.id,
                      AccountStatus.REJECTED,
                      rejectionReason
                    );
                  }
                }}
                disabled={!rejectionReason}
                aria-label="Reject agency"
              >
                Reject
              </Button>
            </div>
          </div>
        }
        aria-labelledby="document-viewer-modal-title"
      >
        {selectedAgency && (
          <div className="space-y-6">
            {selectedAgency.documents && selectedAgency.documents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto">
                {selectedAgency.documents.map((doc) => (
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
                <p className="text-gray-500">
                  No documents submitted for review
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setAgencyToDelete(null);
        }}
        title={`Delete Account - ${agencyToDelete?.agencyName || ""}`}
        size="md"
        showFooter={true}
        footerContent={
          <div className="flex justify-end space-x-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
              aria-label="Cancel deletion"
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={() => {
                if (agencyToDelete) {
                  handleImmediateDelete(agencyToDelete.id);
                }
              }}
              aria-label="Confirm deletion"
            >
              Delete Account (1h window)
            </Button>
          </div>
        }
        aria-labelledby="delete-confirmation-modal-title"
      >
        <p className="text-gray-600">
          This account will be permanently deleted after 1 hour. You can recover
          it within this window.
        </p>
        {agencyToDelete?.user.deleteAt && (
          <div className="mt-4 flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleRecoverAccount(agencyToDelete.id)}
              aria-label="Recover account"
            >
              <Undo2 className="h-4 w-4 mr-2" />
              Recover Account
            </Button>
            <span className="text-sm text-gray-500">
              Scheduled for deletion
            </span>
          </div>
        )}
      </Modal>
      {/* Bottom Section - Agency Cards Grid */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-3">Agencies</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {agencies
            .filter(
              (agency) =>
                agency.user.status === AccountStatus.VERIFIED ||
                agency.user.status === AccountStatus.REJECTED
            )
            .map((agency) => (
              <div key={agency.id} className="relative">
                <AgencyCardContent
                  agencyName={agency.agencyName}
                  location={`${agency.country} • ${agency.registrationNo}`}
                  logoUrl={agency.logoUrl || "/api/placeholder/48x48"}
                  email={agency.user.email}
                  registerNo={agency.registrationNo}
                  time={
                    agency.user.status === AccountStatus.REJECTED &&
                    agency.user.deleteAt
                      ? getRemainingTime(new Date(agency.user.deleteAt))
                      : formatTimeAgo(new Date(agency.createdAt))
                  }
                  onClick={() =>
                    router.push(`/dashboard/admin/agencies/${agency.id}`)
                  }
                  aria-label={`View details for ${agency.agencyName}`}
                />

                {/* Status indicators container */}
                <div className="absolute bottom-3 left-2 right-2 flex justify-between items-start">
                  {/* Rejected status */}
                  {agency.user.status === AccountStatus.REJECTED && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Rejected
                    </span>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
