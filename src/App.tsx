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
import RimoHub from "./pages/RimoHub";
import LinkedInSignal from "./pages/LinkedInSignal";
import ResumeSuite from "./pages/ResumeSuite";
import CareerAdvisor from "./pages/CareerAdvisor";
import CareerReport from "./pages/CareerReport";
import Review from "./pages/Review";
import PaymentSuccess from "./pages/PaymentSuccess";
import CancelMembership from "./pages/CancelMembership";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import BetaEvent from "./pages/BetaEvent";
import CareerAdvisorInfo from "./pages/CareerAdvisorInfo";
import InterviewPrep from "./pages/InterviewPrep";
import NotFound from "./pages/NotFound";
import Social from "./pages/Social";
import Speaking from "./pages/Speaking";

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
            <Route path="/career-coach" element={<RimoHub />} />
            <Route path="/strategic-benchmark" element={<StrategicBenchmark />} />
            <Route path="/linkedin-signal" element={<LinkedInSignal />} />
            <Route path="/resume-suite" element={<ResumeSuite />} />
            <Route path="/career-advisor" element={<CareerAdvisor />} />
            <Route path="/career-advisor-info" element={<CareerAdvisorInfo />} />
            <Route path="/career-report" element={<CareerReport />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/cancel-membership" element={<CancelMembership />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/courses/:courseId" element={<CourseDetail />} />
            <Route path="/beta-event" element={<BetaEvent />} />
            <Route path="/interview-prep" element={<InterviewPrep />} />
            <Route path="/social" element={<Social />} />
            <Route path="/speaking" element={<Speaking />} />
            <Route path="/interview-tool" element={<StrategicBenchmark />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
