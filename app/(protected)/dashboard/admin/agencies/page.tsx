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
import { Trash2, Undo2, FileIcon } from "lucide-react";
import { AccountStatus, UserRole, DocumentCategory } from "@prisma/client";
import { useToast } from "@/context/toast-provider";
import { PDFViewer } from "@/components/shared/PDFViewer";
import logSecurityEvent from "@/lib/utils/helpers";
import { Pagination } from "@/components/ui/Pagination";
import { useLanguage } from "@/context/LanguageContext";
import { HorizontalSelect } from "@/components/ui/HorizontalSelect";
import { Badge, BadgeProps } from "@/components/ui/Badge";

interface AgencyDocument {
  id: string;
  type: string;
  url: string;
  status: AccountStatus;
  uploadedAt: string;
  category: DocumentCategory;
}

interface Agency {
  id: string;
  agencyName: string;
  registrationNo: string;
  licenseExpiry: Date;
  country: string;
  contactPerson: string;
  phone: string;
  profilePicture?: string;
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
  const [isRegistering, setIsRegistering] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "all" | "pending" | "verified" | "rejected"
  >("all");
  const [selectedAgency, setSelectedAgency] = useState<Agency | null>(null);
  const [agencyDocuments, setAgencyDocuments] = useState<AgencyDocument[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [documentsError, setDocumentsError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [agencyToDelete, setAgencyToDelete] = useState<Agency | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [documentStatuses, setDocumentStatuses] = useState<
    Record<string, AccountStatus>
  >({});
  const [isUpdating, setIsUpdating] = useState(false);

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

  const fetchAgencyDocuments = async (agencyId: string) => {
    try {
      setDocumentsLoading(true);
      setDocumentsError(null);
      const res = await fetch(`/api/agencies/${agencyId}/documents`);

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const docs = await res.json();

      if (!Array.isArray(docs)) {
        throw new Error("Invalid documents format");
      }

      setAgencyDocuments(docs);

      const statuses: Record<string, AccountStatus> = {};
      docs.forEach((doc: AgencyDocument) => {
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

  const handleDocumentStatusChange = (docId: string, status: AccountStatus) => {
    setDocumentStatuses((prev) => ({
      ...prev,
      [docId]: status,
    }));
  };

  // Check if all important documents are verified
  const allImportantDocumentsVerified = agencyDocuments.every((doc) => {
    if (doc.category === DocumentCategory.IMPORTANT) {
      return (
        (documentStatuses[doc.id] || doc.status) === AccountStatus.VERIFIED
      );
    }
    return true;
  });

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
        setAgencies(data);
        logSecurityEvent("AGENCIES_FETCHED", {
          count: data.length,
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

  const handleRowClick = async (agency: Agency) => {
    if (agency.user.status === AccountStatus.NOT_VERIFIED) {
      setSelectedAgency(agency);
      await fetchAgencyDocuments(agency.id);
      setIsModalOpen(true);
      setRejectionReason("");
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
      setIsRegistering(true);
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
    } finally {
      setIsRegistering(false);
    }
  };

  const handleStatusUpdate = async (
    agencyId: string,
    newStatus: AccountStatus,
    reason?: string
  ) => {
    try {
      setIsUpdating(true);
      const response = await fetch(`/api/agencies/${agencyId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
          reason:
            reason ||
            (newStatus === "VERIFIED"
              ? "Approved by admin"
              : "Rejected by admin"),
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

      if (newStatus !== AccountStatus.NOT_VERIFIED) {
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
    } finally {
      setIsUpdating(false);
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
                disabled={isRegistering} // ⇦ NEW
                className="w-1/3 bg-[#3D1673] hover:bg-[#2b0e54]
             text-white py-2 px-4 rounded-md
             disabled:opacity-60 disabled:cursor-not-allowed" // UX tweak
                aria-label="Register agency"
              >
                {isRegistering ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Processing…
                  </>
                ) : (
                  "Register"
                )}
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
                      agency.user.status === AccountStatus.NOT_VERIFIED
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
                      {getStatusBadge(agency.user.status)}
                    </td>
                    <td className="py-2 px-3 text-sm text-[#150B3D]/70 space-x-2">
                      {agency.user.status === AccountStatus.NOT_VERIFIED && (
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
                                AccountStatus.NOT_VERIFIED
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
        title={`Review Documents - ${selectedAgency ? selectedAgency.agencyName : ""}`}
        size="5xl"
        showFooter={true}
        footerContent={
          <div className="w-full">
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Reason for rejection
              </label>
              <textarea
                className="w-full p-2 border rounded min-h-[100px]"
                placeholder="Provide specific reasons for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </div>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                disabled={isUpdating}
              >
                Close
              </Button>
              <Button
                variant="destructive"
                onClick={() =>
                  selectedAgency &&
                  handleStatusUpdate(
                    selectedAgency.id,
                    AccountStatus.REJECTED,
                    rejectionReason
                  )
                }
                disabled={!rejectionReason.trim() || isUpdating}
              >
                {isUpdating ? "Processing..." : "Reject"}
              </Button>
              <Button
                onClick={() =>
                  selectedAgency &&
                  handleStatusUpdate(selectedAgency.id, AccountStatus.VERIFIED)
                }
                disabled={isUpdating || !allImportantDocumentsVerified}
                title={
                  !allImportantDocumentsVerified
                    ? "Verify all important documents first"
                    : ""
                }
              >
                {isUpdating ? "Processing..." : "Approve"}
              </Button>
            </div>
          </div>
        }
      >
        {selectedAgency && (
          <div className="flex flex-col h-full">
            {/* Agency Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Agency Details</h3>
                <div className="space-y-1">
                  <p>
                    <span className="font-medium">Name:</span>{" "}
                    {selectedAgency.agencyName}
                  </p>
                  <p>
                    <span className="font-medium">Registration No:</span>{" "}
                    {selectedAgency.registrationNo}
                  </p>
                  <p>
                    <span className="font-medium">License Expiry:</span>{" "}
                    {new Date(
                      selectedAgency.licenseExpiry
                    ).toLocaleDateString()}
                  </p>
                  <p>
                    <span className="font-medium">Country:</span>{" "}
                    {selectedAgency.country}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Contact Person</h3>
                <div className="space-y-1">
                  <p>
                    <span className="font-medium">Name:</span>{" "}
                    {selectedAgency.contactPerson}
                  </p>
                  <p>
                    <span className="font-medium">Email:</span>{" "}
                    {selectedAgency.user.email}
                  </p>
                  <p>
                    <span className="font-medium">Phone:</span>{" "}
                    {selectedAgency.phone}
                  </p>
                  <p>
                    <span className="font-medium">Status:</span>{" "}
                    {getStatusBadge(selectedAgency.user.status)}
                  </p>
                </div>
              </div>
            </div>

            {/* Documents Section with single scroll */}
            <div className="flex-1 overflow-hidden flex flex-col">
              <h3 className="font-semibold text-lg mb-4">
                Submitted Documents
              </h3>
              {!allImportantDocumentsVerified && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
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
                <div className="flex-1 flex justify-center items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500" />
                </div>
              ) : documentsError ? (
                <div className="flex-1 flex items-center justify-center text-red-500">
                  {documentsError}
                </div>
              ) : agencyDocuments.length > 0 ? (
                <div className="flex-1 overflow-y-auto pr-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
                    {agencyDocuments.map((doc) => {
                      const absoluteUrl = `${window.location.origin}${doc.url}`;
                      const isImage = /\.(png|jpg|jpeg|gif|webp)$/i.test(
                        doc.url
                      );
                      const isPdf = /\.(pdf)$/i.test(doc.url);
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
                              <span className="text-sm font-medium">
                                Status:
                              </span>
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
                                <option value="NOT_VERIFIED">
                                  Not Verified
                                </option>
                                <option value="VERIFIED">Verified</option>
                                <option value="REJECTED">Rejected</option>
                              </select>
                            </div>

                            {/* Document Viewer */}
                            <div className="border rounded-md p-2 h-64 flex flex-col">
                              <div className="flex-1 overflow-hidden flex items-center justify-center">
                                {isImage ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={absoluteUrl}
                                    alt={doc.type}
                                    className="max-w-full max-h-full object-contain"
                                  />
                                ) : isPdf ? (
                                  <div className="w-full h-full">
                                    <PDFViewer url={absoluteUrl} />
                                    <div className="mt-2 text-center">
                                      <a
                                        href={absoluteUrl}
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
                                  href={absoluteUrl}
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
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  No documents submitted.
                </div>
              )}
            </div>
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
                  logoUrl={agency.profilePicture || ""}
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
