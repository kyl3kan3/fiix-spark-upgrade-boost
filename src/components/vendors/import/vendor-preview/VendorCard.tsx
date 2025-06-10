
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { VendorImportData } from "@/services/vendorService";
import { VendorEditForm } from "./VendorEditForm";
import { VendorViewCard } from "./VendorViewCard";

interface VendorCardProps {
  vendor: VendorImportData;
  vendorId: string;
  isEditing: boolean;
  editData: VendorImportData | null;
  onStartEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onRemoveVendor: () => void;
  onUpdateField: (field: keyof VendorImportData, value: any) => void;
}

export const VendorCard: React.FC<VendorCardProps> = ({
  vendor,
  vendorId,
  isEditing,
  editData,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onRemoveVendor,
  onUpdateField,
}) => {
  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardContent className="p-4">
        {isEditing ? (
          <VendorEditForm
            editData={editData!}
            sourceText={vendor.sourceText}
            onSave={onSaveEdit}
            onCancel={onCancelEdit}
            onFieldUpdate={onUpdateField}
          />
        ) : (
          <VendorViewCard
            vendor={vendor}
            onEdit={onStartEdit}
            onRemove={onRemoveVendor}
          />
        )}
      </CardContent>
    </Card>
  );
};
