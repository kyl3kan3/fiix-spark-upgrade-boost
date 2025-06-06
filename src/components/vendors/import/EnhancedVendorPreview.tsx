
import React, { useState } from "react";
import { VendorFormData } from "@/services/vendorService";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle, Info } from "lucide-react";
import { VendorCard } from "./VendorCard";
import { VendorPreviewHeader } from "./VendorPreviewHeader";

interface EnhancedVendorPreviewProps {
  parsedData: VendorFormData[];
  onDataChange: (updatedData: VendorFormData[]) => void;
  processingWarnings?: string[];
  overallConfidence?: number;
}

const EnhancedVendorPreview: React.FC<EnhancedVendorPreviewProps> = ({
  parsedData,
  onDataChange,
  processingWarnings = [],
  overallConfidence = 1.0
}) => {
  const [vendors, setVendors] = useState<VendorFormData[]>(parsedData);
  const [showWarnings, setShowWarnings] = useState(true);

  const updateVendor = (index: number, field: keyof VendorFormData, value: any) => {
    const updatedVendors = [...vendors];
    updatedVendors[index] = { ...updatedVendors[index], [field]: value };
    setVendors(updatedVendors);
    onDataChange(updatedVendors);
  };

  const handleFieldRemap = (index: number, fromField: keyof VendorFormData, toField: keyof VendorFormData, value: string) => {
    const updatedVendors = [...vendors];
    const vendor = { ...updatedVendors[index] };
    
    // Clear the old field
    (vendor as any)[fromField] = "";
    
    // Set the new field, combining with existing value if any
    const existingValue = (vendor as any)[toField] || "";
    const newValue = existingValue ? `${existingValue}, ${value}` : value;
    (vendor as any)[toField] = newValue;
    
    updatedVendors[index] = vendor;
    setVendors(updatedVendors);
    onDataChange(updatedVendors);
  };

  const removeVendor = (index: number) => {
    const updatedVendors = vendors.filter((_, i) => i !== index);
    setVendors(updatedVendors);
    onDataChange(updatedVendors);
  };

  const addNewVendor = () => {
    const newVendor: VendorFormData = {
      name: "",
      email: "",
      phone: "",
      contact_person: "",
      contact_title: "",
      vendor_type: "service",
      status: "active",
      address: "",
      city: "",
      state: "",
      zip_code: "",
      website: "",
      description: "",
      rating: null,
    };
    const updatedVendors = [...vendors, newVendor];
    setVendors(updatedVendors);
    onDataChange(updatedVendors);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "bg-green-100 text-green-800";
    if (confidence >= 0.6) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 0.8) return <CheckCircle className="h-4 w-4" />;
    if (confidence >= 0.6) return <Info className="h-4 w-4" />;
    return <AlertTriangle className="h-4 w-4" />;
  };

  const validVendorCount = vendors.filter(v => v.name?.trim()).length;
  const incompleteVendorCount = vendors.length - validVendorCount;

  return (
    <div className="space-y-4">
      {/* Processing Summary */}
      <div className="bg-card rounded-lg p-4 border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Parsing Results</h3>
          <Badge className={getConfidenceColor(overallConfidence)}>
            {getConfidenceIcon(overallConfidence)}
            <span className="ml-1">{(overallConfidence * 100).toFixed(0)}% Confidence</span>
          </Badge>
        </div>
        
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="font-semibold text-lg text-green-600">{validVendorCount}</div>
            <div className="text-muted-foreground">Valid Vendors</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-lg text-amber-600">{incompleteVendorCount}</div>
            <div className="text-muted-foreground">Need Review</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-lg text-blue-600">{processingWarnings.length}</div>
            <div className="text-muted-foreground">Warnings</div>
          </div>
        </div>
      </div>

      {/* Processing Warnings */}
      {processingWarnings.length > 0 && showWarnings && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span className="font-medium">Processing Warnings ({processingWarnings.length})</span>
              <button 
                onClick={() => setShowWarnings(false)}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Hide
              </button>
            </div>
            <div className="mt-2 max-h-20 overflow-y-auto text-sm">
              {processingWarnings.slice(0, 3).map((warning, index) => (
                <div key={index} className="mt-1">• {warning}</div>
              ))}
              {processingWarnings.length > 3 && (
                <div className="mt-1 text-muted-foreground">
                  ... and {processingWarnings.length - 3} more
                </div>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      <VendorPreviewHeader
        vendorCount={vendors.length}
        onAddVendor={addNewVendor}
      />
      
      <ScrollArea className="h-[60vh]">
        <div className="space-y-3 pr-4">
          {vendors.map((vendor, index) => (
            <VendorCard
              key={index}
              vendor={vendor}
              index={index}
              isDragging={false}
              onFieldChange={(field, value) => updateVendor(index, field, value)}
              onFieldRemap={(fromField, toField, value) => handleFieldRemap(index, fromField, toField, value)}
              onRemoveVendor={() => removeVendor(index)}
              onDragStart={() => {}}
              onDragEnd={() => {}}
              onDragOver={() => {}}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default EnhancedVendorPreview;
