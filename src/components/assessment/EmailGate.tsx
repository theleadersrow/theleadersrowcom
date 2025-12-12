import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, ArrowRight, Shield, Sparkles } from "lucide-react";

interface EmailGateProps {
  onSubmit: (email: string) => Promise<boolean>;
  isLoading: boolean;
}

export function EmailGate({ onSubmit, isLoading }: EmailGateProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email");
      return;
    }

    const success = await onSubmit(email);
    if (!success) {
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-card rounded-2xl border border-border shadow-elevated p-8 animate-scale-in">
        {/* Icon */}
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Sparkles className="w-8 h-8 text-primary" />
        </div>

        {/* Heading */}
        <h2 className="text-2xl md:text-3xl font-serif font-bold text-center text-foreground mb-3">
          You're Making Great Progress!
        </h2>
        <p className="text-center text-muted-foreground mb-8">
          Enter your email to unlock your full Career Intelligence Report with personalized insights and your 90-day growth plan.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
          
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button
            type="submit"
            className="w-full h-12 text-base"
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Continue Assessment"}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </form>

        {/* Privacy note */}
        <div className="flex items-center justify-center gap-2 mt-6 text-xs text-muted-foreground">
          <Shield className="w-4 h-4" />
          <span>Your data is private and never shared</span>
        </div>

        {/* Benefits */}
        <div className="mt-8 pt-6 border-t border-border">
          <p className="text-sm font-medium text-foreground mb-3">What you'll get:</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">✓</span>
              <span>Your inferred career level vs. target</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">✓</span>
              <span>Skill heatmap with high-ROI gaps</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">✓</span>
              <span>Your blocker archetype & how to overcome it</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">✓</span>
              <span>Personalized 90-day growth plan</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
