#!/usr/bin/env tsx

import { createAdminClient, ensureDemoCompany } from "./demo-tenant-lib";

async function main() {
 const supabase = createAdminClient();
 const company = await ensureDemoCompany(supabase);
 const companyId = company.id;

 const [{ count: assetCount, error: assetError }, { count: workOrderCount, error: workOrderError }] = await Promise.all([
 supabase.from("assets").select("id", { count: "exact", head: true }).eq("company_id", companyId),
 supabase.from("work_orders").select("id", { count: "exact", head: true }).eq("company_id", companyId),
 ]);

 if (assetError) throw assetError;
 if (workOrderError) throw workOrderError;

 const assets = assetCount ?? 0;
 const workOrders = workOrderCount ?? 0;

 if (assets < 20) throw new Error(`Demo tenant has insufficient assets (${assets}). Expected at least 20.`);
 if (workOrders < 40) throw new Error(`Demo tenant has insufficient work orders (${workOrders}). Expected at least 40.`);

 console.log(`Demo tenant '${company.name}' is ready for homepage tours: assets=${assets}, work_orders=${workOrders}.`);
}

main().catch((error) => {
 console.error(error);
 process.exit(1);
});
