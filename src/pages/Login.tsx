import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react";

type AuthMode = "login" | "signup" | "reset";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<AuthMode>("signup");
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !fullName) {
      toast.error("Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            full_name: fullName.trim(),
          },
        },
      });

      if (error) {
        if (error.message.includes("already registered")) {
          toast.error("This email is already registered. Please sign in.");
          setMode("login");
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success("Account created! You can now sign in.");
        setMode("login");
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          toast.error("Invalid email or password. Please try again.");
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success("Welcome back!");
        navigate("/dashboard");
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/dashboard`,
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Password reset email sent! Check your inbox.");
        setMode("login");
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getSubmitHandler = () => {
    switch (mode) {
      case "signup":
        return handleSignup;
      case "reset":
        return handlePasswordReset;
      default:
        return handleLogin;
    }
  };

  const getTitle = () => {
    switch (mode) {
      case "signup":
        return "Create Account";
      case "reset":
        return "Reset Password";
      default:
        return "Welcome Back";
    }
  };

  const getDescription = () => {
    switch (mode) {
      case "signup":
        return "Sign up to access your programs and resources";
      case "reset":
        return "Enter your email to receive a password reset link";
      default:
        return "Sign in to access your programs and resources";
    }
  };

  const getButtonText = () => {
    if (isLoading) return "Please wait...";
    switch (mode) {
      case "signup":
        return "Create Account";
      case "reset":
        return "Send Reset Link";
      default:
        return "Sign In";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <div className="animate-pulse text-cream">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy relative overflow-hidden flex items-center justify-center">
      {/* Background effects */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 right-20 w-96 h-96 bg-secondary rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-secondary rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <a href="/" className="inline-block">
            <h1 className="font-serif text-3xl font-semibold text-cream">The Leader's Row</h1>
          </a>
          <p className="text-cream/60 mt-2">Member Portal</p>
        </div>

        {/* Login Card */}
        <div className="bg-card rounded-2xl p-8 shadow-elevated">
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            {getTitle()}
          </h2>
          <p className="text-muted-foreground mb-6">
            {getDescription()}
          </p>

          <form onSubmit={getSubmitHandler()} className="space-y-5">
            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-10 h-12"
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12"
                  required
                />
              </div>
            </div>

            {mode !== "reset" && (
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={mode === "signup" ? "Create a password (min 6 chars)" : "Enter your password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}

            <Button 
              type="submit" 
              variant="gold" 
              size="lg" 
              className="w-full"
              disabled={isLoading}
            >
              {getButtonText()}
            </Button>
          </form>

          <div className="mt-6 space-y-3 text-center">
            {mode === "login" && (
              <button
                onClick={() => setMode("reset")}
                className="text-sm text-secondary hover:text-secondary/80 transition-colors block w-full"
              >
                Forgot your password?
              </button>
            )}
            
            <button
              onClick={() => setMode(mode === "signup" ? "login" : "signup")}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {mode === "signup" 
                ? "Already have an account? Sign in" 
                : mode === "reset"
                  ? "Back to login"
                  : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>

        {/* Back to site link */}
        <div className="text-center mt-6">
          <a href="/" className="text-cream/60 hover:text-cream text-sm transition-colors">
            ← Back to The Leader's Row
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;
