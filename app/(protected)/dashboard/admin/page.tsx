// app/(protected)/dashboard/admin/page.tsx
"use client";

import ActivityFeed from "@/components/dashboard/ActivityFeed";
import ProjectSummary from "@/components/dashboard/ProjectSummary";
import DashboardStats from "@/components/dashboard/DashboardStats";
import { Plus, Download } from "lucide-react";
import { useEffect, useState, useCallback, useRef } from "react";
import { useToast } from "@/context/toast-provider";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Department } from "@/lib/generated/prisma";
import Image from "next/image";

interface DashboardData {
  stats: {
    totalRequests: number;
    pendingReviews: number;
    clientsRegistered: number;
    agenciesActive: number;
  };
  recentRequirements: [];
  recentActivity: [];
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department?: Department;
  profilePicture?: File | string | null;
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState("comprehensive");
  const [selectedFormat, setSelectedFormat] = useState("pdf");
  const [generatingReport, setGeneratingReport] = useState(false);
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const departmentOptions = [
    { value: "RECRUITMENT", label: "Recruitment" },
    { value: "HR", label: "Human Resources" },
    { value: "OPERATIONS", label: "Operations" },
    { value: "FINANCE", label: "Finance" },
    { value: "COMPLIANCE", label: "Compliance" },
    { value: "BUSINESS_DEVELOPMENT", label: "Business Development" },
    { value: "IT", label: "IT" },
    { value: "MARKETING", label: "Marketing" },
  ];

