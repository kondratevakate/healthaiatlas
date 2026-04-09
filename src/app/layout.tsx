import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import {
  analyticsEnvVar,
  siteDescription,
  siteKeywords,
  siteName,
} from "@/config/site";

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
      <body className="min-h-full flex flex-col">
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
