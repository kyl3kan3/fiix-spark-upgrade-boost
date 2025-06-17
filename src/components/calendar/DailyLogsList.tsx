
import React, { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, Trash2, Eye } from "lucide-react";
import { format } from "date-fns";
import { useDailyLogs } from "@/hooks/useDailyLogs";

interface DailyLogsListProps {
  onViewLog?: (date: Date) => void;
}

const DailyLogsList: React.FC<DailyLogsListProps> = ({ onViewLog }) => {
  const { allDailyLogs, isLoading, loadAllDailyLogs, deleteDailyLog } = useDailyLogs();

  useEffect(() => {
    loadAllDailyLogs();
  }, []);

  const handleViewLog = (dateString: string) => {
    if (onViewLog) {
      onViewLog(new Date(dateString));
    }
  };

  const handleDeleteLog = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this daily log?')) {
      await deleteDailyLog(id);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-maintenease-600"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          All Daily Logs
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {allDailyLogs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No daily logs found. Create your first daily log by selecting a date.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {allDailyLogs.map((log) => (
              <div key={log.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div>
                      <h4 className="font-semibold">
                        {format(new Date(log.date), "MMMM d, yyyy")}
                      </h4>
                      {log.technician && (
                        <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                          <User className="h-3 w-3" />
                          <span>{log.technician}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      {log.equipment_readings.length > 0 && (
                        <Badge variant="secondary">
                          {log.equipment_readings.length} readings
                        </Badge>
                      )}
                      {log.tasks.length > 0 && (
                        <Badge variant="secondary">
                          {log.tasks.length} tasks
                        </Badge>
                      )}
                      {log.incidents.length > 0 && (
                        <Badge variant="destructive">
                          {log.incidents.length} incidents
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewLog(log.date)}
                      className="flex items-center gap-1"
                    >
                      <Eye className="h-3 w-3" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteLog(log.id!)}
                      className="flex items-center gap-1 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                      Delete
                    </Button>
                  </div>
                </div>
                
                {log.notes && (
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                    {log.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DailyLogsList;
