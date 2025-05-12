
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { toast } from "sonner";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Inspection } from "@/types/inspections";
import { useInspections } from "@/hooks/useInspections";
import InspectionHeader from "@/components/inspections/InspectionHeader";
import InspectionDetailsCard from "@/components/inspections/InspectionDetailsCard";
import InspectionActionsCard from "@/components/inspections/InspectionActionsCard";
import InspectionChecklist from "@/components/inspections/InspectionChecklist";
import InspectionLoading from "@/components/inspections/InspectionLoading";
import InspectionNotFound from "@/components/inspections/InspectionNotFound";

const InspectionDetailPage = () => {
  const { inspectionId } = useParams();
  const navigate = useNavigate();
  const { inspections, loading } = useInspections();
  
  const [inspection, setInspection] = useState<Inspection | undefined>(undefined);
  const [inspectionItems, setInspectionItems] = useState<any[]>([]);

  // Find the inspection in our list when inspections load
  useEffect(() => {
    if (!loading && inspections.length > 0 && inspectionId) {
      const foundInspection = inspections.find(insp => insp.id === inspectionId);
      if (foundInspection) {
        setInspection(foundInspection);
        setInspectionItems([...foundInspection.items]);
      }
    }
  }, [inspectionId, inspections, loading]);

  // Show loading state
  if (loading) {
    return (
      <DashboardLayout>
        <InspectionLoading />
      </DashboardLayout>
    );
  }

  // Show not found state
  if (!loading && !inspection) {
    return (
      <DashboardLayout>
        <InspectionNotFound />
      </DashboardLayout>
    );
  }

  // Handle functions
  const handleBackClick = () => {
    navigate("/inspections");
  };

  const handleItemPassChange = (itemId: string, passed: boolean) => {
    if (!inspection) return;
    
    const newItems = inspectionItems.map(item => 
      item.id === itemId ? { ...item, passed } : item
    );
    setInspectionItems(newItems);
  };

  const handleNoteChange = (itemId: string, notes: string) => {
    if (!inspection) return;
    
    const newItems = inspectionItems.map(item => 
      item.id === itemId ? { ...item, notes } : item
    );
    setInspectionItems(newItems);
  };

  const handleUpdateStatus = (newStatus: 'scheduled' | 'in-progress' | 'completed' | 'failed' | 'cancelled') => {
    if (!inspection) return;
    
    setInspection({
      ...inspection,
      status: newStatus,
      completedDate: newStatus === 'completed' ? new Date().toISOString() : inspection.completedDate
    });
    
    toast.success(`Inspection status updated to ${newStatus}`);
  };

  const handleSaveChecklist = () => {
    // In a real implementation, we would save to the database here
    toast.success("Inspection checklist saved successfully");
  };
  
  // If we have an inspection, show the detail view
  return (
    <DashboardLayout>
      {inspection && (
        <>
          <Helmet>
            <title>{inspection.title} | MaintenEase</title>
          </Helmet>

          <div className="space-y-6">
            <InspectionHeader 
              id={inspection.id}
              title={inspection.title}
              status={inspection.status}
              priority={inspection.priority}
              handleBackClick={handleBackClick}
              handleUpdateStatus={handleUpdateStatus}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <InspectionDetailsCard 
                description={inspection.description}
                assetName={inspection.assetName}
                assignedTo={inspection.assignedTo}
                scheduledDate={inspection.scheduledDate}
                completedDate={inspection.completedDate}
              />
              
              <InspectionActionsCard 
                status={inspection.status}
                handleUpdateStatus={handleUpdateStatus}
              />
            </div>

            <InspectionChecklist 
              items={inspectionItems}
              isCompleted={inspection.status === 'completed'}
              handleItemPassChange={handleItemPassChange}
              handleNoteChange={handleNoteChange}
              handleSaveChecklist={handleSaveChecklist}
            />
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default InspectionDetailPage;
