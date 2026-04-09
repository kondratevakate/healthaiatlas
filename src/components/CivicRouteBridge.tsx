"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as CivicToastToaster } from "@/civic/components/ui/toaster";
import { Toaster as CivicSonner } from "@/civic/components/ui/sonner";
import { LanguageProvider } from "@/civic/contexts/LanguageContext";
import About from "@/civic/pages/About";
import Contact from "@/civic/pages/Contact";
import Context from "@/civic/pages/Context";
import Directory from "@/civic/pages/Directory";
import Discovery from "@/civic/pages/Discovery";
import Index from "@/civic/pages/Index";
import Maps from "@/civic/pages/Maps";
import Newsfeed from "@/civic/pages/Newsfeed";
import NotFound from "@/civic/pages/NotFound";
import PathBusiness from "@/civic/pages/PathBusiness";
import PathClinician from "@/civic/pages/PathClinician";
import PathFounder from "@/civic/pages/PathFounder";
import PathJobSeeker from "@/civic/pages/PathJobSeeker";
import Resources from "@/civic/pages/Resources";
import Share from "@/civic/pages/Share";
import Tools from "@/civic/pages/Tools";

type CivicRouteBridgeProps = {
  initialPath: string;
};

const civicRoutes = [
  { path: "/", element: <Index /> },
  { path: "/directory", element: <Directory /> },
  { path: "/directory/:id", element: <Directory /> },
  { path: "/maps", element: <Maps /> },
  { path: "/context", element: <Context /> },
  { path: "/tools", element: <Tools /> },
  { path: "/tools/:id", element: <Tools /> },
  { path: "/about", element: <About /> },
  { path: "/contact", element: <Contact /> },
  { path: "/path/founder", element: <PathFounder /> },
  { path: "/path/jobseeker", element: <PathJobSeeker /> },
  { path: "/path/business", element: <PathBusiness /> },
  { path: "/path/clinician", element: <PathClinician /> },
  { path: "/discovery", element: <Discovery /> },
  { path: "/share/:id", element: <Share /> },
  { path: "/newsfeed", element: <Newsfeed /> },
  { path: "/resources", element: <Resources /> },
  { path: "/resources/:id", element: <Resources /> },
  { path: "*", element: <NotFound /> },
];

function RouteSync() {
  const location = useLocation();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const nextPath = `${location.pathname}${location.search}${location.hash}`;

    if (nextPath !== pathname) {
      router.push(nextPath);
    }
  }, [location.hash, location.pathname, location.search, pathname, router]);

  return null;
}

export default function CivicRouteBridge({ initialPath }: CivicRouteBridgeProps) {
  return (
    <div className="civic-root min-h-screen">
      <LanguageProvider>
        <CivicToastToaster />
        <CivicSonner />
        <MemoryRouter initialEntries={[initialPath]}>
          <RouteSync />
          <Routes>
            {civicRoutes.map((route) => (
              <Route key={route.path} path={route.path} element={route.element} />
            ))}
          </Routes>
        </MemoryRouter>
      </LanguageProvider>
    </div>
  );
}
