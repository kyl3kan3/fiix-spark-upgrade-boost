
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MoreHorizontal } from "lucide-react";

const DashboardTasksOverview = () => {
  const tasksByCategory = [
    {
      category: "Preventive Maintenance",
      total: 12,
      completed: 5,
      color: "bg-blue-500",
    },
    {
      category: "Repairs",
      total: 8,
      completed: 3,
      color: "bg-yellow-500",
    },
    {
      category: "Inspections",
      total: 6,
      completed: 4,
      color: "bg-green-500",
    },
    {
      category: "Safety Checks",
      total: 4,
      completed: 1,
      color: "bg-red-500",
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Tasks Overview</CardTitle>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tasksByCategory.map((category, index) => {
            const percentage = (category.completed / category.total) * 100;
            
            return (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>{category.category}</span>
                  <span>
                    {category.completed}/{category.total} tasks
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${category.color} rounded-full`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-6 pt-4 border-t">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Overall Progress</span>
            <span>13/30 tasks (43%)</span>
          </div>
          <div className="mt-1 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-maintenease-500 rounded-full"
              style={{ width: "43%" }}
            ></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardTasksOverview;
