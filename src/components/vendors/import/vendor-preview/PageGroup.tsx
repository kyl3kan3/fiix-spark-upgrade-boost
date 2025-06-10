
import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { VendorImportData } from "@/services/vendorService";
import { ChevronDown, ChevronRight } from "lucide-react";
import { VendorCard } from "./VendorCard";

interface VendorGroup {
  pageNumber: number;
  vendors: VendorImportData[];
  pageText: string;
}

interface PageGroupProps {
  pageGroup: VendorGroup;
  isExpanded: boolean;
  editingVendor: string | null;
  editData: VendorImportData | null;
  onToggleExpansion: () => void;
  onAddVendor: () => void;
  onStartEdit: (vendorId: string, vendor: VendorImportData) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onRemoveVendor: (vendorId: string) => void;
  onUpdateField: (field: keyof VendorImportData, value: any) => void;
  getVendorId: (vendor: VendorImportData, index: number) => string;
}

export const PageGroup: React.FC<PageGroupProps> = ({
  pageGroup,
  isExpanded,
  editingVendor,
  editData,
  onToggleExpansion,
  onAddVendor,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onRemoveVendor,
  onUpdateField,
  getVendorId,
}) => {
  return (
    <Card className="border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={onToggleExpansion}
            className="flex items-center gap-2 p-0 h-auto"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            <span className="font-medium">
              Page {pageGroup.pageNumber} ({pageGroup.vendors.length} vendors)
            </span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onAddVendor}
          >
            Add Vendor
          </Button>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-3">
          {pageGroup.vendors.map((vendor, vendorIndex) => {
            const vendorId = getVendorId(vendor, vendorIndex);
            
            return (
              <VendorCard
                key={vendorId}
                vendor={vendor}
                vendorId={vendorId}
                isEditing={editingVendor === vendorId}
                editData={editData}
                onStartEdit={() => onStartEdit(vendorId, vendor)}
                onSaveEdit={onSaveEdit}
                onCancelEdit={onCancelEdit}
                onRemoveVendor={() => onRemoveVendor(vendorId)}
                onUpdateField={onUpdateField}
              />
            );
          })}
        </CardContent>
      )}
    </Card>
  );
};
