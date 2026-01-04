import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Building2, CheckCircle, XCircle, AlertTriangle, Lightbulb } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface CompanySpecificViewProps {
  sessionId: string;
  categoryScores: any[];
  answers: any[];
  evaluations: any[];
}

interface CompanyProfile {
  id: string;
  company_name: string;
  display_name: string;
  category_weights: any;
  preferred_answer_style: string | null;
  common_red_flags: string[] | null;
  bar_raiser_expectations: string | null;
  core_values: string[] | null;
}

interface CompanyResult {
  company: string;
  adjusted_overall_score: number;
  category_breakdown: Record<string, { original_score: number; weight: number; weighted_score: number; importance: string }>;
  feedback: {
    company_fit_score: number;
    culture_alignment: string;
    top_culture_matches: string[];
    culture_gaps: string[];
    red_flags_triggered: string[];
    specific_feedback: string;
    interview_tips: string[];
    would_pass_bar: boolean;
    reasoning: string;
  } | null;
}

export function CompanySpecificView({ sessionId, categoryScores, answers, evaluations }: CompanySpecificViewProps) {
  const [companies, setCompanies] = useState<CompanyProfile[]>([]);
  const [results, setResults] = useState<Record<string, CompanyResult>>({});
  const [loadingCompany, setLoadingCompany] = useState<string | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<string>("amazon");

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    const { data } = await supabase.from("company_profiles").select("*");
    if (data) {
      setCompanies(data);
    }
  };

  const analyzeForCompany = async (companyName: string) => {
    const company = companies.find(c => c.company_name === companyName);
    if (!company || results[companyName]) return;

    setLoadingCompany(companyName);
    try {
      const { data, error } = await supabase.functions.invoke("company-specific-scoring", {
        body: {
          sessionId,
          evaluations,
          categoryScores,
          companyProfile: company,
          answers
        }
      });

      if (error) throw error;

      setResults(prev => ({
        ...prev,
        [companyName]: data
      }));
    } catch (e) {
      console.error("Company scoring error:", e);
    } finally {
      setLoadingCompany(null);
    }
  };

  useEffect(() => {
    if (companies.length > 0 && !results[selectedCompany]) {
      analyzeForCompany(selectedCompany);
    }
  }, [selectedCompany, companies]);

  const result = results[selectedCompany];
  const company = companies.find(c => c.company_name === selectedCompany);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Company-Specific Analysis
        </CardTitle>
        <CardDescription>
          See how your performance would be evaluated at different companies
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedCompany} onValueChange={setSelectedCompany}>
          <TabsList className="grid grid-cols-5 w-full mb-6">
            {companies.map(c => (
              <TabsTrigger key={c.company_name} value={c.company_name}>
                {c.display_name}
              </TabsTrigger>
            ))}
          </TabsList>

          {companies.map(c => (
            <TabsContent key={c.company_name} value={c.company_name}>
              {loadingCompany === c.company_name ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-muted-foreground">Analyzing for {c.display_name}...</p>
                </div>
              ) : results[c.company_name] ? (
                <div className="space-y-6">
                  {/* Score Overview */}
                  <div className="grid md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="pt-6 text-center">
                        <div className="text-4xl font-bold text-primary mb-2">
                          {results[c.company_name].adjusted_overall_score}
                        </div>
                        <p className="text-sm text-muted-foreground">{c.display_name} Adjusted Score</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="pt-6 text-center">
                        <div className={`text-2xl font-bold mb-2 ${
                          results[c.company_name].feedback?.culture_alignment === "strong" ? "text-green-600" :
                          results[c.company_name].feedback?.culture_alignment === "moderate" ? "text-amber-600" : "text-red-600"
                        }`}>
                          {results[c.company_name].feedback?.culture_alignment || "N/A"}
                        </div>
                        <p className="text-sm text-muted-foreground">Culture Alignment</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="pt-6 text-center">
                        <div className={`text-2xl font-bold mb-2 ${
                          results[c.company_name].feedback?.would_pass_bar ? "text-green-600" : "text-red-600"
                        }`}>
                          {results[c.company_name].feedback?.would_pass_bar ? "Yes" : "Not Yet"}
                        </div>
                        <p className="text-sm text-muted-foreground">Would Pass Bar?</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Category Weights */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Category Importance at {c.display_name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {Object.entries(results[c.company_name].category_breakdown || {}).map(([cat, data]) => (
                          <div key={cat}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="flex items-center gap-2">
                                {cat.replace("_", " ")}
                                <Badge variant="outline" className={
                                  data.importance === "critical" ? "border-red-500 text-red-600" :
                                  data.importance === "less_important" ? "border-gray-400 text-gray-500" : ""
                                }>
                                  {data.importance}
                                </Badge>
                              </span>
                              <span>{data.weighted_score}/100</span>
                            </div>
                            <Progress value={data.weighted_score} />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Culture Fit Details */}
                  {results[c.company_name].feedback && (
                    <div className="grid md:grid-cols-2 gap-4">
                      <Card className="bg-green-500/5">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base text-green-700 flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" />
                            Culture Matches
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2 text-sm">
                            {results[c.company_name].feedback?.top_culture_matches?.map((m, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                {m}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>

                      <Card className="bg-amber-500/5">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base text-amber-700 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4" />
                            Culture Gaps
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2 text-sm">
                            {results[c.company_name].feedback?.culture_gaps?.map((g, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <XCircle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                {g}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Interview Tips */}
                  {results[c.company_name].feedback?.interview_tips && (
                    <Card className="bg-primary/5">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Lightbulb className="h-4 w-4 text-primary" />
                          {c.display_name} Interview Tips
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2 text-sm">
                          {results[c.company_name].feedback?.interview_tips?.map((tip, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <Lightbulb className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                              {tip}
                            </li>
                          ))}
                        </ul>
                        <p className="mt-4 text-muted-foreground italic">
                          "{results[c.company_name].feedback?.specific_feedback}"
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <Button onClick={() => analyzeForCompany(c.company_name)}>
                    Analyze for {c.display_name}
                  </Button>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
