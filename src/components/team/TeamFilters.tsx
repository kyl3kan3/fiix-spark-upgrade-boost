
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
    <div className="mb-6 flex items-center gap-4">
      <div className="flex-1 relative">
        <Input
          placeholder="Search by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
        <Users className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
      </div>
      <Select value={roleFilter} onValueChange={setRoleFilter}>
        <SelectTrigger className="w-[180px]">
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
    </div>
  );
};

export default TeamFilters;
