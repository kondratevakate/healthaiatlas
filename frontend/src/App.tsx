import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/components/auth";

// Pages
import Index from "./pages/Index";
import Directory from "./pages/Directory";
import Maps from "./pages/Maps";
import Context from "./pages/Context";
import Tools from "./pages/Tools";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import NotFound from "./pages/NotFound";

// Research Navigator pages
import PathFounder from "./pages/PathFounder";
import PathJobSeeker from "./pages/PathJobSeeker";
import PathBusiness from "./pages/PathBusiness";
import PathClinician from "./pages/PathClinician";
import Discovery from "./pages/Discovery";
import Newsfeed from "./pages/Newsfeed";
import Share from "./pages/Share";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/directory" element={<Directory />} />
              <Route path="/directory/:id" element={<Directory />} />
              <Route path="/maps" element={<Maps />} />
              <Route path="/context" element={<Context />} />
              <Route path="/tools" element={<Tools />} />
              <Route path="/tools/:id" element={<Tools />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy" element={<Privacy />} />

              {/* Research Navigator Routes */}
              <Route path="/path/founder" element={<PathFounder />} />
              <Route path="/path/jobseeker" element={<PathJobSeeker />} />
              <Route path="/path/business" element={<PathBusiness />} />
              <Route path="/path/clinician" element={<PathClinician />} />
              <Route path="/discovery" element={<Discovery />} />
              <Route path="/share/:id" element={<Share />} />
              <Route path="/newsfeed" element={<Newsfeed />} />
              
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
