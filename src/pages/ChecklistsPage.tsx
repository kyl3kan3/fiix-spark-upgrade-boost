import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Plus, Search, ListChecks, Clock, Printer, Upload,
  CalendarClock, Edit, SlidersHorizontal,
} from "lucide-react";
import { checklistService } from "@/services/checklistService";
import { ChecklistTypes, ChecklistFrequencies } from "@/types/checklists";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import PageHeader from "@/components/shell/PageHeader";
import { format } from "date-fns";
import { getAllAssets } from "@/services/assets/assetQueries";
import { generateSetupSheetPdf } from "@/utils/setupSheetPdf";

const getTypeTokens = (type: string) => {
  switch (type) {
    case "safety":     return "bg-destructive/10 text-destructive border-destructive/20";
    case "equipment":  return "bg-primary/10 text-primary border-primary/20";
    case "maintenance":return "bg-warning/10 text-warning border-warning/20";
    case "quality":    return "bg-success/10 text-success border-success/20";
    default:           return "bg-muted text-muted-foreground border-border";
  }
};

const getTypePreviewAccent = (type: string) => {
  switch (type) {
    case "safety":     return "bg-destructive/15";
    case "equipment":  return "bg-primary/15";
    case "maintenance":return "bg-warning/20";
    case "quality":    return "bg-success/15";
    default:           return "bg-muted";
  }
};

const ChecklistsPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const { data: checklists = [], isLoading } = useQuery({
    queryKey: ["checklists"],
    queryFn: checklistService.getChecklists,
  });
  const { data: allAssets = [] } = useQuery({
    queryKey: ["assets"],
    queryFn: getAllAssets,
  });

  const filteredChecklists = checklists.filter((checklist) => {
    const matchesSearch =
      checklist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      checklist.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || checklist.type === typeFilter;
    return matchesSearch && matchesType;
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="px-4 md:px-6 lg:px-8 py-12 text-center text-muted-foreground">
          Loading checklists…
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="Preventive Templates"
        description="Manage and create standard checklists for recurring maintenance."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate("/checklists/submissions")}>
              <CalendarClock className="h-4 w-4 mr-1.5" />
              Submissions
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate("/checklists/import")}>
              <Upload className="h-4 w-4 mr-1.5" />
              Import
            </Button>
            <Button size="sm" onClick={() => navigate("/checklists/new")}>
              <Plus className="h-4 w-4 mr-1.5" />
              Create New
            </Button>
          </div>
        }
      />

      <div className="px-4 md:px-6 lg:px-8 py-6 space-y-5">
        {/* Filter / Controls bar */}
        <div className="bg-card border border-border rounded-lg shadow-sm p-4 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {[["all", "All"], ...ChecklistTypes.map((t) => [t.value, t.label])].map(
              ([value, label]) => (
                <button
                  key={value}
                  onClick={() => setTypeFilter(value)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide border transition-colors ${
                    typeFilter === value
                      ? "border-primary text-primary bg-primary/5"
                      : "border-border text-muted-foreground hover:bg-muted/60"
                  }`}
                >
                  {label}
                </button>
              )
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-52 bg-muted/40 border-none focus-visible:ring-primary rounded-full text-sm"
              />
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <SlidersHorizontal className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Sort:</span>
              <Select defaultValue="modified">
                <SelectTrigger className="border-none bg-transparent shadow-none focus:ring-0 text-sm font-semibold text-foreground w-36 p-0 h-auto">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="modified">Last Modified</SelectItem>
                  <SelectItem value="name">Name (A–Z)</SelectItem>
                  <SelectItem value="usage">Highest Usage</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Table / Empty state */}
        {filteredChecklists.length === 0 ? (
          <div className="bg-card border border-border rounded-lg shadow-sm text-center py-16">
            <ListChecks className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-headline text-lg font-semibold text-foreground mb-2">
              {checklists.length === 0 ? "No checklists yet" : "No checklists match your search"}
            </h3>
            <p className="text-muted-foreground mb-6 text-sm">
              {checklists.length === 0
                ? "Create your first checklist template to get started"
                : "Try adjusting your search or filter criteria"}
            </p>
            {checklists.length === 0 && (
              <Button onClick={() => navigate("/checklists/new")}>
                <Plus className="mr-2 h-4 w-4" />
                Create First Checklist
              </Button>
            )}
          </div>
        ) : (
          <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden hover:border-primary/10 transition-colors">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/20">
                    <th className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Template Preview</th>
                    <th className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Checklist Name</th>
                    <th className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Category</th>
                    <th className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Frequency</th>
                    <th className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Created</th>
                    <th className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredChecklists.map((checklist) => (
                    <tr
                      key={checklist.id}
                      className="group hover:bg-muted/20 transition-colors cursor-pointer"
                      onClick={() => navigate(`/checklists/${checklist.id}`)}
                    >
                      {/* Mini preview thumbnail */}
                      <td className="py-4 px-6">
                        <div className={`w-14 h-18 rounded border border-border/40 flex flex-col p-1.5 gap-1 overflow-hidden relative ${getTypePreviewAccent(checklist.type)}`}>
                          <div className="w-full h-1 bg-primary/20 rounded-full" />
                          <div className="w-3/4 h-1 bg-primary/20 rounded-full" />
                          <div className="w-5/6 h-1 bg-primary/20 rounded-full mt-0.5" />
                          <div className="w-full h-1 bg-primary/20 rounded-full" />
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="font-headline font-semibold text-foreground text-[17px] mb-0.5 group-hover:text-primary transition-colors">
                          {checklist.name}
                        </div>
                        {checklist.description && (
                          <div className="text-xs text-muted-foreground line-clamp-1 max-w-xs">
                            {checklist.description}
                          </div>
                        )}
                        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                          <ListChecks className="h-3 w-3" />
                          <span>{checklist.items?.length ?? 0} items</span>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase border ${getTypeTokens(checklist.type)}`}>
                          {ChecklistTypes.find((t) => t.value === checklist.type)?.label ?? checklist.type}
                        </span>
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold uppercase bg-muted/60 text-muted-foreground">
                            {ChecklistFrequencies.find((f) => f.value === checklist.frequency)?.label ?? checklist.frequency}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="text-sm text-foreground">
                          {format(new Date(checklist.created_at), "MMM d, yyyy")}
                        </div>
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant="ghost"
                            title="Fill out"
                            className="text-secondary hover:text-secondary text-xs font-semibold"
                            onClick={(e) => { e.stopPropagation(); navigate(`/checklists/${checklist.id}/submit`); }}
                          >
                            Fill Out
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            title="Edit"
                            className="h-8 w-8 text-primary hover:bg-primary/5"
                            onClick={(e) => { e.stopPropagation(); navigate(`/checklists/${checklist.id}/edit`); }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            title="Print setup sheet"
                            className="h-8 w-8 text-primary hover:bg-primary/5"
                            onClick={(e) => {
                              e.stopPropagation();
                              const linkedIds = new Set(checklist.asset_ids || []);
                              const linkedAssets = (allAssets as any[]).filter((a) => linkedIds.has(a.id));
                              generateSetupSheetPdf({
                                title: `${checklist.name} — Setup Sheet`,
                                assets: linkedAssets,
                                checklists: [checklist as any],
                              });
                            }}
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="border-t border-border bg-muted/10 px-6 py-3 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Showing {filteredChecklists.length} of {checklists.length} templates
              </span>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ChecklistsPage;
