import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/components/auth";
import { RouteFallback } from "@/components/layout/RouteFallback";
import { useHideBootLoader } from "@/lib/bootLoader";

// Pages. Index is the landing page and ships in the main bundle; every other
// page is its own chunk, loaded on first visit, so the first load stays small.
import Index from "./pages/Index";
const Directory = lazy(() => import("./pages/Directory"));
const Context = lazy(() => import("./pages/Context"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Discovery = lazy(() => import("./pages/Discovery"));
const Share = lazy(() => import("./pages/Share"));
const PersonaPage = lazy(() => import("./pages/PersonaPage"));
const Founders = lazy(() => import("./pages/Founders"));
const FoundersContext = lazy(() => import("./pages/FoundersContext"));
const FoundersDeadValley = lazy(() => import("./pages/FoundersDeadValley"));
const FoundersDevRel = lazy(() => import("./pages/FoundersDevRel"));
const FoundersMarkets = lazy(() => import("./pages/FoundersMarkets"));
const FoundersArchitectures = lazy(() => import("./pages/FoundersArchitectures"));
const Jobs = lazy(() => import("./pages/Jobs"));
const OpenCalls = lazy(() => import("./pages/OpenCalls"));

const queryClient = new QueryClient();

// Legacy / externally shared URLs that should land on the home page.
// Keeps the query string and hash so UTM tags survive the redirect.
const RedirectHome = () => {
  const { search, hash } = useLocation();
  return <Navigate to={{ pathname: "/", search, hash }} replace />;
};

const BootLoaderDone = () => {
  useHideBootLoader();
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BootLoaderDone />
    <LanguageProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/" element={<Index />} />
              {/* /landing was shared externally (LinkedIn) but never existed */}
              <Route path="/landing" element={<RedirectHome />} />
              <Route path="/directory" element={<Directory />} />
              <Route path="/directory/:id" element={<Directory />} />
              <Route path="/context" element={<Context />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/discovery" element={<Discovery />} />
              {/* Founder Toolkit — editorial home + 4 context modules.
                  /founders renders the magazine cover; deep pages live under
                  /founders/<module>. /founders/context is deprecated and
                  redirects to the new home. */}
              <Route path="/founders" element={<Founders />} />
              <Route path="/founders/markets" element={<FoundersMarkets />} />
              {/* Regulatory merged into Markets — same page, one click */}
              <Route path="/founders/regulatory" element={<Navigate to="/founders/markets" replace />} />
              <Route path="/founders/architectures" element={<FoundersArchitectures />} />
              <Route path="/founders/tech" element={<FoundersDevRel />} />
              {/* Acqui-hires lives inside /founders/tech (Acqui-hires tab) */}
              <Route path="/founders/acquihires" element={<Navigate to="/founders/tech" replace />} />
              <Route path="/founders/devrel" element={<Navigate to="/founders/tech" replace />} />
              <Route path="/founders/dead-valley" element={<FoundersDeadValley />} />
              {/* Legacy deep page — kept until contents migrate to new modules. */}
              <Route path="/founders/context" element={<FoundersContext />} />
              <Route path="/share/:id" element={<Share />} />

              {/* Persona landing pages — single PersonaPage dispatches on :id */}
              <Route path="/patient" element={<PersonaPage />} />
              <Route path="/doctor" element={<PersonaPage />} />
              <Route path="/business" element={<PersonaPage />} />
              <Route path="/startup" element={<PersonaPage />} />
              <Route path="/leader" element={<PersonaPage />} />

              <Route path="/jobs" element={<Jobs />} />
              <Route path="/open-calls" element={<OpenCalls />} />

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
