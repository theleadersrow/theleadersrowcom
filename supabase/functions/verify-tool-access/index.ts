import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  console.log(`[VERIFY-TOOL-ACCESS] ${step}`, details ? JSON.stringify(details) : "");
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { accessToken, email, toolType, action } = await req.json();
    logStep("Request received", { action, toolType, hasToken: !!accessToken, hasEmail: !!email });

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Action: Verify access token (magic link click)
    if (action === "verify" && accessToken) {
      const { data: purchase, error } = await supabaseAdmin
        .from("tool_purchases")
        .select("*")
        .eq("access_token", accessToken)
        .eq("status", "active")
        .single();

      if (error || !purchase) {
        logStep("Invalid or expired access token", { error });
        return new Response(
          JSON.stringify({ valid: false, error: "Invalid or expired access link" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        );
      }

      // Check if expired
      const expiresAt = new Date(purchase.expires_at);
      if (expiresAt < new Date()) {
        logStep("Access has expired", { expiresAt: purchase.expires_at });
        return new Response(
          JSON.stringify({ valid: false, error: "Your access has expired", expired: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        );
      }

      // Update usage tracking
      await supabaseAdmin
        .from("tool_purchases")
        .update({
          usage_count: (purchase.usage_count || 0) + 1,
          last_used_at: new Date().toISOString(),
        })
        .eq("id", purchase.id);

      const daysRemaining = Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      
      logStep("Access verified", { 
        toolType: purchase.tool_type, 
        daysRemaining,
        email: purchase.email 
      });

      return new Response(
        JSON.stringify({
          valid: true,
          toolType: purchase.tool_type,
          email: purchase.email,
          expiresAt: purchase.expires_at,
          daysRemaining,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Action: Check access by email
    if (action === "check" && email && toolType) {
      const normalizedEmail = email.toLowerCase().trim();
      logStep("Checking access", { normalizedEmail, toolType });
      
      const { data: purchase, error } = await supabaseAdmin
        .from("tool_purchases")
        .select("*")
        .ilike("email", normalizedEmail)
        .eq("tool_type", toolType)
        .eq("status", "active")
        .order("expires_at", { ascending: false })
        .limit(1)
        .single();

      if (error || !purchase) {
        logStep("No active purchase found", { email, toolType });
        return new Response(
          JSON.stringify({ hasAccess: false }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        );
      }

      // Check if expired
      const expiresAt = new Date(purchase.expires_at);
      if (expiresAt < new Date()) {
        logStep("Access has expired", { email, toolType });
        return new Response(
          JSON.stringify({ hasAccess: false, expired: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        );
      }

      const daysRemaining = Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      
      logStep("Access confirmed", { email, toolType, daysRemaining });

      return new Response(
        JSON.stringify({
          hasAccess: true,
          expiresAt: purchase.expires_at,
          daysRemaining,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action or missing parameters" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
