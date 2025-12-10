import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Eye, EyeOff, Lock, Mail, Shield } from "lucide-react";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    const checkAdmin = async () => {
      if (!loading && user) {
        const { data } = await supabase.rpc('has_role', {
          _user_id: user.id,
          _role: 'admin'
        });
        if (data) {
          navigate("/admin");
        }
      }
    };
    checkAdmin();
  }, [user, loading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }

    setIsLoading(true);

    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        toast.error("Invalid email or password");
        return;
      }

      // Check if user is admin
      const { data: isAdmin } = await supabase.rpc('has_role', {
        _user_id: authData.user.id,
        _role: 'admin'
      });

      if (!isAdmin) {
        await supabase.auth.signOut();
        toast.error("Access denied. Admin privileges required.");
        return;
      }

      toast.success("Welcome back, Admin!");
      navigate("/admin");
    } catch (error) {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
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
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 right-20 w-96 h-96 bg-secondary rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-secondary rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        <div className="text-center mb-8">
          <Shield className="h-12 w-12 text-secondary mx-auto mb-4" />
          <h1 className="font-serif text-3xl font-semibold text-cream">Admin Portal</h1>
          <p className="text-cream/60 mt-2">The Leader's Row</p>
        </div>

        <div className="bg-card rounded-2xl p-8 shadow-elevated">
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            Admin Login
          </h2>
          <p className="text-muted-foreground mb-6">
            Sign in to manage enrollments and resources
          </p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
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

            <Button 
              type="submit" 
              variant="gold" 
              size="lg" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </div>

        <div className="text-center mt-6">
          <a href="/" className="text-cream/60 hover:text-cream text-sm transition-colors">
            ← Back to The Leader's Row
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
