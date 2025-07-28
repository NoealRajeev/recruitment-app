// app/(protected)/layout.tsx
import { ReactNode } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { redirect } from "next/navigation";
import "../(public)/globals.css";
import ProvidersWrapper from "@/context/ProvidersWrapper";
import { UserRole } from "@/lib/generated/prisma";
import { env } from "@/lib/env.server";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  if (env.isProduction && typeof window === "undefined") {
    import("@/lib/cron").then(({ startCronJobs }) => startCronJobs());
  }

  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ProvidersWrapper
          session={session}
          role={session.user.role as UserRole}
          avatarUrl={session.user.profilePicture || ""}
          userName={session.user.name || ""}
        >
          {children}
        </ProvidersWrapper>
      </body>
    </html>
  );
}
