#!/usr/bin/env tsx

import { createAdminClient, ensureDemoCompany, seedDemoTenant } from "./demo-tenant-lib";

async function main() {
 const supabase = createAdminClient();
 const company = await ensureDemoCompany(supabase);
 const result = await seedDemoTenant(supabase, company.id);
 console.log(`Seeded demo tenant '${company.name}' (${company.id}) with ${result.assetCount} assets and ${result.workOrderCount} work orders.`);
}

main().catch((error) => {
 console.error(error);
 process.exit(1);
});
