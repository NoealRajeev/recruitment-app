// context/ProvidersWrapper.tsx
"use client";

import { SessionProvider } from "next-auth/react";
import { ToastProvider } from "@/context/toast-provider";
import { SidebarProvider } from "@/context/SidebarContext";
import { ReactNode } from "react";
import DashboardLayoutClient from "@/app/(protected)/dashboardLayoutClient";
import { UserRole } from "@/lib/generated/prisma";
import { Session } from "next-auth";

interface ProvidersWrapperProps {
  children: ReactNode;
  session: Session;
  role: UserRole;
  avatarUrl: string;
  userName: string;
}

export default function ProvidersWrapper({
  children,
  session,
  role,
  avatarUrl,
  userName,
}: ProvidersWrapperProps) {
  return (
    <SessionProvider session={session}>
      <SidebarProvider>
        <ToastProvider>
          <DashboardLayoutClient
            role={role}
            avatarUrl={avatarUrl}
            userName={userName}
          >
            {children}
          </DashboardLayoutClient>
        </ToastProvider>
      </SidebarProvider>
    </SessionProvider>
  );
}
