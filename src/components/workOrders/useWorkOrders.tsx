
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { WorkOrderWithRelations } from "@/types/workOrders";

export const useWorkOrders = () => {
  const { toast } = useToast();
  const [filters, setFilters] = useState({
    searchQuery: "",
    statusFilter: "all" as string | "all",
    priorityFilter: "all" as string | "all"
  });

  const { data: workOrders, isLoading, error, refetch } = useQuery({
    queryKey: ["workOrders", filters],
    queryFn: async () => {
      let query = supabase
        .from("work_orders")
        .select(`
          *,
          asset:assets(*),
          assignee:profiles!work_orders_assigned_to_fkey(*),
          creator:profiles!work_orders_created_by_fkey(*)
        `);
      
      // Apply filters if they are set
      if (filters.statusFilter !== "all") {
        query = query.eq('status', filters.statusFilter);
      }
      
      if (filters.priorityFilter !== "all") {
        query = query.eq('priority', filters.priorityFilter);
      }
      
      // Always sort by creation date
      query = query.order("created_at", { ascending: false });

      const { data, error } = await query;
      if (error) throw error;
      
      // Apply search filter client-side if needed
      if (filters.searchQuery && filters.searchQuery.trim() !== "") {
        const search = filters.searchQuery.toLowerCase();
        return (data as WorkOrderWithRelations[]).filter(wo => 
          wo.title?.toLowerCase().includes(search) || 
          wo.description?.toLowerCase().includes(search) ||
          wo.asset?.name?.toLowerCase().includes(search) ||
          `${wo.assignee?.first_name || ''} ${wo.assignee?.last_name || ''}`.toLowerCase().includes(search)
        );
      }
      
      return data as WorkOrderWithRelations[];
    },
  });

  if (error) {
    toast({
      title: "Error loading work orders",
      description: (error as Error).message || "An error occurred",
      variant: "destructive"
    });
  }

  const updateFilters = (newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const resetFilters = () => {
    setFilters({
      searchQuery: "",
      statusFilter: "all",
      priorityFilter: "all"
    });
  };

  return {
    workOrders: workOrders || [],
    isLoading,
    error,
    refetch,
    filters,
    updateFilters,
    resetFilters
  };
};
