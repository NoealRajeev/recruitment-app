// app/(protected)/dashboard/admin/page.tsx
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import ProjectSummary from "@/components/dashboard/ProjectSummary";
import StatsOverview from "@/components/dashboard/StatsOverview";
import { Plus } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="pb-6 px-6 space-y-6">
      {/* Header Row */}
      <div className="flex items-center justify-between">
        {/* Overview Title with Vertical Line */}
        <div className="flex items-center space-x-3">
          <div className="h-[1.75rem] w-[3px] bg-[#635372]/37 rounded-full" />
          <h1 className="text-2xl font-bold text-[#2C0053]">Overview</h1>
        </div>

        {/* New Account with Icon */}
        <div className="flex items-center space-x-2 cursor-pointer">
          <Plus className="w-6 h-6 text-[#2C0053]" />
          <h1 className="text-xl font-bold text-[#2C0053]">New Account</h1>
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column: Stats + ProjectSummary */}
        <div className="space-y-6 xl:col-span-2">
          <StatsOverview />
          <ProjectSummary />
        </div>

        {/* Right Column: Activity Feed */}
        <div className="xl:col-span-1">
          <ActivityFeed />
        </div>
      </div>
    </div>
  );
}
