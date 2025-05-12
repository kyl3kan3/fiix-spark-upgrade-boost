
import React from "react";
import { format } from "date-fns";
import { CheckCircle2 } from "lucide-react";

interface MaintenanceTask {
  id: number;
  title: string;
  asset: string;
  dueDate: Date;
  priority: "low" | "medium" | "high";
}

interface MaintenanceTaskListProps {
  tasks: MaintenanceTask[];
  selectedDate: Date | undefined;
}

const MaintenanceTaskList: React.FC<MaintenanceTaskListProps> = ({ tasks, selectedDate }) => {
  // Display only tasks for selected date or all if no date selected
  const filteredTasks = selectedDate 
    ? tasks.filter(task => 
        task.dueDate.getDate() === selectedDate.getDate() && 
        task.dueDate.getMonth() === selectedDate.getMonth() && 
        task.dueDate.getFullYear() === selectedDate.getFullYear())
    : tasks;

  if (filteredTasks.length === 0) {
    return (
      <div className="py-8 text-center">
        <CheckCircle2 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">No maintenance tasks found for this date</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {filteredTasks.map((task) => (
        <div 
          key={task.id} 
          className="p-3 bg-white rounded border flex justify-between items-center hover:bg-gray-50 transition-colors"
        >
          <div>
            <p className="font-medium">{task.title}</p>
            <p className="text-sm text-gray-500">Asset: {task.asset}</p>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-sm font-medium text-fiix-600">
              {format(task.dueDate, "MMM d")}
            </span>
            <span className={`text-xs px-2 py-1 rounded-full 
              ${task.priority === 'high' ? 'bg-red-100 text-red-800' : 
                task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                'bg-green-100 text-green-800'}`}
            >
              {task.priority}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MaintenanceTaskList;
