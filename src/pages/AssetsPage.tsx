
import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import PageContainer from "@/components/shell/PageContainer";
import AssetFilters from "@/components/assets/AssetFilters";
import AssetGridView from "@/components/assets/AssetGridView";
import AssetEmptyState from "@/components/assets/AssetEmptyState";
import { getAllAssets } from "@/services/assets/assetQueries";
import BulkAddAssetsDialog from "@/components/assets/BulkAddAssetsDialog";
import QuickFreezerSetupDialog from "@/components/assets/QuickFreezerSetupDialog";
import { checklistService } from "@/services/checklistService";
import { generateSetupSheetPdf } from "@/utils/setupSheetPdf";
import { MaterialIcon } from "@/components/ui/material-icon";

const AssetsPage = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    category: "all",
    location: "all",
  });
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const { data: assets = [], isLoading, error } = useQuery({
    queryKey: ["assets"],
    queryFn: getAllAssets,
  });
  const { data: checklists = [] } = useQuery({
    queryKey: ["checklists"],
    queryFn: checklistService.getChecklists,
  });
  const assetCategories = ["Equipment", "Vehicles", "Facilities", "Tools"];

  const filteredAssets = assets.filter((asset: any) => {
    const matchesSearch = !filters.search ||
      asset.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
      asset.serial_number?.toLowerCase().includes(filters.search.toLowerCase());
    const matchesStatus = filters.status === "all" || asset.status === filters.status;
    const matchesCategory = filters.category === "all" || asset.category === filters.category;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleSearchChange = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
  };

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handlePrintSetupSheet = () => {
    const visibleIds = new Set(filteredAssets.map((a: any) => a.id));
    const relevantChecklists = checklists.filter((c) =>
      (c.asset_ids || []).some((id) => visibleIds.has(id)),
    );
    generateSetupSheetPdf({
      title: "Equipment Setup Sheet",
      assets: filteredAssets as any,
      checklists: relevantChecklists as any,
    });
  };

  // Derived stats
  const totalAssets = assets.length;
  const criticalAssets = assets.filter((a: any) =>
    a.status === "inactive" || a.status === "decommissioned"
  ).length;
  const operationalAssets = assets.filter((a: any) =>
    a.status === "operational" || a.status === "active"
  ).length;
  const uptimePct = totalAssets > 0 ? Math.round((operationalAssets / totalAssets) * 100) : 0;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64 text-sm font-semibold text-muted-foreground">
          Loading…
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Helmet>
        <title>Equipment &amp; Assets | MaintenEase</title>
        <meta name="description" content="Track every tool, vehicle, and machine in one place. View status, history, and maintenance records for all your assets." />
        <link rel="canonical" href="https://maintenease.com/assets" />
        <meta property="og:title" content="Equipment &amp; Assets | MaintenEase" />
        <meta property="og:description" content="Track every tool, vehicle, and machine in one place." />
        <meta property="og:url" content="https://maintenease.com/assets" />
      </Helmet>

      <PageContainer className="space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="font-headline-lg text-on-surface mb-2">Asset Registry</h1>
            <p className="text-on-surface-variant font-body-md max-w-xl">
              Monitor health metrics, maintenance schedules, and operational efficiency across your facility's infrastructure.
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              className="px-4 py-2 rounded-lg border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-high transition-colors font-label-md flex items-center gap-2"
              onClick={handlePrintSetupSheet}
              disabled={filteredAssets.length === 0}
            >
              <MaterialIcon name="print" />
              Setup Sheet
            </button>
            <QuickFreezerSetupDialog />
            <BulkAddAssetsDialog />
            <button
              className="group bg-primary text-white px-6 py-3 rounded-xl font-label-md flex items-center gap-2 shadow-[0px_8px_16px_rgba(30,64,175,0.2)] hover:shadow-[0px_12px_24px_rgba(30,64,175,0.3)] hover:-translate-y-0.5 active:scale-95 transition-all duration-200"
              onClick={() => navigate("/assets/new")}
            >
              <MaterialIcon name="add_circle" />
              Register New Asset
            </button>
          </div>
        </div>

        {/* Dashboard Stats Summary (Bento Style) */}
        {totalAssets > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter">
            <div className="md:col-span-1 bg-surface-container-lowest p-card_padding rounded-xl deep-shadow flex flex-col justify-between h-[180px]">
              <div className="flex justify-between items-start">
                <MaterialIcon name="factory" className="text-primary bg-primary/5 p-2 rounded-lg" />
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-tighter">Total Assets</span>
              </div>
              <div>
                <p className="font-display-lg text-on-surface leading-none mb-1">{totalAssets.toLocaleString()}</p>
                <div className="flex items-center text-primary gap-1">
                  <MaterialIcon name="trending_up" className="text-sm" />
                  <span className="text-[12px] font-bold">{operationalAssets} operational</span>
                </div>
              </div>
            </div>
            <div className="md:col-span-1 bg-surface-container-lowest p-card_padding rounded-xl deep-shadow flex flex-col justify-between h-[180px]">
              <div className="flex justify-between items-start">
                <MaterialIcon name="warning" className="text-error bg-error/5 p-2 rounded-lg" />
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-tighter">Urgent Attention</span>
              </div>
              <div>
                <p className="font-display-lg text-on-surface leading-none mb-1">{criticalAssets}</p>
                <div className="flex items-center text-error gap-1">
                  <MaterialIcon name="error" className="text-sm" />
                  <span className="text-[12px] font-bold">Critical failures</span>
                </div>
              </div>
            </div>
            <div className="md:col-span-2 bg-primary-container text-white p-card_padding rounded-xl deep-shadow flex items-center justify-between overflow-hidden relative group">
              <div className="relative z-10">
                <span className="text-[10px] font-bold text-on-primary-container uppercase tracking-widest mb-4 block">Fleet Efficiency</span>
                <h3 className="font-headline-md mb-2">{uptimePct}% Uptime</h3>
                <p className="font-body-md text-on-primary-container max-w-xs">Across all critical systems this quarter.</p>
              </div>
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-24 h-24 rounded-full border-[6px] border-white/10 flex items-center justify-center relative">
                  <svg className="absolute inset-0 w-full h-full -rotate-90">
                    <circle cx="48" cy="48" fill="none" r="42" stroke="white" strokeDasharray="264" strokeDashoffset={264 * (1 - uptimePct / 100)} strokeLinecap="round" strokeWidth="6"></circle>
                  </svg>
                  <span className="font-headline-md">{uptimePct}%</span>
                </div>
              </div>
              <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-white/5 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
            </div>
          </div>
        )}

        {/* Registry Grid Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <AssetFilters
              searchQuery={filters.search}
              onSearchChange={handleSearchChange}
              assetCategories={assetCategories}
              selectedCategories={selectedCategories}
              onCategoryToggle={handleCategoryToggle}
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 border border-outline-variant/30 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors">
              <MaterialIcon name="filter_list" />
            </button>
            <button className="p-2 border border-outline-variant/30 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors">
              <MaterialIcon name="grid_view" />
            </button>
            <span className="text-sm text-on-surface-variant font-label-sm ml-2">
              {filteredAssets.length} asset{filteredAssets.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {filteredAssets.length === 0 ? (
          <AssetEmptyState hasFilters={!!filters.search || selectedCategories.length > 0} />
        ) : (
          <AssetGridView
            assets={filteredAssets}
            isLoading={false}
            error={error}
            hasFilters={!!filters.search || selectedCategories.length > 0}
            isDeleting={false}
            onDeleteAsset={() => {}}
          />
        )}
      </PageContainer>
    </DashboardLayout>
  );
};

export default AssetsPage;
