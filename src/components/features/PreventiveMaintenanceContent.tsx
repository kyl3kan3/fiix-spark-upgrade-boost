
import React from "react";
import { Button } from "@/components/ui/button";

const PreventiveMaintenanceContent: React.FC = () => {
  return (
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
  );
};

export default PreventiveMaintenanceContent;
