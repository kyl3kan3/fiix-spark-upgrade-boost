import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { checklistService } from "@/services/checklistService";
import { ChecklistTypes, ChecklistFrequencies } from "@/types/checklists";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { format } from "date-fns";
import { getAllAssets } from "@/services/assets/assetQueries";
import { generateSetupSheetPdf } from "@/utils/setupSheetPdf";
import { MaterialIcon } from "@/components/ui/material-icon";

const getTypeTokens = (type: string) => {
  switch (type) {
    case "safety":     return "bg-error-container text-on-error-container border-error/20";
    case "equipment":  return "bg-surface-container-high text-primary border-primary/20";
    case "maintenance":return "bg-warning/10 text-warning border-warning/20";
    case "quality":    return "bg-success/10 text-success border-success/20";
    default:           return "bg-surface-container-high text-on-secondary-container border-outline-variant/30";
  }
};

const getTypePreviewAccent = (type: string) => {
  switch (type) {
    case "safety":     return "bg-error/20";
    case "equipment":  return "bg-primary/20";
    case "maintenance":return "bg-warning/30";
    case "quality":    return "bg-success/15";
    default:           return "bg-primary/20";
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
        <div className="flex-1 p-4 md:p-8 bg-background">
          <div className="text-center py-12 text-on-surface-variant">Loading checklists…</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Helmet>
        <title>Preventive Templates | MaintenEase</title>
        <meta name="description" content="Manage and create standard checklists for recurring maintenance." />
        <link rel="canonical" href="https://maintenease.com/checklists" />
      </Helmet>

      <div className="flex-1 p-4 md:p-8 bg-background">
        {/* Page Header & Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-1">Preventive Templates</h2>
            <p className="font-body-md text-body-md text-secondary">Manage and create standard checklists for recurring maintenance.</p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <button
              onClick={() => navigate("/checklists/submissions")}
              className="flex-1 sm:flex-none py-2 px-4 rounded-lg bg-surface-container border border-outline-variant/30 text-on-surface font-label-md text-label-md flex justify-center items-center gap-2 hover:bg-surface-container-high transition-colors"
            >
              <MaterialIcon name="history" />
              Submissions
            </button>
            <button
              onClick={() => navigate("/checklists/import")}
              className="flex-1 sm:flex-none py-2 px-4 rounded-lg bg-surface-container border border-outline-variant/30 text-on-surface font-label-md text-label-md flex justify-center items-center gap-2 hover:bg-surface-container-high transition-colors"
            >
              <MaterialIcon name="upload" />
              Import
            </button>
            <button
              onClick={() => navigate("/checklists/new")}
              className="flex-1 sm:flex-none py-2 px-6 rounded-lg bg-primary text-on-primary font-label-md text-label-md uppercase shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all flex justify-center items-center gap-2"
            >
              <MaterialIcon name="add" />
              Create New
            </button>
          </div>
        </div>

        {/* Filtering & Controls Bar */}
        <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-outline-variant/10 mb-6 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setTypeFilter("all")}
              className={`px-4 py-1.5 rounded-full border font-label-sm text-label-sm uppercase transition-colors ${
                typeFilter === "all"
                  ? "border-primary text-primary bg-primary/5"
                  : "border-outline-variant text-secondary hover:bg-surface-container"
              }`}
            >
              All
            </button>
            {ChecklistTypes.map((t) => (
              <button
                key={t.value}
                onClick={() => setTypeFilter(t.value)}
                className={`px-4 py-1.5 rounded-full border font-label-sm text-label-sm uppercase transition-colors ${
                  typeFilter === t.value
                    ? "border-primary text-primary bg-primary/5"
                    : "border-outline-variant text-secondary hover:bg-surface-container"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 text-secondary">
            <div className="relative hidden sm:block">
              <MaterialIcon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
              <input
                className="bg-surface-container-low border-none rounded-lg pl-10 pr-4 py-2 font-body-md focus:ring-2 focus:ring-primary w-48 transition-all text-on-surface placeholder:text-outline"
                placeholder="Search templates..."
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <span className="font-label-sm text-label-sm uppercase">Sort by:</span>
            <select className="bg-transparent border-none text-on-surface font-label-md text-label-md cursor-pointer focus:ring-0 p-0 pr-6">
              <option>Last Modified</option>
              <option>Name (A-Z)</option>
              <option>Highest Usage</option>
            </select>
          </div>
        </div>

        {/* Bento/Glassmorphic Table Layout */}
        {filteredChecklists.length === 0 ? (
          <div className="bg-surface-container-lowest rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.04)] border border-transparent p-16 text-center">
            <MaterialIcon name="checklist" className="text-[48px] text-outline-variant block mx-auto mb-4" />
            <h3 className="font-headline-md text-headline-md text-on-surface mb-2">
              {checklists.length === 0 ? "No checklists yet" : "No checklists match your search"}
            </h3>
            <p className="font-body-md text-body-md text-secondary mb-6">
              {checklists.length === 0
                ? "Create your first checklist template to get started"
                : "Try adjusting your search or filter criteria"}
            </p>
            {checklists.length === 0 && (
              <button
                onClick={() => navigate("/checklists/new")}
                className="py-2 px-6 rounded-lg bg-primary text-on-primary font-label-md text-label-md uppercase transition-all flex items-center gap-2 mx-auto"
              >
                <MaterialIcon name="add" />
                Create First Checklist
              </button>
            )}
          </div>
        ) : (
          <div className="bg-surface-container-lowest rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.04)] border border-transparent hover:border-primary/10 transition-colors overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-outline-variant/20 bg-surface-container-low/50">
                    <th className="py-4 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Template Preview</th>
                    <th className="py-4 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Checklist Name</th>
                    <th className="py-4 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Category</th>
                    <th className="py-4 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Usage Frequency</th>
                    <th className="py-4 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Last Modified</th>
                    <th className="py-4 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {filteredChecklists.map((checklist) => (
                    <tr
                      key={checklist.id}
                      className="hover:bg-surface-container/30 transition-colors group cursor-pointer"
                      onClick={() => navigate(`/checklists/${checklist.id}`)}
                    >
                      <td className="py-4 px-6">
                        <div className={`w-16 h-20 rounded bg-surface-variant border border-outline-variant/30 flex flex-col p-1.5 gap-1 relative overflow-hidden ${getTypePreviewAccent(checklist.type)}`}>
                          <div className="w-full h-1 bg-primary/20 rounded-full"></div>
                          <div className="w-3/4 h-1 bg-primary/20 rounded-full"></div>
                          <div className="w-5/6 h-1 bg-primary/20 rounded-full mt-1"></div>
                          <div className="w-full h-1 bg-primary/20 rounded-full"></div>
                          <div className="absolute bottom-1 right-1">
                            <MaterialIcon name="check_circle" className="text-[10px] text-primary" />
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-headline-md text-[18px] text-on-surface mb-1 group-hover:text-primary transition-colors">{checklist.name}</div>
                        {checklist.description && (
                          <div className="font-body-md text-[14px] text-secondary line-clamp-1 max-w-[250px]">{checklist.description}</div>
                        )}
                        <div className="flex items-center gap-1 mt-1 font-label-sm text-[11px] text-secondary">
                          <MaterialIcon name="checklist" className="text-[14px]" />
                          <span>{checklist.items?.length ?? 0} items</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-label-sm text-[11px] uppercase border ${getTypeTokens(checklist.type)}`}>
                          {ChecklistTypes.find((t) => t.value === checklist.type)?.label ?? checklist.type}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <MaterialIcon name="calendar_month" className="text-[18px] text-secondary" />
                          <span className="font-body-md text-[14px] text-on-surface">
                            {ChecklistFrequencies.find((f) => f.value === checklist.frequency)?.label ?? checklist.frequency}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-body-md text-[14px] text-on-surface">
                          {format(new Date(checklist.created_at), "MMM d, yyyy")}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            className="text-secondary hover:text-primary text-xs font-semibold px-2 py-1 rounded hover:bg-surface-container-high transition-colors"
                            title="Fill out"
                            onClick={(e) => { e.stopPropagation(); navigate(`/checklists/${checklist.id}/submit`); }}
                          >
                            Fill Out
                          </button>
                          <button
                            className="p-2 rounded hover:bg-surface-container-high text-primary transition-colors"
                            title="Edit"
                            onClick={(e) => { e.stopPropagation(); navigate(`/checklists/${checklist.id}/edit`); }}
                          >
                            <MaterialIcon name="edit" className="text-[20px]" />
                          </button>
                          <button
                            className="p-2 rounded hover:bg-surface-container-high text-primary transition-colors"
                            title="Print setup sheet"
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
                            <MaterialIcon name="print" className="text-[20px]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination footer */}
            <div className="border-t border-outline-variant/20 bg-surface-container-low/30 p-4 flex justify-between items-center">
              <span className="font-body-md text-[14px] text-secondary">
                Showing 1 to {filteredChecklists.length} of {checklists.length} templates
              </span>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ChecklistsPage;
