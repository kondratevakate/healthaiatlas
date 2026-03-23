import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import GoogleAnalytics from "@/components/GoogleAnalytics";

// Replace with your actual Google Analytics Measurement ID (e.g., G-XXXXXXXXXX)
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID || "";

export const metadata: Metadata = {
  title: "Health AI Atlas",
  description: "Curated maps and analysis of AI in healthcare — oncology, patient management, and medical tourism.",
  keywords: ["healthcare AI", "oncology AI", "medical tourism", "healthcare technology", "digital health"],
  authors: [{ name: "Health AI Atlas" }],
  openGraph: {
    title: "Health AI Atlas",
    description: "Curated maps and analysis of AI in healthcare",
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
