// app/(protected)/dashboard/admin/page.tsx
"use client";

import ActivityFeed from "@/components/dashboard/ActivityFeed";
import ProjectSummary from "@/components/dashboard/ProjectSummary";
import DashboardStats from "@/components/dashboard/DashboardStats";
import { Plus, Download } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { useToast } from "@/context/toast-provider";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

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
  role: string;
  status: string;
  profilePicture?: string;
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState("comprehensive");
  const [selectedFormat, setSelectedFormat] = useState("pdf");
  const [generatingReport, setGeneratingReport] = useState(false);
  const { toast } = useToast();

  const [adminUser, setAdminUser] = useState<AdminUser>({
    id: "",
    name: "",
    email: "",
    role: "",
    status: "",
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
      const response = await fetch("/api/admin/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(adminUser),
      });

      if (response.ok) {
        toast({
          type: "success",
          message: "Admin user created successfully",
        });
        setIsModalOpen(false);
        setAdminUser({
          id: "",
          name: "",
          email: "",
          role: "",
          status: "",
        });
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
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAdminUser((prev) => ({
      ...prev,
      [name]: value,
    }));
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
        onClose={() => setIsModalOpen(false)}
        title="Create New Admin Account"
        size="md"
        showFooter={true}
        onConfirm={handleSubmit}
        confirmText="Create Account"
        onCancel={() => setIsModalOpen(false)}
        cancelText="Cancel"
      >
        <div className="space-y-4">
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
            label="Role"
            name="role"
            value={adminUser.role}
            onChange={handleInputChange}
            placeholder="Enter role"
            required
          />
          <Input
            label="Status"
            name="status"
            value={adminUser.status}
            onChange={handleInputChange}
            placeholder="Enter status"
            required
          />
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
