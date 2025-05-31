// app/(protected)/layout.tsx
import { ReactNode } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { redirect } from "next/navigation";
import "../(public)/globals.css";
import ProvidersWrapper from "@/context/ProvidersWrapper";
import { UserRole } from "@/lib/generated/prisma";
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
        <ProvidersWrapper
          session={session}
          role={session.user.role as UserRole}
          avatarUrl={session.user.image || ""}
          userName={session.user.name || ""}
        >
          {children}
        </ProvidersWrapper>
      </body>
    </html>
  );
}
