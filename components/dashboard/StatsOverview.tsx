"use client";

import {
  BarChart,
  Clock,
  Users,
  Briefcase,
  CheckCircle,
  Plane,
  FileText,
  Building,
  UserCheck,
} from "lucide-react";
import { useEffect, useState } from "react";

interface StatsOverviewProps {
  stats: {
    total?: number;
    lastMonth?: number;
    totalRequests?: number;
    pendingReviews?: number;
    clientsRegistered?: number;
    agenciesActive?: number;
    totalProfiles?: number;
    pendingVerification?: number;
    approvedProfiles?: number;
    deployedProfiles?: number;
    openRequirements?: number;
    filledPositions?: number;
    activeWorkers?: number;
    upcomingRenewals?: number;
  };
  variant?: "admin" | "agency" | "client";
}

const StatsOverview = ({ stats, variant = "admin" }: StatsOverviewProps) => {
  const [percentageChanges, setPercentageChanges] = useState<
    Record<string, number>
  >({});

  useEffect(() => {
    const calculateChange = (current?: number, lastMonth?: number) => {
      if (current == null || lastMonth == null || lastMonth === 0) return 0;
      return Math.round(((current - lastMonth) / lastMonth) * 100);
    };

    const changes: Record<string, number> = {};
    if (variant === "admin") {
      changes.totalRequests = calculateChange(
        stats.totalRequests,
        stats.lastMonth
      );
      changes.pendingReviews = calculateChange(
        stats.pendingReviews,
        stats.lastMonth
      );
      changes.clientsRegistered = calculateChange(
        stats.clientsRegistered,
        stats.lastMonth
      );
      changes.agenciesActive = calculateChange(
        stats.agenciesActive,
        stats.lastMonth
      );
    } else if (variant === "agency") {
      changes.totalProfiles = calculateChange(
        stats.totalProfiles,
        stats.lastMonth
      );
      changes.pendingVerification = calculateChange(
        stats.pendingVerification,
        stats.lastMonth
      );
      changes.approvedProfiles = calculateChange(
        stats.approvedProfiles,
        stats.lastMonth
      );
      changes.deployedProfiles = calculateChange(
        stats.deployedProfiles,
        stats.lastMonth
      );
    } else {
      changes.openRequirements = calculateChange(
        stats.openRequirements,
        stats.lastMonth
      );
      changes.filledPositions = calculateChange(
        stats.filledPositions,
        stats.lastMonth
      );
      changes.activeWorkers = calculateChange(
        stats.activeWorkers,
        stats.lastMonth
      );
      changes.upcomingRenewals = calculateChange(
        stats.upcomingRenewals,
        stats.lastMonth
      );
    }
    setPercentageChanges(changes);
  }, [stats, variant]);

  const getTrendText = (change: number) =>
    change > 0
      ? `${change}% increase from last month`
      : change < 0
        ? `${Math.abs(change)}% decrease from last month`
        : "No change from last month";

  const adminStats = [
    {
      icon: <BarChart className="text-white w-6 h-6" />,
      label: "Total Requests",
      value: stats.totalRequests?.toString() || "0",
      footer: getTrendText(percentageChanges.totalRequests || 0),
      trend: (percentageChanges.totalRequests || 0) >= 0 ? "up" : "down",
      bg: "bg-purple-300",
    },
    {
      icon: <Clock className="text-white w-6 h-6" />,
      label: "Pending Reviews",
      value: `${stats.pendingReviews ?? 0} / ${stats.totalRequests ?? 0}`,
      footer: getTrendText(percentageChanges.pendingReviews || 0),
      trend: (percentageChanges.pendingReviews || 0) >= 0 ? "up" : "down",
      bg: "bg-orange-300",
    },
    {
      icon: <Users className="text-white w-6 h-6" />,
      label: "Clients Registered",
      value: stats.clientsRegistered?.toString() || "0",
      footer: getTrendText(percentageChanges.clientsRegistered || 0),
      trend: (percentageChanges.clientsRegistered || 0) >= 0 ? "up" : "down",
      bg: "bg-blue-300",
    },
    {
      icon: <Briefcase className="text-white w-6 h-6" />,
      label: "Agencies Active",
      value: stats.agenciesActive?.toString() || "0",
      footer: getTrendText(percentageChanges.agenciesActive || 0),
      trend: (percentageChanges.agenciesActive || 0) >= 0 ? "up" : "down",
      bg: "bg-yellow-300",
    },
  ];

  const agencyStats = [
    {
      icon: <Users className="text-white w-6 h-6" />,
      label: "Total Profiles",
      value: stats.totalProfiles?.toString() || "0",
      footer: getTrendText(percentageChanges.totalProfiles || 0),
      trend: (percentageChanges.totalProfiles || 0) >= 0 ? "up" : "down",
      bg: "bg-purple-300",
    },
    {
      icon: <Clock className="text-white w-6 h-6" />,
      label: "Pending Verification",
      value: stats.pendingVerification?.toString() || "0",
      footer:
        stats.totalProfiles && stats.totalProfiles > 0
          ? `${Math.round(((stats.pendingVerification ?? 0) / stats.totalProfiles) * 100)}% of total`
          : "0% of total",
      trend: (percentageChanges.pendingVerification || 0) >= 0 ? "up" : "down",
      bg: "bg-orange-300",
    },
    {
      icon: <CheckCircle className="text-white w-6 h-6" />,
      label: "Approved Profiles",
      value: stats.approvedProfiles?.toString() || "0",
      footer:
        stats.totalProfiles && stats.totalProfiles > 0
          ? `${Math.round(((stats.approvedProfiles ?? 0) / stats.totalProfiles) * 100)}% of total`
          : "0% of total",
      trend: (percentageChanges.approvedProfiles || 0) >= 0 ? "up" : "down",
      bg: "bg-blue-300",
    },
    {
      icon: <Plane className="text-white w-6 h-6" />,
      label: "Deployed Profiles",
      value: stats.deployedProfiles?.toString() || "0",
      footer:
        stats.totalProfiles && stats.totalProfiles > 0
          ? `${Math.round(((stats.deployedProfiles ?? 0) / stats.totalProfiles) * 100)}% of total`
          : "0% of total",
      trend: (percentageChanges.deployedProfiles || 0) >= 0 ? "up" : "down",
      bg: "bg-green-300",
    },
  ];

  const clientStats = [
    {
      icon: <FileText className="text-white w-6 h-6" />,
      label: "Open Requirements",
      value: stats.openRequirements?.toString() || "0",
      footer: getTrendText(percentageChanges.openRequirements || 0),
      trend: (percentageChanges.openRequirements || 0) >= 0 ? "up" : "down",
      bg: "bg-purple-300",
    },
    {
      icon: <UserCheck className="text-white w-6 h-6" />,
      label: "Filled Positions",
      value: stats.filledPositions?.toString() || "0",
      footer: getTrendText(percentageChanges.filledPositions || 0),
      trend: (percentageChanges.filledPositions || 0) >= 0 ? "up" : "down",
      bg: "bg-blue-300",
    },
    {
      icon: <Users className="text-white w-6 h-6" />,
      label: "Active Workers",
      value: stats.activeWorkers?.toString() || "0",
      footer: getTrendText(percentageChanges.activeWorkers || 0),
      trend: (percentageChanges.activeWorkers || 0) >= 0 ? "up" : "down",
      bg: "bg-green-300",
    },
    {
      icon: <Building className="text-white w-6 h-6" />,
      label: "Upcoming Renewals",
      value: stats.upcomingRenewals?.toString() || "0",
      footer: getTrendText(percentageChanges.upcomingRenewals || 0),
      trend: (percentageChanges.upcomingRenewals || 0) >= 0 ? "up" : "down",
      bg: "bg-orange-300",
    },
  ];

  const statsData =
    variant === "agency"
      ? agencyStats
      : variant === "client"
        ? clientStats
        : adminStats;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {statsData.map((stat, i) => (
        <div
          key={i}
          className="bg-purple-100 p-4 rounded-xl flex flex-col justify-between shadow"
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${stat.bg}`}>{stat.icon}</div>
            <div className="text-sm text-gray-600 font-semibold">
              {stat.label}
            </div>
          </div>
          <div className="text-2xl font-bold text-black mt-4">{stat.value}</div>
          <div
            className={`text-xs mt-2 ${
              stat.trend === "up" ? "text-green-600" : "text-red-600"
            }`}
          >
            {stat.footer}
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsOverview;
