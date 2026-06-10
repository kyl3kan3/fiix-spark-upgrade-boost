import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useInspections } from "@/hooks/useInspections";
import { checklistIdFromInspectionId } from "@/services/inspectionService";
import InspectionHeader from "@/components/inspections/InspectionHeader";
import InspectionDetailsCard from "@/components/inspections/InspectionDetailsCard";
import InspectionChecklist from "@/components/inspections/InspectionChecklist";
import InspectionLoading from "@/components/inspections/InspectionLoading";
import InspectionNotFound from "@/components/inspections/InspectionNotFound";
import QueryErrorState from "@/components/common/QueryErrorState";

/**
 * Read-only review of a completed check-up (a checklist submission).
 * Scheduled check-ups don't have a detail view — they redirect straight
 * into the checklist submit flow, which is where the real work happens.
 */
const InspectionDetailPage = () => {
 const { inspectionId } = useParams();
 const navigate = useNavigate();
 const { inspections, loading, error, refreshInspections } = useInspections();

 const checklistId = inspectionId ? checklistIdFromInspectionId(inspectionId) : null;

 useEffect(() => {
 if (checklistId) {
 navigate(`/checklists/${checklistId}/submit`, { replace: true });
 }
 }, [checklistId, navigate]);

 if (checklistId) return null;

 const inspection = inspections.find((insp) => insp.id === inspectionId);

 if (loading) {
 return (
 <DashboardLayout>
 <InspectionLoading />
 </DashboardLayout>
 );
 }

 if (error) {
 return (
 <DashboardLayout>
 <div className="px-4 md:px-6 lg:px-8 py-6">
 <QueryErrorState title="Couldn't load this check-up" error={error} onRetry={() => refreshInspections()} />
 </div>
 </DashboardLayout>
 );
 }

 if (!inspection) {
 return (
 <DashboardLayout>
 <InspectionNotFound />
 </DashboardLayout>
 );
 }

 return (
 <DashboardLayout>
 <Helmet>
 <title>{inspection.title} | MaintenEase</title>
 </Helmet>

 <div className="space-y-6 pb-8">
 <InspectionHeader
 id={inspection.id}
 title={inspection.title}
 status={inspection.status}
 priority={inspection.priority}
 handleBackClick={() => navigate("/inspections")}
 />

 <div className="px-4 md:px-6 lg:px-8">
 <InspectionDetailsCard
 description={inspection.description}
 assetName={inspection.assetName}
 assignedTo={inspection.assignedTo}
 scheduledDate={inspection.scheduledDate}
 completedDate={inspection.completedDate}
 />
 </div>

 <div className="px-4 md:px-6 lg:px-8">
 <InspectionChecklist
 items={inspection.items}
 isCompleted
 />
 </div>
 </div>
 </DashboardLayout>
 );
};

export default InspectionDetailPage;
