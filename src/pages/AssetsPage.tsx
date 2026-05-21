
import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, Printer } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import PageContainer from "@/components/shell/PageContainer";
import PageHeader from "@/components/shell/PageHeader";
import AssetFilters from "@/components/assets/AssetFilters";
import AssetGridView from "@/components/assets/AssetGridView";
import AssetEmptyState from "@/components/assets/AssetEmptyState";
import { getAllAssets } from "@/services/assets/assetQueries";
import BulkAddAssetsDialog from "@/components/assets/BulkAddAssetsDialog";
import QuickFreezerSetupDialog from "@/components/assets/QuickFreezerSetupDialog";
import { checklistService } from "@/services/checklistService";
import { generateSetupSheetPdf } from "@/utils/setupSheetPdf";

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
 // Only include checklists that reference one of the visible (filtered) assets.
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

 if (isLoading) {
 return (
 <DashboardLayout>
 <PageHeader title="Equipment" />
 <div className="flex items-center justify-center h-64 text-sm font-semibold text-muted-foreground">
 Loading…
 </div>
 </DashboardLayout>
 );
 }

 return (
 <DashboardLayout>
 <Helmet>
 <title>Equipment & Assets | MaintenEase</title>
 <meta name="description" content="Track every tool, vehicle, and machine in one place. View status, history, and maintenance records for all your assets." />
 <link rel="canonical" href="https://maintenease.com/assets" />
 <meta property="og:title" content="Equipment & Assets | MaintenEase" />
 <meta property="og:description" content="Track every tool, vehicle, and machine in one place." />
 <meta property="og:url" content="https://maintenease.com/assets" />
 </Helmet>
 <PageHeader
 title="Equipment"
 description="Everything you take care of — tools, vehicles, machines, and more."
 actions={
 <div className="flex gap-2">
 <Button
 variant="outline"
 size="lg"
 onClick={handlePrintSetupSheet}
 disabled={filteredAssets.length === 0}
 >
 <Printer className="h-5 w-5" />
 Setup Sheet
 </Button>
 <QuickFreezerSetupDialog />
 <BulkAddAssetsDialog />
 <Button variant="accent" size="lg" onClick={() => navigate("/assets/new")}>
 <Plus className="h-5 w-5" />Add Equipment
 </Button>
 </div>
 }
 />
 <PageContainer className="space-y-6">
 <AssetFilters
 searchQuery={filters.search}
 onSearchChange={handleSearchChange}
 assetCategories={assetCategories}
 selectedCategories={selectedCategories}
 onCategoryToggle={handleCategoryToggle}
 />
 
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
