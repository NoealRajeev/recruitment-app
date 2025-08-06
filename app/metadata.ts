// app/metadata.ts
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Findly — Skilled Workforce, Seamlessly Delivered.",
  description:
    "Findly connects businesses with verified blue-collar workers across borders. Streamlined, trusted, and efficient recruitment.",
  keywords: [
    "Findly",
    "Recruitment Platform",
    "Blue Collar Jobs",
    "Foreign Labor",
    "Gulf Hiring",
    "Overseas Recruitment",
    "Skilled Workers",
    "Qatar Jobs",
  ],
  metadataBase: new URL("https://findly.breaktroughf1.com"),
  openGraph: {
    title: "Findly — Skilled Workforce, Seamlessly Delivered.",
    description:
      "Easily manage cross-border recruitment with Findly. Secure, streamlined, and efficient.",
    url: "https://findly.breaktroughf1.com",
    siteName: "Findly",
    images: [
      {
        url: "/assets/og-image.png", // You must place this image in `/public`
        width: 1200,
        height: 630,
        alt: "Findly Recruitment Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Findly — Skilled Workforce, Seamlessly Delivered.",
    description:
      "Connecting businesses with reliable blue-collar workers from across the globe.",
    site: "@findlyapp", // if you have a Twitter handle
    images: ["/assets/og-image.png"],
  },
  icons: {
    icon: "/assets/favicon.ico",
    apple: "/assets/apple-touch-icon.png",
  },
  themeColor: "#2C0053",
};
