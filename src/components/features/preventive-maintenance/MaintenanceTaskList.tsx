
import React from "react";
import { format } from "date-fns";
import { CheckCircle2, RepeatIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface PmTask {
 id: string;
 title: string;
 asset: string;
 dueDate: Date;
 priority: "low" | "medium" | "high";
 isRecurring: boolean;
}

interface MaintenanceTaskListProps {
 tasks: PmTask[];
 selectedDate: Date | undefined;
 onCompleteTask?: (taskId: string) => void;
 isCompleting?: boolean;
}

const MaintenanceTaskList: React.FC<MaintenanceTaskListProps> = ({
 tasks,
 selectedDate,
 onCompleteTask,
 isCompleting,
}) => {
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
 <CheckCircle2 className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
 <p className="text-muted-foreground">No maintenance tasks found for this date</p>
 </div>
 );
 }

 return (
 <div className="space-y-3">
 {filteredTasks.map((task) => (
 <div
 key={task.id}
 className="p-3 bg-card rounded border flex justify-between items-center gap-3 hover:bg-muted transition-colors"
 >
 <div className="min-w-0">
 <div className="flex items-center gap-2">
 <p className="font-medium truncate">{task.title}</p>
 {task.isRecurring && (
 <span className="inline-flex items-center text-xs px-2 py-1 rounded-full bg-primary/10 text-primary shrink-0">
 <RepeatIcon className="h-3 w-3 mr-1" />
 Recurring
 </span>
 )}
 </div>
 <p className="text-sm text-muted-foreground">Asset: {task.asset}</p>
 </div>
 <div className="flex items-center gap-3 shrink-0">
 <div className="flex flex-col items-end">
 <span className="text-sm font-medium text-primary">
 {format(task.dueDate, "MMM d")}
 </span>
 <span className={`text-xs px-2 py-1 rounded-full ${task.priority === 'high' ? 'bg-destructive/10 text-destructive' : task.priority === 'medium' ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'}`}
 >
 {task.priority}
 </span>
 </div>
 {onCompleteTask && (
 <Button
 variant="outline"
 size="sm"
 className="text-xs"
 disabled={isCompleting}
 onClick={() => onCompleteTask(task.id)}
 >
 <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
 Complete
 </Button>
 )}
 </div>
 </div>
 ))}
 </div>
 );
};

export default MaintenanceTaskList;
