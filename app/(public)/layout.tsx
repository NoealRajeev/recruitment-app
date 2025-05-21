// app/layout.tsx
import Footer from "@/components/layout/Footer";
import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import { ToastProvider } from "@/context/toast-provider";
import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider } from "@/context/AuthProvider";

export const metadata: Metadata = {
  title: "Recruitment Platform",
  description: "Foreign labor recruitment management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <LanguageProvider>
          <AuthProvider>
            <ToastProvider>
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </ToastProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
