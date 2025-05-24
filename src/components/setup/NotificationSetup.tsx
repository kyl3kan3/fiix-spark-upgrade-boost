
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, Clock, AlertTriangle, MessageSquare, AlarmClock, Mail, Smartphone } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";

interface NotificationSettingsProps {
  data: any;
  onUpdate: (data: any) => void;
}

interface NotificationPreference {
  id: string;
  name: string;
  description: string;
  email: boolean;
  push: boolean;
  inApp: boolean;
}

const defaultNotifications: NotificationPreference[] = [
  {
    id: "work_order_assigned",
    name: "Work Order Assignment",
    description: "Notify when a work order is assigned to you",
    email: true,
    push: true,
    inApp: true
  },
  {
    id: "work_order_status",
    name: "Work Order Status Change",
    description: "Notify when status changes on work orders you are involved with",
    email: true,
    push: true,
    inApp: true
  },
  {
    id: "work_order_comment",
    name: "New Comment",
    description: "Notify when someone comments on a work order",
    email: false,
    push: true,
    inApp: true
  },
  {
    id: "work_order_due",
    name: "Work Order Due Soon",
    description: "Notify when work orders are approaching their due date",
    email: true,
    push: true,
    inApp: true
  },
  {
    id: "work_order_overdue",
    name: "Work Order Overdue",
    description: "Notify when work orders become overdue",
    email: true,
    push: true,
    inApp: true
  },
  {
    id: "maintenance_scheduled",
    name: "Scheduled Maintenance",
    description: "Notify about upcoming scheduled maintenance tasks",
    email: true,
    push: false,
    inApp: true
  },
  {
    id: "asset_status",
    name: "Asset Status Change",
    description: "Notify when an asset changes status",
    email: false,
    push: false,
    inApp: true
  }
];

interface EscalationSetting {
  enabled: boolean;
  threshold: number;
  notifyManager: boolean;
}

interface ReminderSetting {
  enabled: boolean;
  days: number;
}

