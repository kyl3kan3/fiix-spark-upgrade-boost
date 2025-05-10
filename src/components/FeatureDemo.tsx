
import React from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from "react-router-dom";

// Content for each feature demo
const demoContent = {
  "Work Order Management": {
    title: "Work Order Management",
    description: "Create, track, and manage work orders in real-time",
    content: (
      <div className="space-y-6">
        <div className="bg-gray-100 p-6 rounded-lg">
          <h3 className="text-lg font-medium mb-4">Create New Work Order</h3>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input 
                type="text" 
                className="w-full p-2 border rounded-md" 
                placeholder="Enter work order title"
                defaultValue="Replace Pump Bearings" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Priority</label>
              <select className="w-full p-2 border rounded-md">
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea 
                className="w-full p-2 border rounded-md" 
                rows={3}
                defaultValue="Replace worn bearings in pump #3 on production line A"
              ></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Assign To</label>
              <select className="w-full p-2 border rounded-md">
                <option>John Doe (Maintenance)</option>
                <option>Sarah Smith (Engineering)</option>
                <option>Michael Brown (Operations)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Due Date</label>
              <input type="date" className="w-full p-2 border rounded-md" />
            </div>
            <Button className="w-full bg-fiix-500 hover:bg-fiix-600">Create Work Order</Button>
          </form>
        </div>
        
        <div className="bg-gray-100 p-6 rounded-lg">
          <h3 className="text-lg font-medium mb-4">Recent Work Orders</h3>
          <div className="space-y-2">
            {[
              { id: "WO-2023-056", title: "Replace Air Filter", status: "In Progress", assignee: "John Doe" },
              { id: "WO-2023-055", title: "Calibrate Pressure Gauge", status: "Completed", assignee: "Sarah Smith" },
              { id: "WO-2023-054", title: "Inspect Conveyor Belt", status: "Pending", assignee: "Michael Brown" }
            ].map((order) => (
              <div key={order.id} className="p-3 bg-white rounded border flex justify-between items-center">
                <div>
                  <p className="font-medium">{order.title}</p>
                  <p className="text-sm text-gray-500">{order.id} • Assigned to: {order.assignee}</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  order.status === "Completed" ? "bg-green-100 text-green-800" :
                  order.status === "In Progress" ? "bg-blue-100 text-blue-800" :
                  "bg-yellow-100 text-yellow-800"
                }`}>
                  {order.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  },
  "Preventive Maintenance": {
    title: "Preventive Maintenance",
    description: "Schedule and manage recurring maintenance tasks",
    content: (
      <div className="space-y-6">
        <div className="bg-gray-100 p-6 rounded-lg">
          <h3 className="text-lg font-medium mb-4">Maintenance Schedule</h3>
          <div className="grid grid-cols-7 gap-1 text-center mb-4">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="p-2 bg-gray-200 font-medium">{day}</div>
            ))}
            {Array(31).fill(0).map((_, i) => {
              const hasTask = [3, 8, 12, 15, 22, 27].includes(i + 1);
              return (
                <div key={i} className={`p-2 border ${hasTask ? "bg-fiix-100 border-fiix-500" : ""}`}>
                  {i + 1}
                  {hasTask && <div className="w-2 h-2 bg-fiix-500 rounded-full mx-auto mt-1"></div>}
                </div>
              );
            })}
          </div>
          <h4 className="font-medium mb-2">Upcoming Tasks</h4>
          <div className="space-y-2">
            {[
              { date: "May 15", title: "HVAC Filter Change", asset: "Building A" },
              { date: "May 22", title: "Machine Lubrication", asset: "Production Line 2" },
              { date: "May 27", title: "Safety Inspection", asset: "Warehouse" }
            ].map((task, i) => (
              <div key={i} className="p-3 bg-white rounded border flex justify-between items-center">
                <div>
                  <p className="font-medium">{task.title}</p>
                  <p className="text-sm text-gray-500">Asset: {task.asset}</p>
                </div>
                <span className="text-sm font-medium text-fiix-600">{task.date}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-gray-100 p-6 rounded-lg">
          <h3 className="text-lg font-medium mb-4">Create PM Schedule</h3>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Task Name</label>
              <input type="text" className="w-full p-2 border rounded-md" placeholder="e.g., Oil Change" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Asset</label>
              <select className="w-full p-2 border rounded-md">
                <option>Select Asset</option>
                <option>Production Line 1</option>
                <option>Production Line 2</option>
                <option>Warehouse Equipment</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Frequency</label>
              <div className="flex space-x-2">
                <input type="number" min="1" className="w-20 p-2 border rounded-md" defaultValue="1" />
                <select className="flex-1 p-2 border rounded-md">
                  <option>Days</option>
                  <option>Weeks</option>
                  <option>Months</option>
                  <option>Years</option>
                </select>
              </div>
            </div>
            <Button className="w-full bg-fiix-500 hover:bg-fiix-600">Create Schedule</Button>
          </form>
        </div>
      </div>
    )
  },
  "Asset Management": {
    title: "Asset Management",
    description: "Track and manage all your equipment and assets",
    content: (
      <div className="space-y-6">
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
    )
  }
};

const FeatureDemo = () => {
  const { featureId } = useParams();
  const navigate = useNavigate();
  const decodedFeatureId = featureId ? decodeURIComponent(featureId) : null;
  
  const feature = decodedFeatureId ? demoContent[decodedFeatureId as keyof typeof demoContent] : null;

  if (!feature) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Feature Demo Not Found</h2>
        <p className="mb-8">The requested feature demo is not available.</p>
        <Button 
          onClick={() => navigate('/dashboard')} 
          className="bg-fiix-500 hover:bg-fiix-600"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Return to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <Button 
        onClick={() => navigate('/dashboard')} 
        className="mb-6 bg-gray-100 hover:bg-gray-200 text-gray-800"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{feature.title}</h1>
        <p className="text-xl text-gray-600">{feature.description}</p>
      </div>
      
      {feature.content}
    </div>
  );
};

export default FeatureDemo;
