
import React from "react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface TasksHeaderProps {
  selectedDate: Date | undefined;
  onClearSelection: () => void;
}

const TasksHeader: React.FC<TasksHeaderProps> = ({ selectedDate, onClearSelection }) => {
  return (
    <div className="flex items-center justify-between mb-3">
      <h3 className="font-medium">
        {selectedDate 
          ? `Tasks for ${format(selectedDate, "MMMM d, yyyy")}` 
          : "All Upcoming Tasks"}
      </h3>
      {selectedDate && (
        <Button variant="outline" size="sm" onClick={onClearSelection}>
          Show All Tasks
        </Button>
      )}
    </div>
  );
};

export default TasksHeader;
