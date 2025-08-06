// app/layout.tsx
import Footer from "@/components/layout/Footer";
import "./globals.css";
import Header from "@/components/layout/Header";
import { ToastProvider } from "@/context/toast-provider";
import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider } from "@/context/AuthProvider";
import OfflineStatusIndicator from "@/components/OfflineStatusIndicator";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Findly",
              url: "https://findly.breaktroughf1.com",
              potentialAction: {
                "@type": "SearchAction",
                target:
                  "https://findly.breaktroughf1.com/search?q={search_term_string}",
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        ></script>
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <LanguageProvider>
          <AuthProvider>
            <ToastProvider>
              <OfflineStatusIndicator />
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
