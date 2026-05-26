import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/components/auth";

// Pages
import Index from "./pages/Index";
import Directory from "./pages/Directory";
import Context from "./pages/Context";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";
import Discovery from "./pages/Discovery";
import Share from "./pages/Share";
import PersonaPage from "./pages/PersonaPage";
import Founders from "./pages/Founders";
import FoundersContext from "./pages/FoundersContext";
import FoundersDeadValley from "./pages/FoundersDeadValley";
import FoundersDevRel from "./pages/FoundersDevRel";
import FoundersMarkets from "./pages/FoundersMarkets";
import FoundersArchitectures from "./pages/FoundersArchitectures";
import Jobs from "./pages/Jobs";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Routes>
              <Route path="/" element={<Index />} />
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

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
