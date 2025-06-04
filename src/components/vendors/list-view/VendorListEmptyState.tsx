
import React from "react";
import { Building2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface VendorListEmptyStateProps {
  hasFilters: boolean;
}

const VendorListEmptyState: React.FC<VendorListEmptyStateProps> = ({ hasFilters }) => {
  return (
    <Card>
      <CardContent className="text-center py-8">
        <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 mb-2">
          {hasFilters ? "No vendors match your filters" : "No vendors found"}
        </p>
        <p className="text-sm text-gray-400">
          {hasFilters ? "Try adjusting your search criteria" : "Create your first vendor to get started"}
        </p>
      </CardContent>
    </Card>
  );
};

export default VendorListEmptyState;
