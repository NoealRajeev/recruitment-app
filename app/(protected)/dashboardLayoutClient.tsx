// app/(protected)/DashboardLayoutClient.tsx
"use client";

import { ReactNode } from "react";
import SideBar from "@/components/layout/SideBar";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { UserRole } from "@prisma/client";
import { useSidebar } from "@/context/SidebarContext";
import SidebarToggleButton from "./SidebarToggleButton";
import { getRoutes } from "@/lib/utils/routes";
import { usePathname } from "next/navigation";

export default function DashboardLayoutClient({
  children,
  role,
  avatarUrl,
  userName,
}: {
  children: React.ReactNode;
  role: UserRole;
  avatarUrl: string;
  userName: string;
}) {
  const { isExpanded } = useSidebar();
  const pathname = usePathname() ?? "";
  const routes = getRoutes(role);

  const isValidRoute =
    routes.some((route) => pathname.startsWith(route.path)) ||
    pathname.startsWith("/dashboard/profile") ||
    pathname.startsWith("/dashboard/settings") ||
    pathname.startsWith("/dashboard/notifications");

  return (
    <div className="flex h-screen bg-gray-50 relative">
      {/* Desktop sidebar only */}
      <div className="hidden md:block">
        <SideBar role={role} isExpanded={isExpanded} />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden transition-all duration-350">
        {/* Header now contains the mobile menu trigger */}
        <DashboardHeader
          role={role}
          avatarUrl={avatarUrl}
          userName={userName}
        />

        <main className="flex-1 overflow-x-hidden overflow-y-auto px-4 md:px-6">
          {isValidRoute ? (
            children
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-2xl font-bold">404 - Page Not Found</h2>
                <p className="mt-2">The requested page doesn&apos;t exist</p>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Desktop-only toggle button */}
      <div className="hidden md:block">
        <SidebarToggleButton />
      </div>
    </div>
  );
}
