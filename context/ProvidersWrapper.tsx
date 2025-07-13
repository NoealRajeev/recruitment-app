// context/ProvidersWrapper.tsx
"use client";

import { SessionProvider } from "next-auth/react";
import { ToastProvider } from "@/context/toast-provider";
import { SidebarProvider } from "@/context/SidebarContext";
import { WebSocketProvider } from "@/context/WebSocketContext";
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

// context/ProvidersWrapper.tsx
export default function ProvidersWrapper({
  children,
  session,
  role,
}: ProvidersWrapperProps) {
  return (
    <SessionProvider session={session}>
      <WebSocketProvider>
        <SidebarProvider>
          <ToastProvider>
            <DashboardLayoutClient
              role={role}
              avatarUrl={session.user.profilePicture || ""}
              userName={session.user.name || ""}
            >
              {children}
            </DashboardLayoutClient>
          </ToastProvider>
        </SidebarProvider>
      </WebSocketProvider>
    </SessionProvider>
  );
}
