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
  Download,
} from "lucide-react";
import { useEffect, useState } from "react";

interface DashboardStatsProps {
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
  onDownloadReport?: (type: string) => void;
}

const DashboardStats = ({
  stats,
  variant = "admin",
  onDownloadReport,
}: DashboardStatsProps) => {
  const [percentageChanges, setPercentageChanges] = useState<
    Record<string, number>
  >({});

  useEffect(() => {
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
    } else if (variant === "client") {
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

  const calculateChange = (current?: number, lastMonth?: number): number => {
    if (!current || !lastMonth || lastMonth === 0) return 0;
    return Math.round(((current - lastMonth) / lastMonth) * 100);
  };

  const getTrendText = (change: number): string => {
    if (change > 0) return `${change}% increase from last month`;
    if (change < 0) return `${Math.abs(change)}% decrease from last month`;
    return "No change from last month";
  };

  const getPercentageOfTotal = (value?: number, total?: number): string => {
    if (!value || !total || total === 0) return "0% of total";
    return `${Math.round((value / total) * 100)}% of total`;
  };

  // Admin dashboard stats configuration
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
      value: `${stats.pendingReviews || 0} / ${stats.totalRequests || 0}`,
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

  // Agency dashboard stats configuration
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
      footer: getPercentageOfTotal(
        stats.pendingVerification,
        stats.totalProfiles
      ),
      trend: (percentageChanges.pendingVerification || 0) >= 0 ? "up" : "down",
      bg: "bg-orange-300",
    },
    {
      icon: <CheckCircle className="text-white w-6 h-6" />,
      label: "Approved Profiles",
      value: stats.approvedProfiles?.toString() || "0",
      footer: getPercentageOfTotal(stats.approvedProfiles, stats.totalProfiles),
      trend: (percentageChanges.approvedProfiles || 0) >= 0 ? "up" : "down",
      bg: "bg-blue-300",
    },
    {
      icon: <Plane className="text-white w-6 h-6" />,
      label: "Deployed Profiles",
      value: stats.deployedProfiles?.toString() || "0",
      footer: getPercentageOfTotal(stats.deployedProfiles, stats.totalProfiles),
      trend: (percentageChanges.deployedProfiles || 0) >= 0 ? "up" : "down",
      bg: "bg-green-300",
    },
  ];

  // Client dashboard stats configuration
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

  // Quick actions as cards
  const quickActions = [
    {
      icon: <Download className="text-white w-6 h-6" />,
      label: "Download Report",
      value: "",
      footer: "Export data as PDF or Excel",
      trend: "up",
      bg: "bg-green-400",
      onClick: () => onDownloadReport && onDownloadReport("comprehensive"),
    },
  ];

  // Select the appropriate stats based on variant
  const statsData =
    variant === "agency"
      ? agencyStats
      : variant === "client"
        ? clientStats
        : adminStats;

  // Only show analytics quick action for admin
  const actionsToShow = variant === "admin" ? quickActions : [quickActions[0]];

  type StatCardType = {
    icon: React.ReactNode;
    label: string;
    value: string;
    footer: string;
    trend: string;
    bg: string;
  };

  type QuickActionType = StatCardType & {
    onClick: () => void;
  };

  function isQuickAction(
    card: StatCardType | QuickActionType
  ): card is QuickActionType {
    return typeof (card as QuickActionType).onClick === "function";
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...statsData, ...actionsToShow].map((stat, i) => {
        const actionProps = isQuickAction(stat)
          ? { onClick: stat.onClick }
          : {};
        return (
          <div
            key={i}
            className={
              "bg-purple-100 p-4 rounded-xl flex flex-col justify-between shadow" +
              (isQuickAction(stat) ? " cursor-pointer" : "")
            }
            {...actionProps}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${stat.bg}`}>{stat.icon}</div>
              <div className="text-sm text-gray-600 font-semibold">
                {stat.label}
              </div>
            </div>
            {stat.value && (
              <div className="text-2xl font-bold text-black mt-4">
                {stat.value}
              </div>
            )}
            <div
              className={`text-xs mt-2 ${
                stat.trend === "up" ? "text-green-600" : "text-red-600"
              }`}
            >
              {stat.footer}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DashboardStats;
