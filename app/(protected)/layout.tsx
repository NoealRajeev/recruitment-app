// app/(protected)/layout.tsx
import { ReactNode } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { redirect } from "next/navigation";
import "../(public)/globals.css";
import DashboardLayoutClient from "./dashboardLayoutClient";
import { SidebarProvider } from "@/context/SidebarContext";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <SidebarProvider>
          <DashboardLayoutClient
            role={session.user.role}
            avatarUrl={session.user.image || ""}
            userName={session.user.name || ""}
          >
            {children}
          </DashboardLayoutClient>
        </SidebarProvider>
      </body>
    </html>
  );
}
