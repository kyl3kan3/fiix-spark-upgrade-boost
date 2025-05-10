
import React from "react";
import { Button } from "@/components/ui/button";

const WorkOrderContent: React.FC = () => {
  return (
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
  );
};

export default WorkOrderContent;
