import type { Metadata } from "next";
import "./globals.css";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import {
  analyticsEnvVar,
  siteDescription,
  siteKeywords,
  siteName,
} from "@/config/site-content";

const GA_MEASUREMENT_ID = process.env[analyticsEnvVar] || "";

export const metadata: Metadata = {
  title: siteName,
  description: siteDescription,
  keywords: siteKeywords,
  authors: [{ name: siteName }],
  openGraph: {
    title: siteName,
    description: siteDescription,
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <GoogleAnalytics measurementId={GA_MEASUREMENT_ID} />
      </head>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
