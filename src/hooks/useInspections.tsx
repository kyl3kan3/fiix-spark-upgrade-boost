import { useQuery } from "@tanstack/react-query";
import { fetchInspections } from "@/services/inspectionService";

/**
 * Check-ups derived from checklist schedules (upcoming) and checklist
 * submissions (completed). Cached under one query key so the list,
 * detail, and calendar views share a single fetch.
 */
export const useInspections = () => {
 const { data, isLoading, error, refetch } = useQuery({
 queryKey: ["inspections"],
 queryFn: async () => {
 const { data, error } = await fetchInspections();
 if (error) throw error;
 return data;
 },
 });

 return {
 inspections: data || [],
 loading: isLoading,
 error: (error as Error | null) ?? null,
 refreshInspections: refetch,
 };
};
