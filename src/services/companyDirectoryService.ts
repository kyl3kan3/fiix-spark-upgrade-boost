import { supabase } from "@/integrations/supabase/client";
import type { Profile } from "@/types/workOrders";
export type DirectoryPerson = Pick<Profile, "id" | "first_name" | "last_name">;

/** Read names from the tenant-scoped directory, never a peer's private profile. */
export async function fetchCompanyPeople(): Promise<DirectoryPerson[]> {
 const { data, error } = await supabase.rpc("get_company_directory");
 if (error) throw error;
 return (data ?? []).map(({ id, first_name, last_name }) => ({ id, first_name, last_name }));
}

export async function attachWorkOrderPeople<T extends { assigned_to?: string | null; created_by?: string | null }>(rows: T[]) {
 if (!rows.length) return [];
 const people = new Map((await fetchCompanyPeople()).map(person => [person.id, person]));
 return rows.map(row => ({ ...row,
   assignee: row.assigned_to ? people.get(row.assigned_to) ?? null : null,
   creator: row.created_by ? people.get(row.created_by) ?? null : null,
 }));
}
