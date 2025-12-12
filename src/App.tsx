import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import The200KMethod from "./pages/EntryToFaang";
import WeeklyEdge from "./pages/LevelUpWeekly";
import Register from "./pages/Register";
import Contact from "./pages/Contact";
import Newsletter from "./pages/Newsletter";
import Guide from "./pages/Guide";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import BookCall from "./pages/BookCall";
import Login from "./pages/Login";
import MemberSignup from "./pages/MemberSignup";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import AdminSignup from "./pages/AdminSignup";
import AdminLogin from "./pages/AdminLogin";
import StrategicBenchmark from "./pages/StrategicBenchmark";
import CareerReport from "./pages/CareerReport";
import Review from "./pages/Review";
import PaymentSuccess from "./pages/PaymentSuccess";
import CancelMembership from "./pages/CancelMembership";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/200k-method" element={<The200KMethod />} />
            <Route path="/weekly-edge" element={<WeeklyEdge />} />
            <Route path="/register" element={<Register />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/newsletter" element={<Newsletter />} />
            <Route path="/guide" element={<Guide />} />
            <Route path="/review" element={<Review />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/book-call" element={<BookCall />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<MemberSignup />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin-signup" element={<AdminSignup />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/career-coach" element={<StrategicBenchmark />} />
            <Route path="/career-report" element={<CareerReport />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/cancel-membership" element={<CancelMembership />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
