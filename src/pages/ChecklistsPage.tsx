
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Search, ListChecks, Calendar, User } from "lucide-react";
import { checklistService } from "@/services/checklistService";
import { ChecklistTypes } from "@/types/checklists";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { format } from "date-fns";

const ChecklistsPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const { data: checklists = [], isLoading } = useQuery({
    queryKey: ["checklists"],
    queryFn: checklistService.getChecklists,
  });

  const filteredChecklists = checklists.filter(checklist => {
    const matchesSearch = checklist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      checklist.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || checklist.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const getTypeColor = (type: string) => {
    switch(type) {
      case 'safety': return 'bg-red-100 text-red-800';
      case 'equipment': return 'bg-blue-100 text-blue-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'quality': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="text-center py-12">Loading checklists...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Checklists</h1>
            <p className="text-gray-500 dark:text-gray-400">Create and manage checklist templates</p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => navigate("/checklists/submissions")}
              variant="outline"
            >
              <Calendar className="mr-2 h-4 w-4" />
              View Submissions
            </Button>
            <Button onClick={() => navigate("/checklists/new")}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Checklist
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search checklists..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {ChecklistTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Checklists Grid */}
        {filteredChecklists.length === 0 ? (
          <div className="text-center py-12">
            <ListChecks className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              {checklists.length === 0 ? "No checklists yet" : "No checklists match your search"}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {checklists.length === 0 
                ? "Create your first checklist template to get started"
                : "Try adjusting your search or filter criteria"
              }
            </p>
            {checklists.length === 0 && (
              <Button onClick={() => navigate("/checklists/new")}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create First Checklist
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredChecklists.map((checklist) => (
              <Card 
                key={checklist.id} 
                className="p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/checklists/${checklist.id}`)}
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-semibold text-lg">{checklist.name}</h3>
                  <Badge className={getTypeColor(checklist.type)}>
                    {ChecklistTypes.find(t => t.value === checklist.type)?.label || checklist.type}
                  </Badge>
                </div>
                
                {checklist.description && (
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                    {checklist.description}
                  </p>
                )}

                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <ListChecks className="h-4 w-4" />
                    <span>{checklist.items?.length || 0} items</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{format(new Date(checklist.created_at), "MMM d, yyyy")}</span>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/checklists/${checklist.id}/submit`);
                    }}
                  >
                    Fill Out
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/checklists/${checklist.id}/edit`);
                    }}
                  >
                    Edit
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ChecklistsPage;
