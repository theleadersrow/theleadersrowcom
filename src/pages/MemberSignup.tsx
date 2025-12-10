import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Eye, EyeOff, Lock, Mail, User, Key } from "lucide-react";

const MemberSignup = () => {
  const [enrollmentCode, setEnrollmentCode] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [enrollmentId, setEnrollmentId] = useState<string | null>(null);
  const navigate = useNavigate();

  const verifyEnrollmentCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!enrollmentCode.trim()) {
      toast.error("Please enter your enrollment code");
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from("enrollments")
        .select("id, email, user_id")
        .eq("enrollment_code", enrollmentCode.trim().toUpperCase())
        .maybeSingle();

      if (error) {
        toast.error("Error verifying code. Please try again.");
        return;
      }

      if (!data) {
        toast.error("Invalid enrollment code. Please check and try again.");
        return;
      }

      if (data.user_id) {
        toast.error("This enrollment code has already been used. Please login instead.");
        navigate("/login");
        return;
      }

      setEnrollmentId(data.id);
      if (data.email) {
        setEmail(data.email);
      }
      setIsVerified(true);
      toast.success("Enrollment verified! Please complete your registration.");
    } catch (error) {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

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
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            full_name: fullName.trim(),
          },
        },
      });

      if (authError) {
        if (authError.message.includes("already registered")) {
          toast.error("This email is already registered. Please login instead.");
          navigate("/login");
        } else {
          toast.error(authError.message);
        }
        return;
      }

      if (authData.user) {
        // Link enrollment to user
        const { error: updateError } = await supabase
          .from("enrollments")
          .update({ user_id: authData.user.id })
          .eq("id", enrollmentId);

        if (updateError) {
          console.error("Error linking enrollment:", updateError);
        }

        toast.success("Account created successfully! You can now login.");
        navigate("/login");
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

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
          <p className="text-cream/60 mt-2">Member Registration</p>
        </div>

        {/* Card */}
        <div className="bg-card rounded-2xl p-8 shadow-elevated">
          {!isVerified ? (
            <>
              <h2 className="text-2xl font-semibold text-foreground mb-2">
                Enter Your Enrollment Code
              </h2>
              <p className="text-muted-foreground mb-6">
                You should have received an enrollment code via email when you registered for a program.
              </p>

              <form onSubmit={verifyEnrollmentCode} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="enrollmentCode">Enrollment Code</Label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="enrollmentCode"
                      type="text"
                      placeholder="TLR-XXXXXXXX"
                      value={enrollmentCode}
                      onChange={(e) => setEnrollmentCode(e.target.value.toUpperCase())}
                      className="pl-10 h-12 uppercase"
                      required
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  variant="gold" 
                  size="lg" 
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Verifying..." : "Verify Code"}
                </Button>
              </form>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-semibold text-foreground mb-2">
                Complete Registration
              </h2>
              <p className="text-muted-foreground mb-6">
                Create your account to access your programs and resources.
              </p>

              <form onSubmit={handleSignup} className="space-y-5">
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

                <div className="space-y-2">
                  <Label htmlFor="password">Create Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Min 6 characters"
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
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
              </form>
            </>
          )}

          <div className="mt-6 text-center">
            <a
              href="/login"
              className="text-sm text-secondary hover:text-secondary/80 transition-colors"
            >
              Already have an account? Sign in
            </a>
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

export default MemberSignup;
