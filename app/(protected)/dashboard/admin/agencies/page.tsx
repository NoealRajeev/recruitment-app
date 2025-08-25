"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Image from "next/image";
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
import { Badge, type BadgeProps } from "@/components/ui/Badge";

interface AgencyDocument {
  id: string;
  type: string | null;
  url: string | null;
  status: AccountStatus;
  uploadedAt: string;
  category: DocumentCategory;
}

interface Agency {
  id: string;
  agencyName: string;
  registrationNo: string;
  licenseExpiry: Date | string;
  country: string;
  contactPerson: string;
  phone: string;
  createdAt: Date | string;
  status: AccountStatus;
  user: {
    id: string;
    email: string;
    status: AccountStatus | string | null;
    deleteAt?: Date | string | null;
    deletionType?: string | null;
    profilePicture?: string | null;
  };
  address?: string | null;
  city?: string | null;
  postalCode?: string | null;
  licenseNumber?: string | null;
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

type RowAction = "approve" | "reject" | "delete" | "rereview";

export default function Agencies() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useLanguage();

  // ---------- Safe helpers ----------
  const normalizeStatus = (val: unknown): AccountStatus | "UNKNOWN" => {
    const s = typeof val === "string" ? val : "";
    const all = Object.values(AccountStatus) as string[];
    return all.includes(s) ? (s as AccountStatus) : "UNKNOWN";
  };

  const getStatusColor = useCallback((raw: unknown) => {
    const status = normalizeStatus(raw);
    switch (status) {
      case AccountStatus.REJECTED:
        return "text-[#ED1C24]/70";
      case AccountStatus.NOT_VERIFIED:
        return "text-[#150B3D]/70";
      case AccountStatus.VERIFIED:
        return "text-[#00C853]/70";
      case AccountStatus.SUBMITTED:
        return "text-[#150B3D]/70";
      case AccountStatus.SUSPENDED:
        return "text-[#ED1C24]/70";
      default:
        return "text-[#150B3D]/70";
    }
  }, []);

  const getStatusBadge = (raw: unknown) => {
    const status = normalizeStatus(raw);

    const variantMap: Partial<
      Record<AccountStatus | "UNKNOWN", BadgeProps["variant"]>
    > = {
      [AccountStatus.VERIFIED]: "default",
      [AccountStatus.REJECTED]: "destructive",
      [AccountStatus.NOT_VERIFIED]: "outline",
      [AccountStatus.SUBMITTED]: "outline",
      [AccountStatus.SUSPENDED]: "destructive",
      UNKNOWN: "outline",
    };

    const label = String(status || "UNKNOWN")
      .replace(/_/g, " ")
      .toLowerCase();
    return <Badge variant={variantMap[status] ?? "outline"}>{label}</Badge>;
  };

  // ---------- State ----------
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

  // Per-row loading states so multiple rows can act independently
  const [rowLoading, setRowLoading] = useState<
    Record<string, Partial<Record<RowAction, boolean>>>
  >({});

  const setRowActionLoading = (id: string, action: RowAction, v: boolean) =>
    setRowLoading((prev) => ({
      ...prev,
      [id]: { ...(prev[id] || {}), [action]: v },
    }));

