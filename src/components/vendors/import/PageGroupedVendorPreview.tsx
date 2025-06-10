
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VendorImportData } from "@/services/vendorService";
import { PageGroup } from "./vendor-preview/PageGroup";

interface PageGroupedVendorPreviewProps {
  parsedData: VendorImportData[];
  onDataChange: (data: VendorImportData[]) => void;
}

interface VendorGroup {
  pageNumber: number;
  vendors: VendorImportData[];
  pageText: string;
}

const PageGroupedVendorPreview: React.FC<PageGroupedVendorPreviewProps> = ({
  parsedData,
  onDataChange,
}) => {
  const [editingVendor, setEditingVendor] = useState<string | null>(null);
  const [editData, setEditData] = useState<VendorImportData | null>(null);
  const [expandedPages, setExpandedPages] = useState<number[]>([1]);

  // Group vendors by page
  const vendorsByPage: VendorGroup[] = React.useMemo(() => {
    const pageMap = new Map<number, VendorImportData[]>();
    
    parsedData.forEach(vendor => {
      const pageNum = vendor.pageNumber || 1;
      if (!pageMap.has(pageNum)) {
        pageMap.set(pageNum, []);
      }
      pageMap.get(pageNum)!.push(vendor);
    });

    return Array.from(pageMap.entries()).map(([pageNumber, vendors]) => ({
      pageNumber,
      vendors,
      pageText: vendors[0]?.sourceText || ''
    })).sort((a, b) => a.pageNumber - b.pageNumber);
  }, [parsedData]);

  const startEdit = (vendorId: string, vendor: VendorImportData) => {
    setEditingVendor(vendorId);
    setEditData({ ...vendor });
  };

  const saveEdit = () => {
    if (editingVendor && editData) {
      const newData = parsedData.map(vendor => 
        vendor.id === editingVendor ? editData : vendor
      );
      onDataChange(newData);
      setEditingVendor(null);
      setEditData(null);
    }
  };

  const cancelEdit = () => {
    setEditingVendor(null);
    setEditData(null);
  };

  const removeVendor = (vendorId: string) => {
    const newData = parsedData.filter(vendor => vendor.id !== vendorId);
    onDataChange(newData);
  };

  const addVendor = (pageNumber: number) => {
    const newVendor: VendorImportData = {
      name: '',
      email: '',
      phone: '',
      contact_person: '',
      contact_title: '',
      vendor_type: 'service',
      status: 'active',
      address: '',
      city: '',
      state: '',
      zip_code: '',
      website: '',
      description: '',
      rating: null,
      pageNumber,
      id: `new-${Date.now()}`
    };
    
    onDataChange([...parsedData, newVendor]);
  };

  const updateField = (field: keyof VendorImportData, value: any) => {
    if (editData) {
      setEditData({ ...editData, [field]: value });
    }
  };

  const togglePageExpansion = (pageNumber: number) => {
    setExpandedPages(prev => 
      prev.includes(pageNumber) 
        ? prev.filter(p => p !== pageNumber)
        : [...prev, pageNumber]
    );
  };

  const getVendorId = (vendor: VendorImportData, index: number) => {
    return vendor.id || `vendor-${index}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Vendors Grouped by Page</span>
          <Badge variant="secondary">{parsedData.length} total vendors</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {vendorsByPage.map(pageGroup => (
          <PageGroup
            key={pageGroup.pageNumber}
            pageGroup={pageGroup}
            isExpanded={expandedPages.includes(pageGroup.pageNumber)}
            editingVendor={editingVendor}
            editData={editData}
            onToggleExpansion={() => togglePageExpansion(pageGroup.pageNumber)}
            onAddVendor={() => addVendor(pageGroup.pageNumber)}
            onStartEdit={startEdit}
            onSaveEdit={saveEdit}
            onCancelEdit={cancelEdit}
            onRemoveVendor={removeVendor}
            onUpdateField={updateField}
            getVendorId={getVendorId}
          />
        ))}
      </CardContent>
    </Card>
  );
};

export default PageGroupedVendorPreview;
