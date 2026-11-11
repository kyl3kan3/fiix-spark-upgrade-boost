export interface LocationNode { id: string; parent_id?: string | null; }
export function canReparent(locations: LocationNode[], id: string, parentId: string | null | undefined): boolean {
 const byId = new Map(locations.map(location => [location.id, location]));
 const seen = new Set([id]);
 let cursor = parentId;
 while (cursor) {
   if (seen.has(cursor) || !byId.has(cursor)) return false;
   seen.add(cursor);
   cursor = byId.get(cursor)?.parent_id;
 }
 return true;
}
export function locationPath<T extends LocationNode & { name: string }>(locations: T[], id: string): string {
 const byId = new Map(locations.map(location => [location.id, location]));
 const seen = new Set<string>();
 const names: string[] = [];
 let cursor: string | null | undefined = id;
 while (cursor) {
   if (seen.has(cursor)) throw new Error("Location hierarchy contains a cycle");
   seen.add(cursor);
   const location = byId.get(cursor);
   if (!location) break;
   names.unshift(location.name);
   cursor = location.parent_id;
 }
 return names.join(" > ");
}