  // Document review modal
  const [selectedAgency, setSelectedAgency] = useState<Agency | null>(null);
  const [agencyDocuments, setAgencyDocuments] = useState<AgencyDocument[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [documentsError, setDocumentsError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [documentStatuses, setDocumentStatuses] = useState<
    Record<string, AccountStatus>
  >({});
  const [isUpdating, setIsUpdating] = useState(false);

  // Delete modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [agencyToDelete, setAgencyToDelete] = useState<Agency | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRecovering, setIsRecovering] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Info modal (card click)
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [infoAgency, setInfoAgency] = useState<Agency | null>(null);

  // prevent state updates after unmount
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // ---------- Utils ----------
  const toDate = (d: string | Date | null | undefined) =>
    d ? new Date(d) : null;

  const isOlderThan12Hours = useCallback((dateLike: Date | string) => {
    const date = toDate(dateLike) || new Date();
    const now = new Date();
    const twelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000);
    return date < twelveHoursAgo;
  }, []);

  const getRemainingTime = useCallback(
    (deleteAt?: Date | string | null): string => {
      const del = toDate(deleteAt ?? null);
      if (!del) return "No deletion scheduled";
      const now = new Date();
      const diffInMs = del.getTime() - now.getTime();
      if (diffInMs <= 0) return "Pending deletion";
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
      const diffInMinutes = Math.floor(
        (diffInMs % (1000 * 60 * 60)) / (1000 * 60)
      );
      return `${diffInHours}h ${diffInMinutes}m remaining`;
    },
    []
  );

  const formatTimeAgo = useCallback((dateLike: Date | string) => {
    const date = toDate(dateLike) || new Date();
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffInSeconds < 60) return `${diffInSeconds} sec ago`;
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} min ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hrs ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  }, []);

  // ---------- Data fetch ----------
  useEffect(() => {
    if (status === "loading") return;

    if (
      status === "unauthenticated" ||
      session?.user.role !== UserRole.RECRUITMENT_ADMIN
    ) {
      router.push("/dashboard");
      return;
    }

    const controller = new AbortController();

    const fetchAgencies = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/agencies", {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Failed to fetch agencies");
        const data: Agency[] = await response.json();
        if (!mountedRef.current) return;
        setAgencies(data);
        logSecurityEvent("AGENCIES_FETCHED", { count: data.length });
      } catch (error) {
        if ((error as any)?.name === "AbortError") return;
        console.error("Error fetching agencies:", error);
        toast({ type: "error", message: "Failed to load agencies" });
        logSecurityEvent("AGENCIES_FETCH_FAILED", {
          error: error instanceof Error ? error.message : "Unknown error",
        });
      } finally {
        if (mountedRef.current) setIsLoading(false);
      }
    };

    fetchAgencies();

    return () => controller.abort();
  }, [status, session, router, toast]);

  // Reset paging when tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  // ---------- Tabs mapping ----------
  const tabToStatus: Record<
    "all" | "pending" | "verified" | "rejected",
    AccountStatus | null
  > = {
    all: null,
    pending: AccountStatus.NOT_VERIFIED,
    verified: AccountStatus.VERIFIED,
    rejected: AccountStatus.REJECTED,
  };

  // ---------- Filter & paginate ----------
  const filteredAgencies = useMemo(() => {
    return agencies.filter((agency) => {
      const statusNorm = normalizeStatus(agency?.user?.status);
      if (
        statusNorm === AccountStatus.VERIFIED &&
        isOlderThan12Hours(agency.createdAt)
      ) {
        return false;
      }
      if (activeTab === "all") return true;
      const wanted = tabToStatus[activeTab];
      return statusNorm === wanted;
    });
  }, [agencies, activeTab, isOlderThan12Hours]);

  const paginatedAgencies = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAgencies.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredAgencies, currentPage]);

  // ---------- Documents ----------
  const fetchAgencyDocuments = async (agencyId: string) => {
    try {
      setDocumentsLoading(true);
      setDocumentsError(null);
      const res = await fetch(`/api/agencies/${agencyId}/documents`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const docs = (await res.json()) as AgencyDocument[];
      if (!Array.isArray(docs)) throw new Error("Invalid documents format");
      setAgencyDocuments(docs);
      const statuses: Record<string, AccountStatus> = {};
      docs.forEach((doc) => (statuses[doc.id] = doc.status));
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
    // While updating, lock selects
    if (isUpdating) return;
    setDocumentStatuses((prev) => ({ ...prev, [docId]: status }));
  };

  const allImportantDocumentsVerified = agencyDocuments.every((doc) => {
    if (doc.category === DocumentCategory.IMPORTANT) {
      return (
        (documentStatuses[doc.id] || doc.status) === AccountStatus.VERIFIED
      );
    }
    return true;
  });

  // ---------- Handlers ----------
  const handleRowClick = async (agency: Agency) => {
    const statusNorm = normalizeStatus(agency.user?.status);
    // disable opening reviewer when another action is loading for this row
    const loadingForRow = rowLoading[agency.id];
    const hasLoading =
      loadingForRow &&
      Object.values(loadingForRow).some((v) => Boolean(v === true));
    if (hasLoading) return;

    if (statusNorm === AccountStatus.NOT_VERIFIED) {
      setSelectedAgency(agency);
      await fetchAgencyDocuments(agency.id);
      setIsModalOpen(true);
      setRejectionReason("");
    }
  };

  const handleRegistrationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegistrationData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegistration = async () => {
    try {
      if (isRegistering) return;
      setIsRegistering(true);
      const response = await fetch("/api/agencies/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registrationData),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Registration failed");
      }
      const newAgency: Agency = await response.json();
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
      toast({ type: "success", message: "Agency registered successfully" });
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
      // set per-row action spinner
      const action: RowAction =
        newStatus === AccountStatus.VERIFIED
          ? "approve"
          : newStatus === AccountStatus.NOT_VERIFIED
            ? "rereview"
            : "reject";

      setRowActionLoading(agencyId, action, true);
      setIsUpdating(true);

      const response = await fetch(`/api/agencies/${agencyId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
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
      if (!response.ok) throw new Error("Failed to update status");
      const updatedAgency: Agency = await response.json();
      setAgencies((prev) =>
        prev.map((a) => (a.id === updatedAgency.id ? updatedAgency : a))
      );
      if (newStatus !== AccountStatus.NOT_VERIFIED) {
        setIsModalOpen(false);
        setSelectedAgency(null);
        setRejectionReason("");
      }
      toast({
        type: "success",
        message: `Agency status updated to ${String(newStatus).toLowerCase()}`,
      });
      logSecurityEvent("AGENCY_STATUS_UPDATED", {
        agencyId,
        newStatus,
        reason: reason || "No reason provided",
      });
    } catch (error) {
      console.error("Status update error:", error);
      toast({ type: "error", message: "Failed to update agency status" });
      logSecurityEvent("AGENCY_STATUS_UPDATE_FAILED", {
        agencyId,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsUpdating(false);
      setRowActionLoading(agencyId, "approve", false);
      setRowActionLoading(agencyId, "reject", false);
      setRowActionLoading(agencyId, "rereview", false);
    }
  };

  const handleImmediateDelete = async (agencyId: string) => {
    try {
      setIsDeleting(true);
      setRowActionLoading(agencyId, "delete", true);

      const response = await fetch(
        `/api/agencies/${agencyId}/delete-immediate`,
        { method: "DELETE" }
      );
      if (!response.ok) throw new Error("Failed to delete account");
      const { id, user } = await response.json();
      setAgencies((prev) =>
        prev.map((a) =>
          a.id === id ? { ...a, user: { ...a.user, ...user } } : a
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
    } finally {
      setIsDeleting(false);
      setRowActionLoading(agencyId, "delete", false);
    }
  };

  const handleRecoverAccount = async (agencyId: string) => {
    try {
      setIsRecovering(true);
      const response = await fetch(`/api/agencies/${agencyId}/recover`, {
        method: "PUT",
      });
      if (!response.ok) throw new Error("Failed to recover account");
      const updatedAgency: Agency = await response.json();
      setAgencies((prev) =>
        prev.map((a) => (a.id === updatedAgency.id ? updatedAgency : a))
      );
      toast({ type: "success", message: "Account recovery successful" });
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
    } finally {
      setIsRecovering(false);
    }
  };

  const openInfoModal = (agency: Agency) => {
    setInfoAgency(agency);
    setIsInfoModalOpen(true);
  };

  // ---------- Loading ----------
  if (status === "loading" || isLoading) {
    return (
      <div className="px-6 flex justify-center items-center min-h-screen bg-[#F8F6FB]">
        <div
          className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3D1673]"
          aria-label="Loading..."
          aria-busy="true"
        />
      </div>
    );
  }

  // ---------- Render ----------
  return (
    <div className="px-4 sm:px-6 space-y-6" aria-busy={isLoading}>
      {/* Top Section - Registration and Verification */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center space-x-3 mb-4">
            <div className="h-[1.5rem] w-[2px] bg-[#635372]/37 rounded-full" />
            <h2 className="text-lg sm:text-xl font-semibold text-[#2C0053]">
              Registration
            </h2>
          </div>

          {/* Registration Card */}
          <Card className="p-4 sm:p-6 bg-[#EDDDF3]">
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
                disabled={isRegistering}
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
                disabled={isRegistering}
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
                disabled={isRegistering}
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
                disabled={isRegistering}
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
                disabled={isRegistering}
              />

              {/* Phone with country code — responsive */}
              <div className="space-y-1">
                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2">
                  <label
                    htmlFor="phone"
                    className="sm:col-span-4 text-sm font-medium text-gray-700"
                  >
                    Phone Number :<span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="sm:col-span-8">
                    <div className="flex border rounded-md overflow-hidden">
                      <select
                        name="countryCode"
                        value={registrationData.countryCode}
                        onChange={(e) =>
                          setRegistrationData((prev) => ({
                            ...prev,
                            countryCode: e.target.value,
                          }))
                        }
                        className="px-3 py-2 text-sm text-gray-700 outline-none disabled:opacity-60"
                        required
                        aria-required="true"
                        disabled={isRegistering}
                      >
                        {COUNTRY_CODES.map((cc) => (
                          <option key={cc.code} value={cc.code}>
                            {cc.code} ({cc.name})
                          </option>
                        ))}
                      </select>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={registrationData.phone}
                        onChange={handleRegistrationChange}
                        placeholder="Enter phone number"
                        className="flex-1 px-3 py-2 text-sm outline-none disabled:opacity-60"
                        required
                        aria-required="true"
                        disabled={isRegistering}
                      />
                    </div>
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
                disabled={isRegistering}
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
                disabled={isRegistering}
              />
              <HorizontalSelect
                label="Country :"
                name="country"
                value={registrationData.country}
                onChange={(e) =>
                  setRegistrationData((prev) => ({
                    ...prev,
                    country: e.target.value,
                  }))
                }
                options={
                  t.nationalityOptions?.map((nat) => ({
                    value: nat,
                    label: nat,
                  })) ?? []
                }
                required
                aria-required="true"
                disabled={isRegistering}
              />
              <Input
                variant="horizontal"
                label="Postal Code :"
                name="postalCode"
                value={registrationData.postalCode}
                onChange={handleRegistrationChange}
                placeholder="Enter postal code"
                disabled={isRegistering}
              />

              <div className="flex justify-center mt-2">
                <Button
                  onClick={handleRegistration}
                  disabled={isRegistering}
                  className="w-full sm:w-1/2 bg-[#3D1673] hover:bg-[#2b0e54] text-white py-2 px-4 rounded-md disabled:opacity-60 disabled:cursor-not-allowed"
                  aria-label="Register agency"
                  aria-busy={isRegistering}
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
        </div>

        {/* Verification column */}
        <div>
          <div className="flex items-center space-x-3 mb-4">
            <div className="h-[1.5rem] w-[2px] bg-[#635372]/37 rounded-full" />
            <h2 className="text-lg sm:text-xl font-semibold text-[#2C0053]">
              Verification
            </h2>
          </div>

          <Card className="p-4 sm:p-6 bg-[#EDDDF3]">
            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mb-4" role="tablist">
              <Button
                variant={activeTab === "all" ? "default" : "outline"}
                onClick={() => setActiveTab("all")}
                role="tab"
                aria-selected={activeTab === "all"}
                disabled={isLoading}
              >
                All
              </Button>
              <Button
                variant={activeTab === "pending" ? "default" : "outline"}
                onClick={() => setActiveTab("pending")}
                role="tab"
                aria-selected={activeTab === "pending"}
                disabled={isLoading}
              >
                Pending
              </Button>
              <Button
                variant={activeTab === "verified" ? "default" : "outline"}
                onClick={() => setActiveTab("verified")}
                role="tab"
                aria-selected={activeTab === "verified"}
                disabled={isLoading}
              >
                Verified
              </Button>
              <Button
                variant={activeTab === "rejected" ? "default" : "outline"}
                onClick={() => setActiveTab("rejected")}
                role="tab"
                aria-selected={activeTab === "rejected"}
                disabled={isLoading}
              >
                Rejected
              </Button>
            </div>

            {/* Desktop table */}
            <div className="overflow-x-auto hidden md:block">
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
                  {paginatedAgencies.map((agency) => {
                    const statusNorm = normalizeStatus(agency?.user?.status);
                    const loading = rowLoading[agency.id] || {};
                    const commonDisable =
                      Boolean(
                        loading.approve ||
                          loading.reject ||
                          loading.delete ||
                          loading.rereview
                      ) ||
                      isUpdating ||
                      isDeleting ||
                      isRecovering;

                    return (
                      <tr
                        key={agency.id}
                        className={`hover:bg-blue-25 ${statusNorm === AccountStatus.NOT_VERIFIED ? "cursor-pointer hover:bg-[#EDDDF3]" : ""}`}
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
                          className={`py-2 px-3 text-sm font-medium ${getStatusColor(statusNorm)}`}
                        >
                          {getStatusBadge(statusNorm)}
                        </td>
                        <td className="py-2 px-3 text-sm text-[#150B3D]/70 space-x-2">
                          {statusNorm === AccountStatus.NOT_VERIFIED && (
                            <>
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (commonDisable) return;
                                  handleStatusUpdate(
                                    agency.id,
                                    AccountStatus.VERIFIED
                                  );
                                }}
                                aria-label={`Approve ${agency.agencyName}`}
                                disabled={commonDisable}
                                aria-busy={Boolean(loading.approve)}
                              >
                                {loading.approve ? (
                                  <svg
                                    className="animate-spin -ml-1 mr-2 h-4 w-4"
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
                                ) : null}
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (commonDisable) return;
                                  setSelectedAgency(agency);
                                  setIsModalOpen(true);
                                }}
                                aria-label={`Reject ${agency.agencyName}`}
                                disabled={commonDisable}
                                aria-busy={Boolean(loading.reject)}
                              >
                                {loading.reject ? (
                                  <svg
                                    className="animate-spin -ml-1 mr-2 h-4 w-4"
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
                                ) : null}
                                Reject
                              </Button>
                            </>
                          )}

                          {(statusNorm === AccountStatus.REJECTED ||
                            statusNorm === AccountStatus.NOT_VERIFIED ||
                            statusNorm === AccountStatus.VERIFIED) && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (commonDisable) return;
                                setAgencyToDelete(agency);
                                setIsDeleteModalOpen(true);
                              }}
                              className="text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Delete account"
                              aria-label={`Delete ${agency.agencyName}`}
                              disabled={commonDisable}
                            >
                              {loading.delete ? (
                                <svg
                                  className="animate-spin h-4 w-4"
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
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                  />
                                </svg>
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </button>
                          )}

                          {statusNorm === AccountStatus.REJECTED && (
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (commonDisable) return;
                                handleStatusUpdate(
                                  agency.id,
                                  AccountStatus.NOT_VERIFIED
                                );
                              }}
                              aria-label={`Re-review ${agency.agencyName}`}
                              disabled={commonDisable}
                              aria-busy={Boolean(loading.rereview)}
                            >
                              {loading.rereview ? (
                                <svg
                                  className="animate-spin -ml-1 mr-2 h-4 w-4"
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
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                  />
                                </svg>
                              ) : null}
                              Re-review
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filteredAgencies.length > ITEMS_PER_PAGE && (
                <div className="mt-4 flex justify-center">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={Math.ceil(
                      filteredAgencies.length / ITEMS_PER_PAGE
                    )}
                    onPageChange={(page) => {
                      if (isUpdating || isDeleting) return;
                      setCurrentPage(page);
                    }}
                  />
                </div>
              )}
            </div>

            {/* Mobile list (cards per row) */}
            <div className="md:hidden space-y-3">
              {paginatedAgencies.map((agency) => {
                const statusNorm = normalizeStatus(agency?.user?.status);
                const loading = rowLoading[agency.id] || {};
                const commonDisable =
                  Boolean(
                    loading.approve ||
                      loading.reject ||
                      loading.delete ||
                      loading.rereview
                  ) ||
                  isUpdating ||
                  isDeleting ||
                  isRecovering;

                return (
                  <div
                    key={agency.id}
                    className="rounded-lg bg-white p-3 shadow hover:bg-[#f7f0fb] transition"
                    onClick={() => handleRowClick(agency)}
                    aria-busy={commonDisable}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative h-10 w-10 rounded-full overflow-hidden bg-gray-100">
                        <Image
                          src={
                            agency.user.profilePicture ||
                            "/assets/avatar-placeholder.png"
                          }
                          alt={agency.agencyName}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium text-sm truncate">
                            {agency.agencyName}
                          </p>
                          <span className="shrink-0">
                            {getStatusBadge(statusNorm)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 truncate">
                          {agency.user.email}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {statusNorm === AccountStatus.REJECTED &&
                          agency.user.deleteAt
                            ? getRemainingTime(agency.user.deleteAt)
                            : formatTimeAgo(agency.createdAt)}
                        </p>
                        <div className="flex gap-2 mt-3">
                          {statusNorm === AccountStatus.NOT_VERIFIED && (
                            <>
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (commonDisable) return;
                                  handleStatusUpdate(
                                    agency.id,
                                    AccountStatus.VERIFIED
                                  );
                                }}
                                disabled={commonDisable}
                              >
                                {loading.approve ? (
                                  <svg
                                    className="animate-spin -ml-1 mr-2 h-4 w-4"
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
                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                    />
                                  </svg>
                                ) : null}
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (commonDisable) return;
                                  setSelectedAgency(agency);
                                  setIsModalOpen(true);
                                }}
                                disabled={commonDisable}
                              >
                                {loading.reject ? (
                                  <svg
                                    className="animate-spin -ml-1 mr-2 h-4 w-4"
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
                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                    />
                                  </svg>
                                ) : null}
                                Reject
                              </Button>
                            </>
                          )}
                          {(statusNorm === AccountStatus.REJECTED ||
                            statusNorm === AccountStatus.NOT_VERIFIED ||
                            statusNorm === AccountStatus.VERIFIED) && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (commonDisable) return;
                                setAgencyToDelete(agency);
                                setIsDeleteModalOpen(true);
                              }}
                              disabled={commonDisable}
                            >
                              {loading.delete ? (
                                <svg
                                  className="animate-spin h-4 w-4 mr-1"
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
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                  />
                                </svg>
                              ) : (
                                <Trash2 className="h-4 w-4 mr-1" />
                              )}
                              Delete
                            </Button>
                          )}
                          {statusNorm === AccountStatus.REJECTED && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (commonDisable) return;
                                handleStatusUpdate(
                                  agency.id,
                                  AccountStatus.NOT_VERIFIED
                                );
                              }}
                              disabled={commonDisable}
                            >
                              {loading.rereview ? (
                                <svg
                                  className="animate-spin -ml-1 mr-2 h-4 w-4"
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
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                  />
                                </svg>
                              ) : null}
                              Re-review
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredAgencies.length > ITEMS_PER_PAGE && (
                <div className="mt-3 flex justify-center">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={Math.ceil(
                      filteredAgencies.length / ITEMS_PER_PAGE
                    )}
                    onPageChange={(page) => {
                      if (isUpdating || isDeleting) return;
                      setCurrentPage(page);
                    }}
                  />
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Agencies cards grid */}
      <div className="mt-4">
        <h2 className="text-lg sm:text-xl font-semibold mb-3">Agencies</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {agencies
            .filter((agency) => {
              const statusNorm = normalizeStatus(agency?.user?.status);
              return (
                statusNorm === AccountStatus.VERIFIED ||
                statusNorm === AccountStatus.REJECTED
              );
            })
            .map((agency) => {
              const loading = rowLoading[agency.id] || {};
              const commonDisable =
                Boolean(
                  loading.approve ||
                    loading.reject ||
                    loading.delete ||
                    loading.rereview
                ) ||
                isUpdating ||
                isDeleting ||
                isRecovering;

              return (
                <div key={agency.id} className="relative">
                  <AgencyCardContent
                    key={agency.id}
                    agencyName={agency.agencyName}
                    location={`${agency.country} • ${agency.registrationNo}`}
                    logoUrl={agency.user.profilePicture ?? undefined}
                    email={agency.user.email}
                    registerNo={agency.registrationNo}
                    time={
                      normalizeStatus(agency.user.status) ===
                        AccountStatus.REJECTED && agency.user.deleteAt
                        ? getRemainingTime(agency.user.deleteAt)
                        : formatTimeAgo(agency.createdAt)
                    }
                    onClick={() => !commonDisable && openInfoModal(agency)}
                    onEdit={() =>
                      !commonDisable &&
                      router.push(`/dashboard/admin/agencies/${agency.id}/edit`)
                    }
                    onOpenDocs={async () => {
                      if (commonDisable) return;
                      setSelectedAgency(agency);
                      await fetchAgencyDocuments(agency.id);
                      setIsModalOpen(true);
                    }}
                    onDelete={() => {
                      if (commonDisable) return;
                      setAgencyToDelete(agency);
                      setIsDeleteModalOpen(true);
                    }}
                    aria-label={`View details for ${agency.agencyName}`}
                  />

                  {/* Status indicator */}
                  <div className="absolute bottom-3 left-2 right-2 flex justify-between items-start pointer-events-none">
                    {normalizeStatus(agency.user.status) ===
                      AccountStatus.REJECTED && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Rejected
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* =========================== Modals =========================== */}

      {/* Document Reviewer Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          if (isUpdating) return; // prevent closing while updating
          setIsModalOpen(false);
          setSelectedAgency(null);
          setRejectionReason("");
        }}
        title={`Review Documents - ${selectedAgency ? selectedAgency.agencyName : ""}`}
        size="5xl"
        showFooter
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
                disabled={isUpdating}
                aria-disabled={isUpdating}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
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
                {isUpdating ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4"
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
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Processing...
                  </>
                ) : (
                  "Reject"
                )}
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
                {isUpdating ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4"
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
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Processing...
                  </>
                ) : (
                  "Approve"
                )}
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
                    {toDate(selectedAgency.licenseExpiry)?.toLocaleDateString()}
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

            {/* Documents Section */}
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
                      const rawUrl = doc?.url ?? "";
                      const absoluteUrl = rawUrl
                        ? rawUrl.startsWith("http")
                          ? rawUrl
                          : `${window.location.origin}${rawUrl}`
                        : "";
                      const isImage = /\.(png|jpg|jpeg|gif|webp)$/i.test(
                        rawUrl
                      );
                      const isPdf = /\.pdf$/i.test(rawUrl);
                      const fileName =
                        (rawUrl && rawUrl.split("/").pop()) || "document";
                      const currentStatus =
                        documentStatuses[doc.id] || doc.status;
                      const isImportant =
                        doc.category === DocumentCategory.IMPORTANT;

                      return (
                        <div
                          key={doc.id}
                          className={`border rounded-lg p-4 space-y-2 ${isImportant ? "border-l-4 border-blue-500" : ""}`}
                        >
                          <div className="flex justify-between items-center">
                            <h4 className="font-medium capitalize">
                              {String(doc?.type ?? "document")
                                .toLowerCase()
                                .replace(/_/g, " ")}
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
                                className={`text-sm border rounded px-2 py-1 ${isImportant ? "font-semibold" : ""}`}
                                disabled={isUpdating}
                              >
                                <option value="NOT_VERIFIED">
                                  Not Verified
                                </option>
                                <option value="VERIFIED">Verified</option>
                                <option value="REJECTED">Rejected</option>
                              </select>
                            </div>

                            <div className="border rounded-md p-2 h-64 flex flex-col bg-white">
                              <div className="flex-1 overflow-hidden flex items-center justify-center">
                                {isImage && absoluteUrl ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={absoluteUrl}
                                    alt={String(doc?.type ?? "document")}
                                    className="max-w-full max-h-full object-contain"
                                  />
                                ) : isPdf && absoluteUrl ? (
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
                                {absoluteUrl && (
                                  <a
                                    href={absoluteUrl}
                                    download={fileName}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline text-sm"
                                  >
                                    Download
                                  </a>
                                )}
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
          if (isDeleting) return; // lock while deleting
          setIsDeleteModalOpen(false);
          setAgencyToDelete(null);
        }}
        title={`Delete Account - ${agencyToDelete?.agencyName || ""}`}
        size="md"
        showFooter
        footerContent={
          <div className="flex flex-col sm:flex-row sm:justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
              aria-label="Cancel deletion"
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={() => {
                if (agencyToDelete) handleImmediateDelete(agencyToDelete.id);
              }}
              aria-label="Confirm deletion"
              disabled={isDeleting}
              aria-busy={isDeleting}
            >
              {isDeleting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4"
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
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Deleting…
                </>
              ) : (
                "Delete Account (1h window)"
              )}
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
          <div className="mt-4 flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                agencyToDelete && handleRecoverAccount(agencyToDelete.id)
              }
              aria-label="Recover account"
              disabled={isRecovering || isDeleting}
            >
              {isRecovering ? (
                <svg
                  className="animate-spin h-4 w-4 mr-2"
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
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              ) : (
                <Undo2 className="h-4 w-4 mr-2" />
              )}
              {isRecovering ? "Recovering…" : "Recover Account"}
            </Button>
            <span className="text-sm text-gray-500">
              Scheduled for deletion
            </span>
          </div>
        )}
      </Modal>

      {/* Info Modal (card click) */}
      <Modal
        isOpen={isInfoModalOpen}
        onClose={() => {
          setIsInfoModalOpen(false);
          setInfoAgency(null);
        }}
        title={
          infoAgency
            ? `Agency Details — ${infoAgency.agencyName}`
            : "Agency Details"
        }
        size="3xl"
        showFooter
        footerContent={
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setIsInfoModalOpen(false)}>
              Close
            </Button>
          </div>
        }
      >
        {infoAgency && (
          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-4">
              {infoAgency.user.profilePicture ? (
                <Image
                  src={infoAgency.user.profilePicture}
                  alt={infoAgency.agencyName}
                  width={56}
                  height={56}
                  className="h-14 w-14 rounded-xl object-cover border border-[#2C0053]/15 bg-white"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-base font-bold text-gray-500">
                    {(infoAgency.agencyName || "?").charAt(0).toUpperCase()}
                  </span>
                </div>
              )}

              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-lg font-semibold text-[#2C0053] m-0">
                    {infoAgency.agencyName}
                  </h3>
                  {getStatusBadge(infoAgency.user.status)}
                </div>
                <p className="text-sm text-[#150B3D]/70">
                  Registered: {toDate(infoAgency.createdAt)?.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#EFEBF2] rounded-lg p-4">
              <div>
                <p className="text-xs text-[#70528A]">Registration No</p>
                <p className="text-sm text-[#150B3D]">
                  {infoAgency.registrationNo || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#70528A]">License Expiry</p>
                <p className="text-sm text-[#150B3D]">
                  {infoAgency.licenseExpiry
                    ? toDate(infoAgency.licenseExpiry)?.toLocaleDateString()
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#70528A]">Country</p>
                <p className="text-sm text-[#150B3D]">
                  {infoAgency.country || "—"}
                </p>
              </div>
              {infoAgency.licenseNumber ? (
                <div>
                  <p className="text-xs text-[#70528A]">License Number</p>
                  <p className="text-sm text-[#150B3D]">
                    {infoAgency.licenseNumber}
                  </p>
                </div>
              ) : null}
              <div className="sm:col-span-2 h-[1px] bg-[#2C0053]/15 my-1" />
              <div>
                <p className="text-xs text-[#70528A]">Contact Person</p>
                <p className="text-sm text-[#150B3D]">
                  {infoAgency.contactPerson || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#70528A]">Email</p>
                <p className="text-sm text-[#150B3D]">
                  {infoAgency.user.email}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#70528A]">Phone</p>
                <p className="text-sm text-[#150B3D]">
                  {infoAgency.phone || "—"}
                </p>
              </div>
              {infoAgency.address ? (
                <div>
                  <p className="text-xs text-[#70528A]">Address</p>
                  <p className="text-sm text-[#150B3D]">{infoAgency.address}</p>
                </div>
              ) : null}
              {infoAgency.city ? (
                <div>
                  <p className="text-xs text-[#70528A]">City</p>
                  <p className="text-sm text-[#150B3D]">{infoAgency.city}</p>
                </div>
              ) : null}
              {infoAgency.postalCode ? (
                <div>
                  <p className="text-xs text-[#70528A]">Postal Code</p>
                  <p className="text-sm text-[#150B3D]">
                    {infoAgency.postalCode}
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
