"use client";

import { LanguageProvider } from "@/contexts/LanguageContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CookieBanner } from "@/components/layout/CookieBanner";
import { ScrollProgress } from "@/components/shared/ScrollProgress";
import { Toaster as CivicToastToaster } from "@/components/ui/toaster";
import { Toaster as CivicSonner } from "@/components/ui/sonner";

interface CivicAppShellProps {
  children: React.ReactNode;
}

export default function CivicAppShell({ children }: CivicAppShellProps) {
  return (
    <div className="civic-root min-h-screen">
      <LanguageProvider>
        <ScrollProgress />
        <CivicToastToaster />
        <CivicSonner />
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <CookieBanner />
        </div>
      </LanguageProvider>
    </div>
  );
}
