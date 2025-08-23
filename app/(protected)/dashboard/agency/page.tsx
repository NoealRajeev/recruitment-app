"use client";

import ActivityFeed from "@/components/dashboard/ActivityFeed";
import DashboardStats from "@/components/dashboard/DashboardStats";
import { useEffect, useState, useCallback } from "react";
import { useToast } from "@/context/toast-provider";
import { Download } from "lucide-react";
import LabourProfilesTable from "@/components/dashboard/LabourProfilesTable";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

interface DashboardData {
  stats: {
    totalProfiles: number;
    pendingVerification: number;
    approvedProfiles: number;
    deployedProfiles: number;
  };
  recentProfiles: Array<{
    id: string;
    name: string;
    nationality: string;
    age: number;
    gender: string;
    status: string;
    verificationStatus: string;
    profileImage?: string;
    createdAt: Date;
    documents: Array<{ type: string; status: string }>;
  }>;
  recentActivity: Array<{
    id: string;
    action: string;
    description: string;
    performedAt: Date;
    performedBy: { name: string };
  }>;
}

export default function AgencyDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState("comprehensive");
  const [selectedFormat, setSelectedFormat] = useState("pdf");
  const [generatingReport, setGeneratingReport] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/dashboard/agency");
        if (response.ok) {
          const result = await response.json();
          setData(result);
        } else {
          throw new Error("Failed to fetch dashboard data");
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast({ type: "error", message: "Failed to load dashboard data" });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

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
        throw new Error("Failed to generate report");
      }
    } catch (error) {
      console.error("Error generating report:", error);
      toast({ type: "error", message: "Failed to generate report" });
    } finally {
      setGeneratingReport(false);
      setIsReportModalOpen(false);
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
    <div className="pb-6 px-3 sm:px-6 space-y-6">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div />
        <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 sm:gap-4">
          <button
            onClick={() => setIsReportModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors w-full xs:w-auto"
          >
            <Download className="w-5 h-5" />
            <span>Generate Report</span>
          </button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column: Stats + Profiles */}
        <div className="space-y-6 xl:col-span-2">
          <DashboardStats
            stats={{
              totalProfiles: data.stats.totalProfiles,
              pendingVerification: data.stats.pendingVerification,
              approvedProfiles: data.stats.approvedProfiles,
              deployedProfiles: data.stats.deployedProfiles,
            }}
            variant="agency"
            onDownloadReport={handleDownloadReport}
          />
          <LabourProfilesTable profiles={data.recentProfiles} />
        </div>

        {/* Right Column: Activity Feed */}
        <div className="xl:col-span-1">
          <ActivityFeed activities={data.recentActivity} />
        </div>
      </div>

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
          <div className="flex flex-col sm:flex-row gap-2 w-full">
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
        <div className="space-y-4 mb-2">
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
              <option value="profiles">Profile Report</option>
              <option value="deployment">Deployment Report</option>
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
