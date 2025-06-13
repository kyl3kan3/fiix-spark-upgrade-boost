
import React from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import BackToDashboard from "@/components/dashboard/BackToDashboard";
import { LocationHierarchyView } from "@/components/locations/LocationHierarchyView";

const LocationsPage = () => {
  return (
    <DashboardLayout>
      <BackToDashboard />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Locations</h1>
        <LocationHierarchyView 
          locations={[]}
          isLoading={false}
          onAddSubLocation={() => {}}
          onDeleteLocation={() => {}}
        />
      </div>
    </DashboardLayout>
  );
};

export default LocationsPage;
