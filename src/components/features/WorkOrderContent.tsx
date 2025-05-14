
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
              placeholder="Enter work order description"
            ></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Assign To</label>
            <select className="w-full p-2 border rounded-md">
              <option>Select a technician</option>
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
        <div className="text-center py-4 text-gray-500">
          No work orders available yet
        </div>
      </div>
    </div>
  );
};

export default WorkOrderContent;
