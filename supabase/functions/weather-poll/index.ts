import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const OPENWEATHER_API_KEY = Deno.env.get("OPENWEATHER_API_KEY")!;

const admin = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

async function fetchTempC(lat: number, lon: number): Promise<{ tempC: number; raw: any } | null> {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${OPENWEATHER_API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) {
    console.error("OpenWeather fetch failed", res.status, await res.text());
    return null;
  }
  const raw = await res.json();
  const tempC = raw?.main?.temp;
  if (typeof tempC !== "number") return null;
  return { tempC, raw };
}

function classify(tempC: number, minC: number | null, maxC: number | null): "ok" | "high" | "low" {
  if (maxC != null && tempC > maxC) return "high";
  if (minC != null && tempC < minC) return "low";
  return "ok";
}

async function dispatch(eventType: string, payload: Record<string, unknown>) {
  await admin.rpc("dispatch_notification_event", {
    _event_type: eventType,
    _payload: payload,
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { data: companies } = await admin
      .from("companies")
      .select("id, name, temp_min_c, temp_max_c, temp_unit, weather_alerts_enabled")
      .eq("weather_alerts_enabled", true);

    let processed = 0;
    let alerts = 0;

    for (const c of companies ?? []) {
      const { data: locs } = await admin
        .from("locations")
        .select("id, name, latitude, longitude, weather_alerts_enabled")
        .eq("company_id", c.id)
        .eq("weather_alerts_enabled", true)
        .not("latitude", "is", null)
        .not("longitude", "is", null);

      for (const loc of locs ?? []) {
        processed++;
        const reading = await fetchTempC(Number(loc.latitude), Number(loc.longitude));
        if (!reading) continue;

        await admin.from("weather_readings").insert({
          company_id: c.id,
          location_id: loc.id,
          temperature_c: reading.tempC,
          raw: reading.raw,
        });

        const kind = classify(
          reading.tempC,
          c.temp_min_c != null ? Number(c.temp_min_c) : null,
          c.temp_max_c != null ? Number(c.temp_max_c) : null,
        );

        const { data: prev } = await admin
          .from("weather_alert_state")
          .select("last_kind")
          .eq("location_id", loc.id)
          .maybeSingle();

        const previousKind = prev?.last_kind ?? "ok";
        const changed = previousKind !== kind;

        await admin
          .from("weather_alert_state")
          .upsert({
            location_id: loc.id,
            company_id: c.id,
            last_kind: kind,
            last_temperature_c: reading.tempC,
            last_alert_at: changed ? new Date().toISOString() : prev ? undefined : new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (changed && kind !== "ok") {
          alerts++;
          await dispatch("weather_alert", {
            company_id: c.id,
            location_id: loc.id,
            location_name: loc.name,
            kind,
            temperature_c: reading.tempC,
            unit: c.temp_unit ?? "F",
            min_c: c.temp_min_c,
            max_c: c.temp_max_c,
          });
        } else if (changed && kind === "ok" && previousKind !== "ok") {
          alerts++;
          await dispatch("weather_alert", {
            company_id: c.id,
            location_id: loc.id,
            location_name: loc.name,
            kind: "recovered",
            temperature_c: reading.tempC,
            unit: c.temp_unit ?? "F",
            min_c: c.temp_min_c,
            max_c: c.temp_max_c,
          });
        }
      }
    }

    return new Response(JSON.stringify({ ok: true, processed, alerts }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("weather-poll error", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});