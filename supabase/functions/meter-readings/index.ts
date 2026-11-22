import { createClient } from "npm:@supabase/supabase-js@2";
import { handleMeterReading } from "./handler.ts";

const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
  auth: { persistSession: false, autoRefreshToken: false },
});

Deno.serve((request) => handleMeterReading(request, (args) => admin.rpc("ingest_meter_reading", args)));
