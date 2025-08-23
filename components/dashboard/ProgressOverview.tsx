"use client";

import {
  CheckCircle,
  Clock,
  AlertTriangle,
  Users,
  TrendingUp,
  BarChart3,
  Calendar,
  Target,
  type LucideIcon,
} from "lucide-react";
import { useMemo, useState } from "react";

interface ProgressOverviewProps {
  data: {
    totalLabour: number;
    deployedLabour: number;
    activeLabour: number;
    pendingLabour: number;
    stageBreakdown: Record<string, number>;
    recentProgress: Array<{
      id: string;
      labourName: string;
      fromStage: string;
      toStage: string;
      date: string | Date;
    }>;
  };
}

const StageProgressCard = ({
  stage,
  count,
  total,
  color,
  icon: Icon,
}: {
  stage: string;
  count: number;
  total: number;
  color: string; // e.g. "bg-blue-500"
  icon: LucideIcon;
}) => {
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className={`p-2.5 sm:p-3 rounded-lg ${color}`}>
          <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </div>
        <span className="text-xl sm:text-2xl font-bold text-gray-900">
          {count}
        </span>
      </div>

      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
        {stage.replace(/_/g, " ")}
      </h3>

      <div className="space-y-2">
        <div className="flex justify-between text-xs sm:text-sm text-gray-600">
          <span>Progress</span>
          <span>{percentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${color}`}
            style={{ width: `${percentage}%` }}
            aria-label={`${stage} progress`}
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percentage}
          />
        </div>
      </div>
    </div>
  );
};

const RecentProgressItem = ({
  labourName,
  fromStage,
  toStage,
  date,
}: {
  labourName: string;
  fromStage: string;
  toStage: string;
  date: string | Date;
}) => {
  const d = new Date(date);
  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
      <div className="p-2 bg-green-100 rounded-full">
        <CheckCircle className="w-4 h-4 text-green-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {labourName}
        </p>
        <p className="text-xs text-gray-600">
          {fromStage.replace(/_/g, " ")} → {toStage.replace(/_/g, " ")}
        </p>
      </div>
      <span className="text-xs text-gray-500 shrink-0">
        {d.toLocaleDateString()}
      </span>
    </div>
  );
};

export default function ProgressOverview({ data }: ProgressOverviewProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState("week");

  // stable maps with explicit typing
  const stageColors: Record<string, string> = {
    OFFER_LETTER_SIGN: "bg-blue-500",
    VISA_APPLYING: "bg-purple-500",
    QVC_PAYMENT: "bg-orange-500",
    CONTRACT_SIGN: "bg-indigo-500",
    MEDICAL_STATUS: "bg-pink-500",
    FINGERPRINT: "bg-teal-500",
    VISA_PRINTING: "bg-cyan-500",
    READY_TO_TRAVEL: "bg-yellow-500",
    TRAVEL_CONFIRMATION: "bg-lime-500",
    ARRIVAL_CONFIRMATION: "bg-emerald-500",
    DEPLOYED: "bg-green-500",
  };

  const stageIcons: Record<string, LucideIcon> = {
    OFFER_LETTER_SIGN: Clock,
    VISA_APPLYING: Calendar,
    QVC_PAYMENT: Target,
    CONTRACT_SIGN: CheckCircle,
    MEDICAL_STATUS: AlertTriangle,
    FINGERPRINT: Users,
    VISA_PRINTING: TrendingUp,
    READY_TO_TRAVEL: BarChart3,
    TRAVEL_CONFIRMATION: Clock,
    ARRIVAL_CONFIRMATION: CheckCircle,
    DEPLOYED: CheckCircle,
  };

  const overallProgress = useMemo(() => {
    // Use totalLabour as the denominator guard; deployed/total is the metric you want.
    if (!data || data.totalLabour <= 0) return 0;
    const deployed =
      data.deployedLabour ?? data.stageBreakdown["DEPLOYED"] ?? 0;
    return Math.max(
      0,
      Math.min(100, Math.round((deployed / data.totalLabour) * 100))
    );
  }, [data]);

  return (
    <div className="space-y-6">
      {/* Overall Progress Summary */}
      <section className="bg-purple-100 rounded-xl shadow p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">
            Overall Progress
          </h2>
          <label className="inline-flex items-center gap-2">
            <span className="text-xs text-gray-600">Timeframe</span>
            <select
              aria-label="Select timeframe"
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
            </select>
          </label>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className="bg-white rounded-lg p-3 sm:p-4 text-center">
            <div className="text-xl sm:text-2xl font-bold text-blue-600">
              {data.totalLabour}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">Total Labour</div>
          </div>
          <div className="bg-white rounded-lg p-3 sm:p-4 text-center">
            <div className="text-xl sm:text-2xl font-bold text-green-600">
              {data.deployedLabour}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">Deployed</div>
          </div>
          <div className="bg-white rounded-lg p-3 sm:p-4 text-center">
            <div className="text-xl sm:text-2xl font-bold text-orange-600">
              {data.activeLabour}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">Active</div>
          </div>
          <div className="bg-white rounded-lg p-3 sm:p-4 text-center">
            <div className="text-xl sm:text-2xl font-bold text-red-600">
              {data.pendingLabour}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">Pending</div>
          </div>
        </div>

        <div className="bg-purple-100 rounded-lg p-3 sm:p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Overall Completion
            </span>
            <span className="text-sm font-medium text-gray-700">
              {overallProgress}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3" aria-hidden>
            <div
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>
      </section>

      {/* Stage Breakdown */}
      <section>
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
          Stage Breakdown
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {Object.entries(data.stageBreakdown).map(([stage, count]) => {
            const Icon = stageIcons[stage] ?? Clock;
            const color = stageColors[stage] ?? "bg-gray-500";
            return (
              <StageProgressCard
                key={stage}
                stage={stage}
                count={count}
                total={data.totalLabour}
                color={color}
                icon={Icon}
              />
            );
          })}
        </div>
      </section>

      {/* Recent Progress */}
      <section className="bg-purple-100 rounded-xl shadow p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
          Recent Progress
        </h3>
        <div className="space-y-3">
          {data.recentProgress.length > 0 ? (
            data.recentProgress
              .slice(0, 5)
              .map((progress) => (
                <RecentProgressItem
                  key={progress.id}
                  labourName={progress.labourName}
                  fromStage={progress.fromStage}
                  toStage={progress.toStage}
                  date={progress.date}
                />
              ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No recent progress updates</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
