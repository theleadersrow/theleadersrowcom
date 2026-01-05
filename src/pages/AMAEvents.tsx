import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, Users, CheckCircle, MessageSquare, HelpCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What is the Monthly AMA?",
    answer: "The Monthly AMA (Ask Me Anything) is a live, interactive Q&A session designed for product managers and career-driven professionals. Each month, you get direct access to career experts who answer your real questions about leveling up, navigating transitions, negotiating offers, and accelerating your growth."
  },
  {
    question: "Who is this for?",
    answer: "This is for product managers, aspiring PMs, and professionals in transition who want candid, personalized guidance. Whether you're stuck at a level, preparing for interviews, or unsure how to position yourself—this session is built for you."
  },
  {
    question: "What kind of questions can I ask?",
    answer: "Anything career-related! Common topics include: breaking into senior/principal roles, negotiating compensation, navigating difficult stakeholders, building executive presence, switching industries, and preparing for high-stakes interviews."
  },
  {
    question: "How is this different from other webinars?",
    answer: "This isn't a lecture. It's a live, unscripted conversation where your questions drive the session. You get real answers to real problems—not generic advice. Plus, you'll hear from peers facing similar challenges."
  },
  {
    question: "When does the AMA happen?",
    answer: "The next AMA is January 21, 2026. Sessions take place on the 3rd Wednesday of every month, from 7-9pm CST. You'll receive the Zoom link via email 24 hours before the event."
  },
  {
    question: "What if I can't attend live?",
    answer: "This is a live-only experience. We do not send recordings after the event. If you can't make it, you can register for the next month's session."
  },
  {
    question: "Can I submit my question in advance?",
    answer: "Yes! When you register, you can submit a question in advance. This helps us prioritize topics and ensures your question gets addressed during the session."
  },
];

const AMAEvents = () => {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    currentRole: "",
    question: "",
  });

  const nextEvent = {
    title: "Monthly AMA (Ask Me Anything): Career Acceleration",
    date: "January 21, 2026",
    recurring: "3rd Wednesday of Every Month",
    time: "7-9pm CST",
    description: "A live, no-fluff Q&A session where you get direct answers to your toughest career questions—from leveling up and negotiating offers to navigating transitions and building executive presence.",
  };

  // Check for successful payment
  useEffect(() => {
    if (searchParams.get("success") === "true") {
      setIsRegistered(true);
      toast({
        title: "Payment Successful!",
        description: "You're registered for the next AMA event. Check your email for details.",
      });
    } else if (searchParams.get("canceled") === "true") {
      toast({
        title: "Payment Canceled",
        description: "Your payment was canceled. You can try again when ready.",
        variant: "destructive",
      });
    }
  }, [searchParams, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-ama-checkout', {
        body: {
          email: formData.email,
          fullName: formData.fullName,
          currentRole: formData.currentRole,
          question: formData.question,
          eventDate: "2026-01-21",
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast({
        title: "Checkout Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  if (isRegistered) {
    return (
      <Layout>
        <section className="pt-32 pb-20 min-h-screen bg-gradient-to-b from-primary/5 to-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-xl mx-auto text-center">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <h1 className="text-3xl font-serif font-bold text-foreground mb-4">
                You're Registered!
              </h1>
              <p className="text-muted-foreground mb-8">
                We've sent a confirmation email with all the details for the upcoming AMA event. 
                You'll receive the Zoom link 24 hours before the session.
              </p>
              <div className="bg-card border border-border rounded-xl p-6 text-left">
                <h3 className="font-semibold text-foreground mb-4">{nextEvent.title}</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {nextEvent.date}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {nextEvent.time}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero Section */}
      <section className="pt-32 pb-12 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-secondary/10 text-secondary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <MessageSquare className="h-4 w-4" />
              Monthly Live Event
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-6">
              Monthly AMA (Ask Me Anything): Career Acceleration
            </h1>
            <p className="text-lg text-muted-foreground mb-4">
              Get unstuck. Get answers. Get ahead.
            </p>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto">
              A live, unscripted Q&A session where you ask the tough career questions—and get real, personalized answers from experts who've been there.
            </p>
          </div>
        </div>
      </section>

      {/* Event Details & Registration */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Event Info */}
              <div>
                <h2 className="text-2xl font-serif font-bold text-foreground mb-6">
                  Next Session
                </h2>
                <div className="bg-card border border-border rounded-2xl p-6 mb-6">
                  <h3 className="text-xl font-semibold text-foreground mb-4">
                    {nextEvent.title}
                  </h3>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Calendar className="h-5 w-5 text-secondary" />
                      <div>
                        <span className="font-medium text-foreground">{nextEvent.date}</span>
                        <span className="text-sm block text-muted-foreground">{nextEvent.recurring}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Clock className="h-5 w-5 text-secondary" />
                      <span>{nextEvent.time}</span>
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Users className="h-5 w-5 text-secondary" />
                      <span>Limited spots available</span>
                    </div>
                  </div>
                  <p className="text-muted-foreground">
                    {nextEvent.description}
                  </p>
                </div>

              </div>

              {/* Registration Form */}
              <div>
                <h2 className="text-2xl font-serif font-bold text-foreground mb-6">
                  Register Now
                </h2>
                <div className="bg-card border border-border rounded-2xl p-6">
                  <div className="text-center mb-6">
                    <span className="text-3xl font-bold text-foreground">$20</span>
                    <span className="text-muted-foreground ml-2">/ session</span>
                  </div>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        required
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        placeholder="john@example.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="currentRole">Current Role</Label>
                      <Input
                        id="currentRole"
                        value={formData.currentRole}
                        onChange={(e) => setFormData({ ...formData, currentRole: e.target.value })}
                        required
                        placeholder="Senior Product Manager"
                      />
                    </div>
                    <div>
                      <Label htmlFor="question">
                        Submit a Question in Advance (optional)
                      </Label>
                      <Textarea
                        id="question"
                        value={formData.question}
                        onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                        placeholder="What would you like to ask during the session?"
                        rows={3}
                      />
                    </div>
                    <Button 
                      type="submit" 
                      variant="gold" 
                      size="lg" 
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Processing..." : "Register"}
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      Zoom link will be sent 24 hours before the event.
                    </p>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 text-secondary mb-4">
                <HelpCircle className="h-5 w-5" />
                <span className="font-medium">FAQ</span>
              </div>
              <h2 className="text-3xl font-serif font-bold text-foreground">
                Frequently Asked Questions
              </h2>
            </div>
            
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`}
                  className="bg-card border border-border rounded-xl px-6"
                >
                  <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default AMAEvents;
