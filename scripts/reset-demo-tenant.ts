#!/usr/bin/env tsx

import { createAdminClient, ensureDemoCompany, seedDemoTenant } from "./demo-tenant-lib";

async function main() {
 const supabase = createAdminClient();
 const company = await ensureDemoCompany(supabase);
 const companyId = company.id;

 const { error: deleteWorkOrdersError } = await supabase.from("work_orders").delete().eq("company_id", companyId);
 if (deleteWorkOrdersError) throw deleteWorkOrdersError;

 const { error: deleteAssetsError } = await supabase.from("assets").delete().eq("company_id", companyId);
 if (deleteAssetsError) throw deleteAssetsError;

 const result = await seedDemoTenant(supabase, companyId);
 console.log(`Reset demo tenant '${company.name}' (${companyId}) and reseeded ${result.assetCount} assets + ${result.workOrderCount} work orders.`);
}

main().catch((error) => {
 console.error(error);
 process.exit(1);
});
