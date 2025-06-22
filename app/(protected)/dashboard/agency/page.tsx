// app/(protected)/dashboard/agency/page.tsx
"use client";

import ActivityFeed from "@/components/dashboard/ActivityFeed";
import StatsOverview from "@/components/dashboard/StatsOverview";
import LabourProfilesTable from "@/components/dashboard/LabourProfilesTable";
import { useEffect, useState } from "react";
import { useToast } from "@/context/toast-provider";

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
    status: string;
    verificationStatus: string;
    createdAt: Date;
    documents: Array<{
      type: string;
      status: string;
    }>;
  }>;
  recentActivity: Array<{
    id: string;
    action: string;
    description: string;
    performedAt: Date;
    performedBy: {
      name: string;
    };
  }>;
}

export default function AgencyDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
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
        {/* Overview Title with Vertical Line */}
        <div className="flex items-center space-x-3">
          <div className="h-[1.75rem] w-[3px] bg-[#635372]/37 rounded-full" />
          <h1 className="text-2xl font-bold text-[#2C0053]">
            Agency Dashboard
          </h1>
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column: Stats + Labour Profiles */}
        <div className="space-y-6 xl:col-span-2">
          <StatsOverview
            stats={{
              totalProfiles: data.stats.totalProfiles,
              pendingVerification: data.stats.pendingVerification,
              approvedProfiles: data.stats.approvedProfiles,
              deployedProfiles: data.stats.deployedProfiles,
            }}
            variant="agency"
          />
          <LabourProfilesTable profiles={data.recentProfiles} />
        </div>

        {/* Right Column: Activity Feed */}
        <div className="xl:col-span-1">
          <ActivityFeed activities={data.recentActivity} />
        </div>
      </div>
    </div>
  );
}
