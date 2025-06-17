
import { useState, useEffect } from "react";
import { DailyLogService, DailyLogEntry } from "@/services/dailyLogService";
import { toast } from "sonner";

export const useDailyLogs = (selectedDate?: Date) => {
  const [dailyLog, setDailyLog] = useState<DailyLogEntry | null>(null);
  const [allDailyLogs, setAllDailyLogs] = useState<DailyLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load daily log for selected date
  useEffect(() => {
    if (selectedDate) {
      loadDailyLog(selectedDate);
    }
  }, [selectedDate]);

  const loadDailyLog = async (date: Date) => {
    setIsLoading(true);
    try {
      const log = await DailyLogService.getDailyLog(date);
      setDailyLog(log);
    } catch (error) {
      console.error('Error loading daily log:', error);
      toast.error('Failed to load daily log');
    } finally {
      setIsLoading(false);
    }
  };

  const saveDailyLog = async (logEntry: DailyLogEntry) => {
    setIsSaving(true);
    try {
      const savedLog = await DailyLogService.saveDailyLog(logEntry);
      setDailyLog(savedLog);
      toast.success('Daily log saved successfully');
      return savedLog;
    } catch (error) {
      console.error('Error saving daily log:', error);
      toast.error('Failed to save daily log');
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const loadAllDailyLogs = async () => {
    setIsLoading(true);
    try {
      const logs = await DailyLogService.getAllDailyLogs();
      setAllDailyLogs(logs);
    } catch (error) {
      console.error('Error loading daily logs:', error);
      toast.error('Failed to load daily logs');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteDailyLog = async (id: string) => {
    try {
      await DailyLogService.deleteDailyLog(id);
      setAllDailyLogs(prev => prev.filter(log => log.id !== id));
      if (dailyLog?.id === id) {
        setDailyLog(null);
      }
      toast.success('Daily log deleted successfully');
    } catch (error) {
      console.error('Error deleting daily log:', error);
      toast.error('Failed to delete daily log');
    }
  };

  return {
    dailyLog,
    allDailyLogs,
    isLoading,
    isSaving,
    saveDailyLog,
    loadDailyLog,
    loadAllDailyLogs,
    deleteDailyLog,
  };
};
