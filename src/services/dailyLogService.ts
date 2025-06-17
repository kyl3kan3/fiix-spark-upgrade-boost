
import { supabase } from "@/integrations/supabase/client";

export interface DailyLogEntry {
  id?: string;
  user_id?: string;
  date: string;
  technician?: string;
  shift_start?: string;
  shift_end?: string;
  equipment_readings: EquipmentReading[];
  tasks: DailyTask[];
  incidents: Incident[];
  notes?: string;
  weather_conditions?: string;
  created_at?: string;
  updated_at?: string;
}

export interface EquipmentReading {
  id: string;
  equipment: string;
  type: "temperature" | "pressure" | "fluid_level" | "status";
  value: string;
  unit: string;
  status: "normal" | "warning" | "critical";
}

export interface DailyTask {
  id: string;
  description: string;
  completed: boolean;
  assetId?: string;
}

export interface Incident {
  id: string;
  description: string;
  severity: "low" | "medium" | "high";
  resolved: boolean;
}

export class DailyLogService {
  static async getDailyLog(date: Date): Promise<DailyLogEntry | null> {
    const dateString = date.toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('date', dateString)
      .maybeSingle();

    if (error) {
      console.error('Error fetching daily log:', error);
      throw error;
    }

    return data;
  }

  static async saveDailyLog(logEntry: DailyLogEntry): Promise<DailyLogEntry> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const logData = {
      user_id: user.id,
      date: logEntry.date,
      technician: logEntry.technician,
      shift_start: logEntry.shift_start,
      shift_end: logEntry.shift_end,
      equipment_readings: logEntry.equipment_readings,
      tasks: logEntry.tasks,
      incidents: logEntry.incidents,
      notes: logEntry.notes,
      weather_conditions: logEntry.weather_conditions,
    };

    const { data, error } = await supabase
      .from('daily_logs')
      .upsert(logData, {
        onConflict: 'user_id,date'
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving daily log:', error);
      throw error;
    }

    return data;
  }

  static async getAllDailyLogs(): Promise<DailyLogEntry[]> {
    const { data, error } = await supabase
      .from('daily_logs')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching daily logs:', error);
      throw error;
    }

    return data || [];
  }

  static async deleteDailyLog(id: string): Promise<void> {
    const { error } = await supabase
      .from('daily_logs')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting daily log:', error);
      throw error;
    }
  }
}
