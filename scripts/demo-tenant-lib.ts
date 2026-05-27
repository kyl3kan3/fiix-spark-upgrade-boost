import { createClient } from "@supabase/supabase-js";

type Priority = "low" | "medium" | "high";
type Status = "open" | "in_progress" | "completed";

export const DEMO_COMPANY_NAME = "Demo Ops - Manufacturing & Facilities";

const assets = [
 "HVAC Unit 4",
 "Conveyor Belt Line B",
 "Boiler Pump A2",
 "Air Compressor C1",
 "Cooling Tower 2",
 "Dock Door Motor 3",
 "Packaging Robot R7",
 "Generator G1",
 "Forklift Bay Charger 5",
 "Water Treatment Skid 1",
 "Chiller Plant South",
 "Fire Pump Controller",
 "Paint Booth Exhaust Fan",
 "CNC Mill #12",
 "Hydraulic Press 4",
 "Warehouse RTU 6",
 "Air Handler AHU-3",
 "Maintenance Cage Lift",
 "Dust Collector DC-2",
 "Main Switchgear Panel",
 "Emergency Lighting Panel",
 "Loading Conveyor A",
 "Heat Exchanger HX-8",
 "BMS Control Panel",
];

const technicians = ["Alex Rivera", "Jordan Kim", "Sam Carter", "Riley Patel", "Taylor Brooks"];

export const requireEnv = (name: string): string => {
 const value = process.env[name];
 if (!value) throw new Error(`Missing environment variable ${name}`);
 return value;
};

const randomFrom = <T,>(list: T[]): T => list[Math.floor(Math.random() * list.length)];
const randomPriority = (): Priority => randomFrom(["low", "medium", "high"]);
const randomStatus = (): Status => randomFrom(["open", "in_progress", "completed"]);

const plusDays = (days: number): string => {
 const d = new Date();
 d.setDate(d.getDate() + days);
 return d.toISOString();
};

export const createAdminClient = () => {
 const supabaseUrl = requireEnv("SUPABASE_URL");
 const serviceRole = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
 return createClient(supabaseUrl, serviceRole);
};

export const ensureDemoCompany = async (supabase: ReturnType<typeof createAdminClient>) => {
 const { data: company, error: companyError } = await supabase
 .from("companies")
 .upsert({ name: DEMO_COMPANY_NAME }, { onConflict: "name" })
 .select("id,name")
 .single();
 if (companyError || !company) throw companyError ?? new Error("Failed to create/find demo company");
 return company;
};

export const seedDemoTenant = async (supabase: ReturnType<typeof createAdminClient>, companyId: string) => {
 const { data: existingAssets } = await supabase.from("assets").select("id,name").eq("company_id", companyId);
 const assetByName = new Map((existingAssets ?? []).map((a) => [a.name, a.id]));
 const toInsert = assets
 .filter((name) => !assetByName.has(name))
 .map((name) => ({ name, status: "active", company_id: companyId, location: "Demo Site" }));
 if (toInsert.length > 0) {
 const { error } = await supabase.from("assets").insert(toInsert);
 if (error) throw error;
 }
 const { data: assetRows, error: assetError } = await supabase.from("assets").select("id,name").eq("company_id", companyId);
 if (assetError || !assetRows) throw assetError ?? new Error("Failed to fetch seeded assets");
 const assetPool = assetRows.map((a) => ({ id: a.id, name: a.name }));

 const createdBy = requireEnv("DEMO_CREATED_BY_USER_ID");
 const assignedTo = process.env.DEMO_ASSIGNED_TO_USER_ID || null;
 const workOrders = Array.from({ length: 48 }).map((_, idx) => {
 const asset = randomFrom(assetPool);
 return {
 title: `WO ${2000 + idx}: ${asset.name} inspection`,
 description: `Demo work order for ${asset.name} assigned to ${randomFrom(technicians)}.`,
 company_id: companyId,
 asset_id: asset.id,
 priority: randomPriority(),
 status: randomStatus(),
 due_date: plusDays((idx % 14) - 3),
 created_by: createdBy,
 assigned_to: assignedTo,
 };
 });
 const { error: woError } = await supabase.from("work_orders").insert(workOrders);
 if (woError) throw woError;
 return { assetCount: assetPool.length, workOrderCount: workOrders.length };
};
