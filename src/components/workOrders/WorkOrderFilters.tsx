
import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { WorkOrderStatus, WorkOrderPriority } from "@/types/workOrders";

export interface WorkOrderFiltersProps {
  filters: {
    searchQuery: string;
    statusFilter: "all" | WorkOrderStatus;
    priorityFilter: "all" | WorkOrderPriority;
  };
  updateFilters: (filters: Partial<{
    searchQuery: string;
    statusFilter: "all" | WorkOrderStatus;
    priorityFilter: "all" | WorkOrderPriority;
  }>) => void;
  resetFilters: () => void;
}

const WorkOrderFilters: React.FC<WorkOrderFiltersProps> = ({
  filters,
  updateFilters,
  resetFilters
}) => {
  return (
    <div className="p-4">
      <div className="mt-4 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search work orders..."
            className="pl-8"
            value={filters.searchQuery}
            onChange={(e) => updateFilters({ searchQuery: e.target.value })}
          />
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <Select
            value={filters.statusFilter}
            onValueChange={(value) => updateFilters({ statusFilter: value as "all" | WorkOrderStatus })}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          
          <Select
            value={filters.priorityFilter}
            onValueChange={(value) => updateFilters({ priorityFilter: value as "all" | WorkOrderPriority })}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            onClick={resetFilters}
            className="h-10"
          >
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WorkOrderFilters;
