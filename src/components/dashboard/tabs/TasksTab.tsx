
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, PlusCircle, Settings } from "lucide-react";

const TasksTab: React.FC = () => {
  return (
    <Card className="transition-colors dark:border-gray-700">
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
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No tasks available. Add a new task to get started.
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" className="dark:border-gray-700 dark:hover:bg-gray-800">Mark All Complete</Button>
        <Button variant="outline" className="dark:border-gray-700 dark:hover:bg-gray-800">View All Tasks</Button>
      </CardFooter>
    </Card>
  );
};

export default TasksTab;
