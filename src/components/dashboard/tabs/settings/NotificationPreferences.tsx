
import React from "react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface NotificationPreference {
 id: number;
 title: string;
 description: string;
 enabled: boolean;
}

interface NotificationPreferencesProps {
 preferences: NotificationPreference[];
 onToggle: (id: number) => void;
}

const NotificationPreferences: React.FC<NotificationPreferencesProps> = ({
 preferences,
 onToggle,
}) => {
 return (
 <div className="space-y-4">
 <h3 className="text-lg font-medium">Notification Preferences</h3>
 <div className="grid gap-4">
 {preferences.map((pref) => (
 <div 
 key={pref.id} 
 className="flex items-center justify-between p-3 border rounded-md dark:border-border dark:bg-card/50"
 >
 <div>
 <p className="font-medium">{pref.title}</p>
 <p className="text-sm text-muted-foreground dark:text-muted-foreground">{pref.description}</p>
 </div>
 <Switch
 checked={pref.enabled}
 onCheckedChange={() => onToggle(pref.id)}
 className="cursor-pointer"
 />
 </div>
 ))}
 </div>
 </div>
 );
};

export default NotificationPreferences;
