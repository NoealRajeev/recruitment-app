// app/(protected)/dashboard/admin/agencies/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/shared/Card";
import AgencyCardContent from "@/components/shared/Cards/AgencyCardContent";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Trash2 } from "lucide-react";
import { AccountStatus, UserRole } from "@prisma/client";
import { useToast } from "@/context/toast-provider";
import { DocumentViewer } from "@/components/shared/DocumentViewer";

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
  email: string;
  registrationNo: string;
  licenseExpiry: Date;
  country: string;
  contactPerson: string;
  phone: string;
  logoUrl?: string;
  status: AccountStatus;
  user: {
    id: string;
    email: string;
    status: AccountStatus;
    deleteAt?: Date;
  };
  documents?: AgencyDocument[];
}

interface RegistrationFormData {
  agencyName: string;
  registrationNo: string;
  licenseNumber: string;
  licenseExpiry: string;
  country: string;
  contactPerson: string;
  email: string;
  phone: string;
}

export default function Agencies() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [registrationData, setRegistrationData] =
    useState<RegistrationFormData>({
      agencyName: "",
      registrationNo: "",
      licenseNumber: "",
      licenseExpiry: "",
      country: "",
      contactPerson: "",
      email: "",
      phone: "",
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

        // For each agency, fetch documents only if status is PENDING_REVIEW
        const agenciesWithDocuments = await Promise.all(
          data.map(async (agency) => {
            if (agency.user.status === AccountStatus.PENDING_REVIEW) {
              const docsResponse = await fetch(
                `/api/agencies/${agency.id}/documents`
              );
              if (docsResponse.ok) {
                const documents = await docsResponse.json();
                return { ...agency, documents };
              }
            }
            return { ...agency, documents: [] };
          })
        );

        setAgencies(agenciesWithDocuments);
      } catch (error) {
        console.error("Error fetching agencies:", error);
        toast({
          type: "error",
          message: "Failed to load agencies",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgencies();
  }, [status, session, router, toast]);

  const handleRowClick = (agency: Agency) => {
    if (agency.user.status === AccountStatus.PENDING_REVIEW) {
      setSelectedAgency(agency);
      setIsModalOpen(true);
    }
  };

  const handleDeleteAccount = async (agencyId: string) => {
    try {
      const response = await fetch(`/api/agencies/${agencyId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to mark account for deletion");
      }

      const updatedAgency = await response.json();

      setAgencies((prev) =>
        prev.map((agency) =>
          agency.id === updatedAgency.id
            ? { ...agency, user: updatedAgency.user }
            : agency
        )
      );

      setIsDeleteModalOpen(false);
      setAgencyToDelete(null);

      toast({
        type: "success",
        message:
          "Account marked for deletion. It will be removed within 24 hours.",
      });
    } catch (error) {
      console.error("Error deleting account:", error);
      toast({
        type: "error",
        message:
          error instanceof Error ? error.message : "Failed to delete account",
      });
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
        contactPerson: "",
        email: "",
        phone: "",
      });

      toast({
        type: "success",
        message: "Agency registered successfully",
      });
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        type: "error",
        message: error instanceof Error ? error.message : "Registration failed",
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
        body: JSON.stringify({ status: newStatus, reason }),
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
    } catch (error) {
      console.error("Status update error:", error);
      toast({
        type: "error",
        message: "Failed to update agency status",
      });
    }
  };

  const getStatusColor = (status: AccountStatus) => {
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
  };

  // Filter agencies based on active tab
  const filteredAgencies = agencies.filter((agency) => {
    if (activeTab === "all") return true;
    return agency.user.status === (activeTab.toUpperCase() as AccountStatus);
  });

  if (status === "loading" || isLoading) {
    return (
      <div className="px-6 flex justify-center items-center min-h-screen bg-[#F8F6FB]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3D1673]" />
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
            />
            <Input
              variant="horizontal"
              label="Registration Number :"
              name="registrationNo"
              value={registrationData.registrationNo}
              onChange={handleRegistrationChange}
              placeholder="Enter registration number"
              required
            />
            <Input
              variant="horizontal"
              label="License Number :"
              name="licenseNumber"
              value={registrationData.licenseNumber}
              onChange={handleRegistrationChange}
              placeholder="Enter license number"
              required
            />
            <Input
              variant="horizontal"
              label="License Expiry Date :"
              name="licenseExpiry"
              type="date"
              value={registrationData.licenseExpiry}
              onChange={handleRegistrationChange}
              required
            />
            <Input
              variant="horizontal"
              label="Country of Operation :"
              name="country"
              value={registrationData.country}
              onChange={handleRegistrationChange}
              placeholder="Enter country"
              required
            />
            <Input
              variant="horizontal"
              label="Contact Person :"
              name="contactPerson"
              value={registrationData.contactPerson}
              onChange={handleRegistrationChange}
              placeholder="Enter full name"
              required
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
            />
            <Input
              variant="horizontal"
              label="Phone Number :"
              name="phone"
              type="tel"
              value={registrationData.phone}
              onChange={handleRegistrationChange}
              placeholder="Enter phone number"
              required
            />
            <div className="flex justify-center mt-4">
              <Button
                onClick={handleRegistration}
                className="w-1/3 bg-[#3D1673] hover:bg-[#2b0e54] text-white py-2 px-4 rounded-md"
              >
                Register
              </Button>
            </div>
          </div>
        </Card>

        {/* Verification Card */}
        <Card className="p-6 bg-[#EDDDF3]">
          <div className="flex space-x-4 mb-4">
            <Button
              variant={activeTab === "all" ? "default" : "outline"}
              onClick={() => setActiveTab("all")}
            >
              All
            </Button>
            <Button
              variant={activeTab === "pending" ? "default" : "outline"}
              onClick={() => setActiveTab("pending")}
            >
              Pending
            </Button>
            <Button
              variant={activeTab === "verified" ? "default" : "outline"}
              onClick={() => setActiveTab("verified")}
            >
              Verified
            </Button>
            <Button
              variant={activeTab === "rejected" ? "default" : "outline"}
              onClick={() => setActiveTab("rejected")}
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
                {filteredAgencies.map((agency) => (
                  <tr
                    key={agency.id}
                    className={`hover:bg-blue-25 ${
                      agency.user.status === AccountStatus.PENDING_REVIEW
                        ? "cursor-pointer hover:bg-[#EDDDF3]"
                        : ""
                    }`}
                    onClick={() => handleRowClick(agency)}
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
                      {agency.email}
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
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
            />
            <div className="flex space-x-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedAgency(null);
                }}
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
              >
                Reject
              </Button>
            </div>
          </div>
        }
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
        onConfirm={() => {
          if (agencyToDelete) {
            handleDeleteAccount(agencyToDelete.id);
          }
        }}
        confirmText="Delete Account"
        confirmVariant="destructive"
      >
        <p className="text-gray-600">
          Are you sure you want to delete this account? The account will be
          permanently removed after 24 hours.
        </p>
      </Modal>
      {/* Bottom Section - Agency Cards Grid */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-3">Verified Agencies</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {agencies
            .filter((agency) => agency.user.status === AccountStatus.VERIFIED)
            .map((agency) => (
              <div key={agency.id} className="relative">
                <AgencyCardContent
                  agencyName={agency.agencyName}
                  location={`${agency.country} • ${agency.registrationNo}`}
                  logoUrl={agency.logoUrl || "/api/placeholder/48/48"}
                  email={agency.email}
                  registerNo={agency.registrationNo}
                  time={new Date(agency.licenseExpiry).toLocaleDateString()}
                  onClick={() =>
                    router.push(`/dashboard/admin/agencies/${agency.id}`)
                  }
                />
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
