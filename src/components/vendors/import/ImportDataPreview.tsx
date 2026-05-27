
import React from "react";
import { VendorFormData } from "@/services/vendorService";

interface ImportDataPreviewProps {
 parsedData: VendorFormData[];
}

const ImportDataPreview: React.FC<ImportDataPreviewProps> = ({ parsedData }) => {
 if (parsedData.length === 0) return null;

 return (
 <div className="border rounded-lg p-4">
 <h4 className="font-medium mb-2">Preview ({parsedData.length} vendors found)</h4>
 <div className="max-h-40 overflow-y-auto overflow-x-auto">
 <table className="w-full min-w-[520px] text-sm">
 <thead>
 <tr className="border-b">
 <th className="text-left p-2">Name</th>
 <th className="text-left p-2">Email</th>
 <th className="text-left p-2">Type</th>
 <th className="text-left p-2">Status</th>
 </tr>
 </thead>
 <tbody>
 {parsedData.slice(0, 5).map((vendor, index) => (
 <tr key={index} className="border-b">
 <td className="p-2">{vendor.name}</td>
 <td className="p-2">{vendor.email}</td>
 <td className="p-2">{vendor.vendor_type}</td>
 <td className="p-2">{vendor.status}</td>
 </tr>
 ))}
 </tbody>
 </table>
 {parsedData.length > 5 && (
 <p className="text-center text-muted-foreground py-2">
 ... and {parsedData.length - 5} more
 </p>
 )}
 </div>
 </div>
 );
};

export default ImportDataPreview;
