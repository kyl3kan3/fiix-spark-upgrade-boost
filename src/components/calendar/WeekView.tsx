
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const WeekView: React.FC = () => {
  return (
    <div className="w-full">
      <Tabs defaultValue="week-view">
        <TabsList className="mb-4 w-full sm:w-auto">
          <TabsTrigger value="week-view" className="text-xs sm:text-sm">Week View</TabsTrigger>
        </TabsList>
        
        <TabsContent value="week-view">
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-xs sm:text-sm">
              <thead>
                <tr>
                  <th className="border p-1 sm:p-2 bg-gray-50 text-xs sm:text-sm font-medium">Time</th>
                  <th className="border p-1 sm:p-2 bg-gray-50 text-xs sm:text-sm font-medium">Mon</th>
                  <th className="border p-1 sm:p-2 bg-gray-50 text-xs sm:text-sm font-medium">Tue</th>
                  <th className="border p-1 sm:p-2 bg-gray-50 text-xs sm:text-sm font-medium">Wed</th>
                  <th className="border p-1 sm:p-2 bg-gray-50 text-xs sm:text-sm font-medium">Thu</th>
                  <th className="border p-1 sm:p-2 bg-gray-50 text-xs sm:text-sm font-medium">Fri</th>
                </tr>
              </thead>
              <tbody>
                {["9:00 AM", "11:00 AM", "1:00 PM", "3:00 PM"].map((time) => (
                  <tr key={time}>
                    <td className="border p-1 sm:p-2 font-medium text-xs sm:text-sm whitespace-nowrap">{time}</td>
                    {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day) => (
                      <td key={`${day}-${time}`} className="border p-1 sm:p-2 min-w-[100px]">
                        {Math.random() > 0.7 ? (
                          <div className="p-1 bg-blue-50 border border-blue-200 rounded text-xs">
                            {["HVAC Check", "Electrical Inspection", "Plumbing Repair", "Generator Test"][Math.floor(Math.random() * 4)]}
                          </div>
                        ) : null}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WeekView;