  const [adminUser, setAdminUser] = useState<AdminUser>({
    id: "",
    name: "",
    email: "",
    phone: "",
    role: "RECRUITMENT_ADMIN",
    department: undefined,
    profilePicture: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/dashboard/admin");
        if (response.ok) {
          const result = await response.json();
          setData(result);
        } else {
          throw new Error("Failed to fetch dashboard data");
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast({
          type: "error",
          message: "Failed to load dashboard data",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const handleSubmit = async () => {
    try {
      setIsCreatingAdmin(true);
      const formData = new FormData();
      formData.append("name", adminUser.name);
      formData.append("email", adminUser.email);
      formData.append("phone", adminUser.phone);
      formData.append("role", adminUser.role);

      if (adminUser.department) {
        formData.append("department", adminUser.department);
      }

      if (adminUser.profilePicture instanceof File) {
        formData.append("profilePicture", adminUser.profilePicture);
      }

      const response = await fetch("/api/admin/register", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        toast({
          type: "success",
          message: "Admin user created successfully",
        });
        setIsModalOpen(false);
        resetAdminForm();
      } else {
        const error = await response.json();
        toast({
          type: "error",
          message: error.error || "Failed to create admin user",
        });
      }
    } catch (error) {
      console.error("Error creating admin user:", error);
      toast({
        type: "error",
        message: "Failed to create admin user",
      });
    } finally {
      setIsCreatingAdmin(false);
    }
  };

  const resetAdminForm = () => {
    setAdminUser({
      id: "",
      name: "",
      email: "",
      phone: "",
      role: "RECRUITMENT_ADMIN",
      department: undefined,
      profilePicture: null,
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAdminUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setAdminUser((prev) => ({
      ...prev,
      department: e.target.value as Department,
    }));
  };

  const handleProfilePictureChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast({
          type: "error",
          message: "File size should be less than 5MB",
        });
        return;
      }
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        toast({
          type: "error",
          message: "Only JPEG, PNG, and WebP images are allowed",
        });
        return;
      }
      setAdminUser((prev) => ({
        ...prev,
        profilePicture: file,
      }));
    }
  };

  const handleRemoveProfilePicture = () => {
    setAdminUser((prev) => ({
      ...prev,
      profilePicture: null,
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDownloadReport = useCallback(async (reportType: string) => {
    setSelectedReportType(reportType);
    setIsReportModalOpen(true);
  }, []);

  const generateReport = useCallback(async () => {
    setGeneratingReport(true);
    try {
      const response = await fetch("/api/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportType: selectedReportType,
          format: selectedFormat,
          filters: {},
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${selectedReportType}-${selectedFormat}-report.${selectedFormat === "pdf" ? "pdf" : "xlsx"}`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        setIsReportModalOpen(false);
      } else {
        const error = await response.json();
        toast({
          type: "error",
          message: error.error || "Failed to generate report",
        });
      }
    } catch (error) {
      console.error("Error generating report:", error);
      toast({
        type: "error",
        message: "Failed to generate report",
      });
    } finally {
      setGeneratingReport(false);
    }
  }, [selectedReportType, selectedFormat, toast]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500">Failed to load dashboard data</p>
      </div>
    );
  }

  return (
    <div className="pb-6 px-6 space-y-6">
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <div />
        {/* Action Buttons */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsReportModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-5 h-5" />
            <span>Generate Report</span>
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-[#2C0053] text-white rounded-lg hover:bg-[#3C006F] transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>New Account</span>
          </button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column: Stats + ProjectSummary */}
        <div className="space-y-6 xl:col-span-2">
          <DashboardStats
            stats={{
              totalRequests: data.stats.totalRequests,
              pendingReviews: data.stats.pendingReviews,
              clientsRegistered: data.stats.clientsRegistered,
              agenciesActive: data.stats.agenciesActive,
            }}
            variant="admin"
            onDownloadReport={handleDownloadReport}
          />
          <ProjectSummary requirements={data.recentRequirements} />
        </div>

        {/* Right Column: Activity Feed */}
        <div className="xl:col-span-1">
          <ActivityFeed activities={data.recentActivity} />
        </div>
      </div>

      {/* New Admin Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetAdminForm();
        }}
        title="Create New Admin Account"
        size="md"
        showFooter={true}
        onConfirm={handleSubmit}
        confirmText={isCreatingAdmin ? "Creating..." : "Create Account"}
        onCancel={() => {
          setIsModalOpen(false);
          resetAdminForm();
        }}
        cancelText="Cancel"
        isConfirmLoading={isCreatingAdmin}
      >
        <div className="space-y-4">
          <div className="flex flex-col items-center">
            {adminUser.profilePicture ? (
              <div className="relative group">
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200">
                  {adminUser.profilePicture instanceof File ? (
                    <Image
                      src={URL.createObjectURL(adminUser.profilePicture)}
                      alt="Profile preview"
                      width={96}
                      height={96}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <Image
                      src={adminUser.profilePicture}
                      alt="Profile"
                      width={96}
                      height={96}
                      className="object-cover w-full h-full"
                    />
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleRemoveProfilePicture}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
            )}
            <label className="mt-2">
              <span className="text-sm text-blue-600 cursor-pointer hover:text-blue-800">
                Upload Photo
              </span>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleProfilePictureChange}
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
              />
            </label>
            <p className="text-xs text-gray-500 mt-1">
              JPEG, PNG or WebP (Max 5MB)
            </p>
          </div>

          <Input
            label="Full Name"
            name="name"
            value={adminUser.name}
            onChange={handleInputChange}
            placeholder="Enter full name"
            required
          />
          <Input
            label="Email"
            name="email"
            type="email"
            value={adminUser.email}
            onChange={handleInputChange}
            placeholder="Enter email address"
            required
          />
          <Input
            label="Phone"
            name="phone"
            type="tel"
            value={adminUser.phone}
            onChange={handleInputChange}
            placeholder="Enter phone number"
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department <span className="text-red-500">*</span>
            </label>
            <select
              name="department"
              value={adminUser.department || ""}
              onChange={handleDepartmentChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            >
              <option value="">Select Department</option>
              {departmentOptions.map((dept) => (
                <option key={dept.value} value={dept.value}>
                  {dept.label}
                </option>
              ))}
            </select>
          </div>
          <input type="hidden" name="role" value={adminUser.role} />
        </div>
      </Modal>

      {/* Report Generation Modal */}
      <Modal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        title="Generate Report"
        size="md"
        showFooter={true}
        onConfirm={generateReport}
        confirmText={generatingReport ? "Generating..." : "Generate Report"}
        onCancel={() => setIsReportModalOpen(false)}
        cancelText="Cancel"
        isConfirmLoading={generatingReport}
        footerContent={
          <div className="flex gap-2 w-full">
            <Button
              type="button"
              className="w-full"
              variant="default"
              disabled={generatingReport}
              onClick={async () => {
                setGeneratingReport(true);
                try {
                  const response = await fetch("/api/reports/generate", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      reportType: selectedReportType,
                      format: selectedFormat,
                      filters: {},
                    }),
                  });
                  if (response.ok) {
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    window.open(url, "_blank");
                  } else {
                    const error = await response.json();
                    toast({
                      type: "error",
                      message: error.error || "Failed to generate report",
                    });
                  }
                } catch (error) {
                  toast({
                    type: "error",
                    message: "Failed to generate report",
                  });
                } finally {
                  setGeneratingReport(false);
                }
              }}
            >
              {generatingReport ? "Opening..." : "View Report"}
            </Button>
            <Button
              type="button"
              className="w-full"
              variant="default"
              disabled={generatingReport}
              onClick={generateReport}
            >
              {generatingReport ? "Generating..." : "Generate Report"}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Report Type
            </label>
            <select
              value={selectedReportType}
              onChange={(e) => setSelectedReportType(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="comprehensive">Comprehensive Report</option>
              <option value="analytics">Analytics Report</option>
              <option value="system">System Overview</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Format
            </label>
            <select
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="pdf">PDF</option>
              <option value="excel">Excel</option>
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
}
