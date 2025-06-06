
import React from "react";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import { VendorFormData } from "@/services/vendorService";

interface VendorExportButtonsProps {
  vendors: VendorFormData[];
  disabled?: boolean;
}

const VendorExportButtons: React.FC<VendorExportButtonsProps> = ({
  vendors,
  disabled = false
}) => {
  const exportToCSV = () => {
    if (vendors.length === 0) return;

    const headers = [
      'name',
      'email', 
      'phone',
      'contact_person',
      'contact_title',
      'vendor_type',
      'status',
      'address',
      'city',
      'state',
      'zip_code',
      'website',
      'description'
    ];

    const csvContent = [
      headers.join(','),
      ...vendors.map(vendor => 
        headers.map(header => {
          const value = vendor[header as keyof VendorFormData] || '';
          // Escape commas and quotes in CSV
          return `"${String(value).replace(/"/g, '""')}"`;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `vendors_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToJSON = () => {
    if (vendors.length === 0) return;

    const jsonContent = JSON.stringify(vendors, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `vendors_${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={exportToCSV}
        disabled={disabled || vendors.length === 0}
        className="flex items-center gap-2"
      >
        <FileText className="h-4 w-4" />
        Export CSV
      </Button>
      <Button
        variant="outline" 
        size="sm"
        onClick={exportToJSON}
        disabled={disabled || vendors.length === 0}
        className="flex items-center gap-2"
      >
        <Download className="h-4 w-4" />
        Export JSON
      </Button>
    </div>
  );
};

export default VendorExportButtons;