const NotificationSetup: React.FC<NotificationSettingsProps> = ({ data, onUpdate }) => {
  const [notifications, setNotifications] = useState<NotificationPreference[]>(
    data?.notifications || defaultNotifications
  );
  
  const [escalation, setEscalation] = useState<EscalationSetting>(
    data?.escalation || {
      enabled: true,
      threshold: 24,
      notifyManager: true
    }
  );
  
  const [reminder, setReminder] = useState<ReminderSetting>(
    data?.reminder || {
      enabled: true,
      days: 3
    }
  );
  
  const [emailDigest, setEmailDigest] = useState<string>(
    data?.emailDigest || "daily"
  );

  const handleNotificationChange = (id: string, channel: 'email' | 'push' | 'inApp', value: boolean) => {
    const updated = notifications.map(notification => {
      if (notification.id === id) {
        return {
          ...notification,
          [channel]: value
        };
      }
      return notification;
    });
    
    setNotifications(updated);
    onUpdate({
      notifications: updated,
      escalation,
      reminder,
      emailDigest
    });
  };

  const handleEscalationChange = (field: keyof EscalationSetting, value: any) => {
    const updated = {
      ...escalation,
      [field]: value
    };
    
    setEscalation(updated);
    onUpdate({
      notifications,
      escalation: updated,
      reminder,
      emailDigest
    });
  };

  const handleReminderChange = (field: keyof ReminderSetting, value: any) => {
    const updated = {
      ...reminder,
      [field]: value
    };
    
    setReminder(updated);
    onUpdate({
      notifications,
      escalation,
      reminder: updated,
      emailDigest
    });
  };

  const handleEmailDigestChange = (value: string) => {
    setEmailDigest(value);
    onUpdate({
      notifications,
      escalation,
      reminder,
      emailDigest: value
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Bell className="h-6 w-6 text-maintenease-600" />
        <h2 className="text-xl font-semibold">Notification Preferences</h2>
      </div>
      
      <p className="text-muted-foreground">
        Configure how and when you want to receive notifications from MaintenEase.
      </p>

      <Tabs defaultValue="channels">
        <TabsList>
          <TabsTrigger value="channels">Notification Channels</TabsTrigger>
          <TabsTrigger value="timing">Timing & Escalation</TabsTrigger>
        </TabsList>
        
        <TabsContent value="channels" className="pt-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Channels</CardTitle>
              <CardDescription>
                Choose how you want to be notified for different events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-3 border-b">
                  <div className="font-medium">Event Type</div>
                  <div className="flex items-center gap-8">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Email</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Push</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">In-App</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="flex items-center justify-between py-2">
                      <div className="space-y-0.5">
                        <div className="font-medium">{notification.name}</div>
                        <div className="text-sm text-muted-foreground">{notification.description}</div>
                      </div>
                      <div className="flex items-center gap-12">
                        <Switch
                          checked={notification.email}
                          onCheckedChange={(checked) => 
                            handleNotificationChange(notification.id, 'email', checked)
                          }
                        />
                        <Switch
                          checked={notification.push}
                          onCheckedChange={(checked) => 
                            handleNotificationChange(notification.id, 'push', checked)
                          }
                        />
                        <Switch
                          checked={notification.inApp}
                          onCheckedChange={(checked) => 
                            handleNotificationChange(notification.id, 'inApp', checked)
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
                
                <Separator className="my-6" />
                
                <div className="space-y-4">
                  <h3 className="font-medium">Email Digest</h3>
                  <p className="text-sm text-muted-foreground">
                    Receive a summary of all notifications in a digest email
                  </p>
                  
                  <div className="flex items-center gap-4">
                    <Select value={emailDigest} onValueChange={handleEmailDigestChange}>
                      <SelectTrigger className="w-60">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="off">Don't send digest</SelectItem>
                        <SelectItem value="daily">Daily digest</SelectItem>
                        <SelectItem value="weekly">Weekly digest</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="timing" className="pt-6 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-maintenease-600" />
                <CardTitle>Due Date Reminders</CardTitle>
              </div>
              <CardDescription>
                Receive advance notice before work orders are due
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Switch
                  id="reminder-toggle"
                  checked={reminder.enabled}
                  onCheckedChange={(checked) => handleReminderChange('enabled', checked)}
                />
                <Label htmlFor="reminder-toggle">Send reminders for upcoming due dates</Label>
              </div>
              
              <div className="flex items-end gap-4 pt-2">
                <div className="space-y-1.5">
                  <Label>Days before due date</Label>
                  <Input
                    type="number"
                    min="1"
                    max="14"
                    value={reminder.days}
                    onChange={(e) => handleReminderChange('days', parseInt(e.target.value) || 1)}
                    disabled={!reminder.enabled}
                    className="w-24"
                  />
                </div>
                <p className="text-sm text-muted-foreground pb-2">
                  {reminder.enabled 
                    ? `You'll be notified ${reminder.days} day${reminder.days !== 1 ? 's' : ''} before work orders are due`
                    : 'Reminders are disabled'}
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-maintenease-600" />
                <CardTitle>Overdue Escalation</CardTitle>
              </div>
              <CardDescription>
                Automatically escalate overdue work orders to management
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Switch
                  id="escalation-toggle"
                  checked={escalation.enabled}
                  onCheckedChange={(checked) => handleEscalationChange('enabled', checked)}
                />
                <Label htmlFor="escalation-toggle">Enable escalation for overdue work orders</Label>
              </div>
              
              <div className="flex items-end gap-4 pt-2">
                <div className="space-y-1.5">
                  <Label>Hours overdue</Label>
                  <Input
                    type="number"
                    min="1"
                    max="72"
                    value={escalation.threshold}
                    onChange={(e) => handleEscalationChange('threshold', parseInt(e.target.value) || 1)}
                    disabled={!escalation.enabled}
                    className="w-24"
                  />
                </div>
                <p className="text-sm text-muted-foreground pb-2">
                  {escalation.enabled 
                    ? `Work orders will be escalated after being overdue for ${escalation.threshold} hour${escalation.threshold !== 1 ? 's' : ''}`
                    : 'Escalation is disabled'}
                </p>
              </div>
              
              <div className="flex items-center space-x-4 pt-2">
                <Switch
                  id="manager-notification"
                  checked={escalation.notifyManager}
                  onCheckedChange={(checked) => handleEscalationChange('notifyManager', checked)}
                  disabled={!escalation.enabled}
                />
                <Label htmlFor="manager-notification" className={escalation.enabled ? '' : 'text-muted-foreground'}>
                  Notify managers for escalated work orders
                </Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotificationSetup;
