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
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Discovery = lazy(() => import("./pages/Discovery"));
const Founders = lazy(() => import("./pages/Founders"));
// CANONICAL Context page (roadmap H, P1a): Context lives INSIDE the Founder
// Toolkit. FoundersContext is the real page — it carries every region panel
// (compare · uae · eu · ch · uk · us · cn · dead-valley) plus the AI/Healthcare
// split; the top-level /context URL redirects here.
const FoundersContext = lazy(() => import("./pages/FoundersContext"));
const FoundersDeadValley = lazy(() => import("./pages/FoundersDeadValley"));
const FoundersDevRel = lazy(() => import("./pages/FoundersDevRel"));
const FoundersMarkets = lazy(() => import("./pages/FoundersMarkets"));
const FoundersArchitectures = lazy(() => import("./pages/FoundersArchitectures"));
const Jobs = lazy(() => import("./pages/Jobs"));
const OpenCalls = lazy(() => import("./pages/OpenCalls"));
const Events = lazy(() => import("./pages/Events"));
const News = lazy(() => import("./pages/News"));
const DataDownloads = lazy(() => import("./pages/DataDownloads"));

const queryClient = new QueryClient();

// Legacy / externally shared URLs that should land on the home page.
// Keeps the query string and hash so UTM tags survive the redirect.
const RedirectHome = () => {
  const { search, hash } = useLocation();
  return <Navigate to={{ pathname: "/", search, hash }} replace />;
};

// ── Canonical-page redirects (roadmap H, P0/P1a) ─────────────────────────────
// Both pages below used to be duplicated: Open Calls lived at /open-calls AND
// /discovery?section=opencalls; Context lived at /context AND /founders/context.
// One canonical page each now, with the old URL kept alive as a redirect so
// links already shared outside the site (and search-index / footer deep links)
// keep landing on real content.
//
// P1a inverted the Context direction: Kate's ruling is that Context lives
// INSIDE the Founder Toolkit, so /founders/context is canonical and /context
// redirects into it.

// /discovery?section=opencalls → /open-calls
// Drops only the now-meaningless `section` param; every other query param (utm
// tags, ...) and the hash (#<entry-id>, used by the search index) survive.
const RedirectOpenCalls = () => {
  const { search, hash } = useLocation();
  const params = new URLSearchParams(search);
  params.delete("section");
  const query = params.toString();
  return (
    <Navigate to={{ pathname: "/open-calls", search: query ? `?${query}` : "", hash }} replace />
  );
};

// /context → /founders/context (P1a). Every query param (`region`, utm tags,
// ...) and the hash survive, so old shared links such as
// /context?region=uk#top land on the same panel inside the toolkit.
const RedirectToFoundersContext = () => {
  const { search, hash } = useLocation();
  return (
    <Navigate to={{ pathname: "/founders/context", search, hash }} replace />
  );
};

// /discovery still hosts the newsfeed (events / launches / leaders / prompts).
// The legacy Open Calls section of that page redirects to the canonical page.
const DiscoveryRoute = () => {
  const { search } = useLocation();
  if (new URLSearchParams(search).get("section") === "opencalls") {
    return <RedirectOpenCalls />;
  }
  return <Discovery />;
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
              {/* RETIRED top-level URL (P1a): Context moved inside the Founder
                  Toolkit. /context still resolves so links already shared
                  outside the site never 404 — it redirects to the canonical
                  /founders/context, keeping query string and hash. */}
              <Route path="/context" element={<RedirectToFoundersContext />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              {/* /discovery?section=opencalls redirects to /open-calls (see
                  DiscoveryRoute); the newsfeed itself stays here. */}
              <Route path="/discovery" element={<DiscoveryRoute />} />
              {/* Founder Toolkit — editorial home + 5 modules.
                  /founders renders the magazine cover; deep pages live under
                  /founders/<module>. Context IS a toolkit module (P1a): its
                  canonical home is /founders/context. */}
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
              {/* CANONICAL Context page (P1a). Carries every region panel —
                  compare · uae · eu · ch · uk · us · cn · dead-valley — so
                  ?region=cn and ?region=ch are valid again. */}
              <Route path="/founders/context" element={<FoundersContext />} />

              {/* RETIRED persona + assessment URLs (2026-11-02). The 5-question
                  quiz was removed and entry points are now jobs-to-be-done
                  (intent blocks on the home page), so /patient · /doctor ·
                  /business · /startup · /leader and the /share/:id assessment
                  card have no generator and no inbound link. No redirect is
                  registered: they fall through to the catch-all NotFound. */}

              <Route path="/jobs" element={<Jobs />} />
              <Route path="/open-calls" element={<OpenCalls />} />
              <Route path="/events" element={<Events />} />
              <Route path="/news" element={<News />} />
              <Route path="/data" element={<DataDownloads />} />

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
