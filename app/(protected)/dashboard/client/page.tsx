// app/(protected)/dashboard/client/page.tsx
"use client";

import ActivityFeed from "@/components/dashboard/ActivityFeed";
import StatsOverview from "@/components/dashboard/StatsOverview";
import { useEffect, useState } from "react";
import { useToast } from "@/context/toast-provider";
import { Plus } from "lucide-react";
import Link from "next/link";
import RequirementsTable from "@/components/dashboard/RequirementsTable";

interface DashboardData {
  stats: {
    openRequirements: number;
    filledPositions: number;
    activeWorkers: number;
    upcomingRenewals: number;
    lastMonth?: number;
  };
  recentRequirements: Array<{
    id: string;
    jobRoles: Array<{
      id: string;
      title: string;
      quantity: number;
      filled: number;
      progress: number;
    }>;
    status: string;
    createdAt: Date;
    updatedAt: Date;
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

export default function ClientDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/dashboard/client");
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
            Client Dashboard
          </h1>
        </div>

        {/* New Requirement Button */}
        <Link
          href="/dashboard/client/requirements/new"
          className="flex items-center space-x-2 cursor-pointer"
        >
          <Plus className="w-6 h-6 text-[#2C0053]" />
          <h1 className="text-xl font-bold text-[#2C0053]">New Requirement</h1>
        </Link>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column: Stats + Requirements */}
        <div className="space-y-6 xl:col-span-2">
          <StatsOverview
            stats={{
              openRequirements: data.stats.openRequirements,
              filledPositions: data.stats.filledPositions,
              activeWorkers: data.stats.activeWorkers,
              upcomingRenewals: data.stats.upcomingRenewals,
              lastMonth: data.stats.lastMonth,
            }}
            variant="client"
          />
          <RequirementsTable requirements={data.recentRequirements} />
        </div>

        {/* Right Column: Activity Feed */}
        <div className="xl:col-span-1">
          <ActivityFeed activities={data.recentActivity} />
        </div>
      </div>
    </div>
  );
}
