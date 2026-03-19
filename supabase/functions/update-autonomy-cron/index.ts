import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Update Autonomy Cron — Re-registers pg_cron jobs based on admin schedule settings.
 * 
 * Reads autonomy_schedule from site_settings, converts local hours to UTC,
 * and updates the cron jobs via register_flowpilot_cron_v2.
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function localHourToUtc(localHour: number, timezone: string): number {
  // Create a date in the given timezone at the specified hour
  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T${String(localHour).padStart(2, '0')}:00:00`;
  
  // Parse in the target timezone
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false,
  });

  // Get UTC offset by comparing local time string with UTC
  const localDate = new Date(dateStr);
  const utcParts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'UTC',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false,
  }).formatToParts(localDate);
  
  const tzParts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false,
  }).formatToParts(localDate);
  
  const getHour = (parts: Intl.DateTimeFormatPart[]) => {
    const h = parts.find(p => p.type === 'hour')?.value;
    return h ? parseInt(h, 10) : 0;
  };

  // More reliable: use a known reference point
  // Create a Date for today at localHour in the timezone, then read UTC hour
  const refDate = new Date();
  // Set to a reference date to avoid DST edge cases
  refDate.setUTCFullYear(refDate.getFullYear(), refDate.getMonth(), refDate.getDate());
  refDate.setUTCHours(12, 0, 0, 0); // noon UTC as baseline
  
  // Get the timezone offset in hours
  const utcStr = refDate.toLocaleString('en-US', { timeZone: 'UTC', hour: '2-digit', hour12: false });
  const localStr = refDate.toLocaleString('en-US', { timeZone: timezone, hour: '2-digit', hour12: false });
  const utcH = parseInt(utcStr, 10);
  const localH = parseInt(localStr, 10);
  const offsetHours = localH - utcH; // positive = ahead of UTC
  
  // Convert: UTC hour = local hour - offset
  let utcHour = (localHour - offsetHours) % 24;
  if (utcHour < 0) utcHour += 24;
  return utcHour;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("SUPABASE_PUBLISHABLE_KEY") || "";
  const supabase = createClient(supabaseUrl, serviceKey);

  try {
    // 1. Read autonomy_schedule from site_settings
    const { data: settingsRow } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "autonomy_schedule")
      .maybeSingle();

    const settings = settingsRow?.value as any || {
      timezone: "Europe/Stockholm",
      heartbeatEnabled: true,
      heartbeatHours: [0, 12],
      briefingEnabled: true,
      briefingHour: 8,
      learnEnabled: true,
      learnHour: 3,
    };

    const tz = settings.timezone || "UTC";
    const authHeader = JSON.stringify({
      "Content-Type": "application/json",
      "Authorization": `Bearer ${anonKey}`,
    });

    const results: Record<string, string> = {};

    // 2. Heartbeat cron
    // First unschedule existing
    await supabase.rpc("exec_sql_if_exists", { sql: "SELECT cron.unschedule('flowpilot-heartbeat')" }).catch(() => {});
    try { 
      const { error } = await supabase.from("_cron_unschedule" as any).select("*").limit(0); // noop
    } catch {}

    // Use direct SQL via the DB function approach
    if (settings.heartbeatEnabled && settings.heartbeatHours?.length) {
      const utcHours = settings.heartbeatHours.map((h: number) => localHourToUtc(h, tz));
      const cronExpr = `0 ${utcHours.join(",")} * * *`;
      
      // Unschedule + reschedule via register function
      // We need to drop and recreate — use the RPC
      const unscheduleResult = await supabase.rpc("unschedule_cron_job", { p_jobname: "flowpilot-heartbeat" }).catch(() => null);
      
      const scheduleBody = JSON.stringify({ time: new Date().toISOString() });
      const { error } = await supabase.rpc("schedule_cron_job", {
        p_jobname: "flowpilot-heartbeat",
        p_schedule: cronExpr,
        p_url: `${supabaseUrl}/functions/v1/flowpilot-heartbeat`,
        p_headers: authHeader,
        p_body: scheduleBody,
      });
      
      results.heartbeat = error ? `error: ${error.message}` : `${cronExpr} (UTC hours: ${utcHours.join(",")})`;
    } else {
      await supabase.rpc("unschedule_cron_job", { p_jobname: "flowpilot-heartbeat" }).catch(() => null);
      results.heartbeat = "disabled";
    }

    // 3. Briefing cron
    if (settings.briefingEnabled) {
      const utcHour = localHourToUtc(settings.briefingHour, tz);
      const cronExpr = `0 ${utcHour} * * *`;
      
      await supabase.rpc("unschedule_cron_job", { p_jobname: "flowpilot-daily-briefing" }).catch(() => null);
      const { error } = await supabase.rpc("schedule_cron_job", {
        p_jobname: "flowpilot-daily-briefing",
        p_schedule: cronExpr,
        p_url: `${supabaseUrl}/functions/v1/flowpilot-briefing`,
        p_headers: authHeader,
        p_body: JSON.stringify({ source: "cron" }),
      });
      results.briefing = error ? `error: ${error.message}` : `${cronExpr} (local ${settings.briefingHour}:00 ${tz})`;
    } else {
      await supabase.rpc("unschedule_cron_job", { p_jobname: "flowpilot-daily-briefing" }).catch(() => null);
      results.briefing = "disabled";
    }

    // 4. Learn cron
    if (settings.learnEnabled) {
      const utcHour = localHourToUtc(settings.learnHour, tz);
      const cronExpr = `0 ${utcHour} * * *`;
      
      await supabase.rpc("unschedule_cron_job", { p_jobname: "flowpilot-learn" }).catch(() => null);
      const { error } = await supabase.rpc("schedule_cron_job", {
        p_jobname: "flowpilot-learn",
        p_schedule: cronExpr,
        p_url: `${supabaseUrl}/functions/v1/flowpilot-learn`,
        p_headers: authHeader,
        p_body: JSON.stringify({ time: new Date().toISOString() }),
      });
      results.learn = error ? `error: ${error.message}` : `${cronExpr} (local ${settings.learnHour}:00 ${tz})`;
    } else {
      await supabase.rpc("unschedule_cron_job", { p_jobname: "flowpilot-learn" }).catch(() => null);
      results.learn = "disabled";
    }

    console.log("[update-autonomy-cron] Results:", results);

    return new Response(
      JSON.stringify({ success: true, results, timezone: tz }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("[update-autonomy-cron] Error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
