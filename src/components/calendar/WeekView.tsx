
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const WeekView: React.FC = () => {
  return (
    <div className="overflow-x-auto">
      <Tabs defaultValue="week-view">
        <TabsContent value="week-view">
          <table className="min-w-full border-collapse">
            <thead>
              <tr>
                <th className="border p-2 bg-gray-50">Time</th>
                <th className="border p-2 bg-gray-50">Monday</th>
                <th className="border p-2 bg-gray-50">Tuesday</th>
                <th className="border p-2 bg-gray-50">Wednesday</th>
                <th className="border p-2 bg-gray-50">Thursday</th>
                <th className="border p-2 bg-gray-50">Friday</th>
              </tr>
            </thead>
            <tbody>
              {["9:00 AM", "11:00 AM", "1:00 PM", "3:00 PM"].map((time) => (
                <tr key={time}>
                  <td className="border p-2 font-medium text-sm">{time}</td>
                  {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day) => (
                    <td key={`${day}-${time}`} className="border p-2">
                      {Math.random() > 0.7 ? (
                        <div className="p-1 bg-blue-50 border border-blue-200 rounded text-sm">
                          {["HVAC Check", "Electrical Inspection", "Plumbing Repair", "Generator Test"][Math.floor(Math.random() * 4)]}
                        </div>
                      ) : null}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WeekView;
