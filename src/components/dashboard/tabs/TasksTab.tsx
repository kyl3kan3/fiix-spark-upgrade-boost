
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, PlusCircle, Settings } from "lucide-react";

const TasksTab: React.FC = () => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>My Tasks</CardTitle>
          <CardDescription>Manage your pending tasks</CardDescription>
        </div>
        <Button size="sm" className="bg-maintenease-600 hover:bg-maintenease-700">
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[
            { id: 1, title: "Review equipment inspection reports", dueDate: "2023-05-15", status: "pending", priority: "high" },
            { id: 2, title: "Schedule preventive maintenance for Line B", dueDate: "2023-05-18", status: "in-progress", priority: "medium" },
            { id: 3, title: "Order replacement parts for HVAC system", dueDate: "2023-05-20", status: "pending", priority: "medium" },
            { id: 4, title: "Complete safety audit documentation", dueDate: "2023-05-22", status: "pending", priority: "high" },
            { id: 5, title: "Train new maintenance staff", dueDate: "2023-05-25", status: "not-started", priority: "low" },
          ].map((task) => (
            <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
              <div className="flex items-start gap-3">
                <div className="pt-1">
                  <CheckCircle className={`h-5 w-5 ${
                    task.status === "completed" 
                      ? "text-green-500 fill-green-500" 
                      : "text-gray-300"
                  }`} />
                </div>
                <div>
                  <p className="font-medium">{task.title}</p>
                  <p className="text-sm text-gray-500">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium
                  ${task.priority === "high" ? "bg-red-100 text-red-800" : 
                    task.priority === "medium" ? "bg-yellow-100 text-yellow-800" : 
                    "bg-green-100 text-green-800"}`}
                >
                  {task.priority}
                </span>
                <Button variant="ghost" size="sm">
                  <span className="sr-only">Edit</span>
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">Mark All Complete</Button>
        <Button variant="outline">View All Tasks</Button>
      </CardFooter>
    </Card>
  );
};

export default TasksTab;
