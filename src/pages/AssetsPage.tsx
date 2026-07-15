
import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, Printer, TrendingUp, AlertTriangle, Cog } from "lucide-react";
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
      <meta property="og:type" content="website" />
      <meta property="og:image" content="https://maintenease.com/og-image.png?v=3" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="Equipment & Assets | MaintenEase" />
      <meta name="twitter:description" content="Track every tool, vehicle, and machine in one place." />
      <meta name="twitter:image" content="https://maintenease.com/og-image.png?v=3" />
     </Helmet>
     <PageHeader
       title="Asset Registry"
       description="Monitor maintenance schedules and operational efficiency across your facility's infrastructure."
       actions={
         <div className="flex gap-2 flex-wrap">
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
     <PageContainer className="space-y-8">
       {/* Summary Bento — only render when assets exist */}
       {totalAssets > 0 && (
         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
           {/* Total assets */}
           <div className="surface-card rounded-lg p-5 flex flex-col justify-between min-h-[120px]">
             <div className="flex items-center justify-between mb-3">
               <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                 <Cog className="h-4 w-4 text-primary" />
               </div>
               <span className="label-eyebrow">Total Assets</span>
             </div>
             <div>
               <p className="font-headline text-3xl font-bold text-foreground leading-none mb-1">
                 {totalAssets.toLocaleString()}
               </p>
               <div className="flex items-center text-primary gap-1">
                 <TrendingUp className="h-3.5 w-3.5" />
                 <span className="text-xs font-bold">{operationalAssets} operational</span>
               </div>
             </div>
           </div>

           {/* Urgent attention */}
           <div className="surface-card rounded-lg p-5 flex flex-col justify-between min-h-[120px]">
             <div className="flex items-center justify-between mb-3">
               <div className="w-9 h-9 rounded-lg bg-destructive/10 flex items-center justify-center">
                 <AlertTriangle className="h-4 w-4 text-destructive" />
               </div>
               <span className="label-eyebrow">Needs Attention</span>
             </div>
             <div>
               <p className="font-headline text-3xl font-bold text-foreground leading-none mb-1">
                 {criticalAssets}
               </p>
               <div className="flex items-center text-destructive gap-1">
                 <AlertTriangle className="h-3.5 w-3.5" />
                 <span className="text-xs font-bold">Inactive / decommissioned</span>
               </div>
             </div>
           </div>

           {/* Fleet efficiency */}
           <div className="bg-primary text-primary-foreground rounded-xl p-5 flex items-center justify-between overflow-hidden relative min-h-[120px]">
             <div className="relative z-10">
               <span className="text-xs font-bold uppercase tracking-widest text-primary-foreground/70 mb-3 block">
                 Fleet Efficiency
               </span>
               <p className="font-headline text-2xl font-bold leading-none mb-1">
                 {uptimePct}% Uptime
               </p>
               <p className="text-xs text-primary-foreground/70">
                 Across all operational assets
               </p>
             </div>
             <div className="relative z-10 shrink-0">
               <svg className="w-16 h-16 -rotate-90" viewBox="0 0 48 48">
                 <circle cx="24" cy="24" fill="none" r="20" stroke="rgba(255,255,255,0.15)" strokeWidth="4" />
                 <circle
                   cx="24" cy="24" fill="none" r="20"
                   stroke="white"
                   strokeWidth="4"
                   strokeLinecap="round"
                   strokeDasharray="125.6"
                   strokeDashoffset={125.6 * (1 - uptimePct / 100)}
                 />
               </svg>
             </div>
             <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
           </div>
         </div>
       )}

       {/* Filters row */}
       <div className="flex items-center justify-between gap-4 flex-wrap">
         <AssetFilters
           searchQuery={filters.search}
           onSearchChange={handleSearchChange}
           assetCategories={assetCategories}
           selectedCategories={selectedCategories}
           onCategoryToggle={handleCategoryToggle}
         />
         <p className="text-sm text-muted-foreground shrink-0">
           {filteredAssets.length} asset{filteredAssets.length !== 1 ? "s" : ""}
         </p>
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
