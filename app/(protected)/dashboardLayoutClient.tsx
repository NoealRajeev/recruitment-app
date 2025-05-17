// app/(protected)/DashboardLayoutClient.tsx
"use client";

import { ReactNode } from "react";
import SideBar from "@/components/layout/SideBar";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { UserRole } from "@prisma/client";
import { useSidebar } from "@/context/SidebarContext";
import SidebarToggleButton from "./SidebarToggleButton";

export default function DashboardLayoutClient({
  children,
  role,
  avatarUrl,
  userName,
}: {
  children: ReactNode;
  role: UserRole;
  avatarUrl: string;
  userName: string;
}) {
  const { isExpanded } = useSidebar();

  return (
    <div className="flex h-screen bg-gray-50 relative">
      {/* Sidebar */}
      <SideBar role={role} isExpanded={isExpanded} />

      {/* Main content area */}
      <div
        className={`flex-1 flex flex-col overflow-hidden transition-all duration-350`}
      >
        <DashboardHeader
          role={role}
          avatarUrl={avatarUrl}
          userName={userName}
        />

        {/* Main content container */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          {children}
        </main>
      </div>

      {/* Toggle Button */}
      <SidebarToggleButton />
    </div>
  );
}
