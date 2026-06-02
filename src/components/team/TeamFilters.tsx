import React from "react";
import { Filter, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import FilterBar, { FILTER_CONTROL_WIDTH } from "@/components/shell/FilterBar";

interface TeamFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  roleFilter: string;
  setRoleFilter: (filter: string) => void;
}

const TeamFilters: React.FC<TeamFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  roleFilter,
  setRoleFilter,
}) => {
  return (
    <FilterBar className="mb-6">
      <div className="flex-1 relative min-w-0">
        <Input
          placeholder="Search by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
        <Users className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
      </div>
      <Select value={roleFilter} onValueChange={setRoleFilter}>
        <SelectTrigger className={FILTER_CONTROL_WIDTH}>
          <Filter className="h-4 w-4 mr-2" />
          <SelectValue placeholder="Filter by role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Roles</SelectItem>
          <SelectItem value="administrator">Administrators</SelectItem>
          <SelectItem value="manager">Managers</SelectItem>
          <SelectItem value="technician">Technicians</SelectItem>
          <SelectItem value="viewer">Viewers</SelectItem>
        </SelectContent>
      </Select>
    </FilterBar>
  );
};

export default TeamFilters;
