
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Package, Plus } from "lucide-react";

const AssetManagementContent: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Asset Management</h2>
        <Button 
          onClick={() => navigate('/assets/new')}
          className="bg-fiix-500 hover:bg-fiix-600"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Asset
        </Button>
      </div>
      
      <div className="bg-gray-100 p-6 rounded-lg">
        <h3 className="text-lg font-medium mb-4">Asset Inventory</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-3 text-left">Asset ID</th>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Type</th>
                <th className="p-3 text-left">Location</th>
                <th className="p-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                { id: "A-001", name: "Air Compressor", type: "Equipment", location: "Building A", status: "Operational" },
                { id: "A-002", name: "Packaging Machine", type: "Equipment", location: "Production Line 1", status: "Maintenance Required" },
                { id: "A-003", name: "Forklift", type: "Vehicle", location: "Warehouse", status: "Operational" },
                { id: "A-004", name: "CNC Machine", type: "Equipment", location: "Production Line 2", status: "Offline" }
              ].map((asset) => (
                <tr key={asset.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{asset.id}</td>
                  <td className="p-3">{asset.name}</td>
                  <td className="p-3">{asset.type}</td>
                  <td className="p-3">{asset.location}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      asset.status === "Operational" ? "bg-green-100 text-green-800" :
                      asset.status === "Maintenance Required" ? "bg-yellow-100 text-yellow-800" :
                      "bg-red-100 text-red-800"
                    }`}>
                      {asset.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="bg-gray-100 p-6 rounded-lg">
        <h3 className="text-lg font-medium mb-4">Asset Details</h3>
        <div className="bg-white p-4 rounded border">
          <div className="flex items-center mb-4">
            <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center mr-4">
              <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <div>
              <h4 className="text-lg font-medium">Air Compressor</h4>
              <p className="text-sm text-gray-500">Asset ID: A-001</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm font-medium">Manufacturer</p>
              <p className="text-sm text-gray-600">Atlas Copco</p>
            </div>
            <div>
              <p className="text-sm font-medium">Model</p>
              <p className="text-sm text-gray-600">GA 30+</p>
            </div>
            <div>
              <p className="text-sm font-medium">Serial Number</p>
              <p className="text-sm text-gray-600">APC-2023-45678</p>
            </div>
            <div>
              <p className="text-sm font-medium">Installation Date</p>
              <p className="text-sm text-gray-600">June 15, 2022</p>
            </div>
          </div>
          
          <h5 className="font-medium mb-2">Maintenance History</h5>
          <div className="space-y-2 mb-4">
            {[
              { date: "Apr 12, 2023", type: "Preventive", task: "Filter Replacement & Inspection" },
              { date: "Jan 25, 2023", type: "Corrective", task: "Pressure Switch Replacement" },
              { date: "Oct 18, 2022", type: "Preventive", task: "Oil Change & General Inspection" }
            ].map((entry, i) => (
              <div key={i} className="p-2 bg-gray-50 rounded text-sm">
                <div className="flex justify-between">
                  <span className="font-medium">{entry.task}</span>
                  <span className="text-gray-500">{entry.date}</span>
                </div>
                <p className="text-xs text-gray-600">Type: {entry.type}</p>
              </div>
            ))}
          </div>
          
          <div className="flex space-x-2">
            <Button className="bg-fiix-500 hover:bg-fiix-600">Schedule Maintenance</Button>
            <Button variant="outline" className="border-fiix-300 text-fiix-600 hover:bg-fiix-50">View Documents</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetManagementContent;
