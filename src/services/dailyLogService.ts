
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";

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

// Helper functions to convert between Json and our types
const parseJsonArray = <T>(jsonData: Json | null, fallback: T[] = []): T[] => {
  if (!jsonData) return fallback;
  if (Array.isArray(jsonData)) return jsonData as T[];
  return fallback;
};

const convertDbRowToLogEntry = (data: any): DailyLogEntry => {
  return {
    ...data,
    equipment_readings: parseJsonArray<EquipmentReading>(data.equipment_readings, []),
    tasks: parseJsonArray<DailyTask>(data.tasks, []),
    incidents: parseJsonArray<Incident>(data.incidents, []),
  };
};

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

    return data ? convertDbRowToLogEntry(data) : null;
  }

  static async saveDailyLog(logEntry: DailyLogEntry): Promise<DailyLogEntry> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Clean up time fields - if empty, set to null
    const cleanShiftStart = logEntry.shift_start?.trim() || null;
    const cleanShiftEnd = logEntry.shift_end?.trim() || null;

    const logData = {
      user_id: user.id,
      date: logEntry.date,
      technician: logEntry.technician?.trim() || null,
      shift_start: cleanShiftStart,
      shift_end: cleanShiftEnd,
      equipment_readings: JSON.parse(JSON.stringify(logEntry.equipment_readings)) as Json,
      tasks: JSON.parse(JSON.stringify(logEntry.tasks)) as Json,
      incidents: JSON.parse(JSON.stringify(logEntry.incidents)) as Json,
      notes: logEntry.notes?.trim() || null,
      weather_conditions: logEntry.weather_conditions?.trim() || null,
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

    return convertDbRowToLogEntry(data);
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

    return (data || []).map(convertDbRowToLogEntry);
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
