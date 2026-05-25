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
import FoundersContext from "./pages/FoundersContext";
import FoundersDeadValley from "./pages/FoundersDeadValley";

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
              {/* Founder Toolkit landing now goes straight to Context — the
                  two-card landing felt like an extra step. Dead Valley lives
                  inside Context's Healthcare → Country histories region tabs. */}
              <Route path="/founders" element={<Navigate to="/founders/context" replace />} />
              <Route path="/founders/context" element={<FoundersContext />} />
              <Route path="/founders/dead-valley" element={<FoundersDeadValley />} />
              <Route path="/share/:id" element={<Share />} />

              {/* Persona landing pages — single PersonaPage dispatches on :id */}
              <Route path="/patient" element={<PersonaPage />} />
              <Route path="/doctor" element={<PersonaPage />} />
              <Route path="/business" element={<PersonaPage />} />
              <Route path="/startup" element={<PersonaPage />} />
              <Route path="/leader" element={<PersonaPage />} />

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
