import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import The200KMethod from "./pages/EntryToFaang";
import WeeklyEdge from "./pages/LevelUpWeekly";
import Register from "./pages/Register";
import Contact from "./pages/Contact";
import Newsletter from "./pages/Newsletter";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import BookCall from "./pages/BookCall";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/200k-method" element={<The200KMethod />} />
          <Route path="/weekly-edge" element={<WeeklyEdge />} />
          <Route path="/register" element={<Register />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/newsletter" element={<Newsletter />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/book-call" element={<BookCall />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
