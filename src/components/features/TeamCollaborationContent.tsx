
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  MessageSquare, 
  Users, 
  Bell, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Send,
  UserPlus
} from "lucide-react";
import { toast } from "sonner";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  status: 'online' | 'offline' | 'away';
  lastSeen?: string;
}

interface Notification {
  id: string;
  type: 'task_assigned' | 'work_order_completed' | 'maintenance_due' | 'message';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  fromUser?: string;
}

const TeamCollaborationContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState("notifications");
  const [newMessage, setNewMessage] = useState("");
  
  // Mock data for demo
  const [teamMembers] = useState<TeamMember[]>([
    { id: '1', name: 'John Smith', role: 'Technician', status: 'online' },
    { id: '2', name: 'Sarah Johnson', role: 'Manager', status: 'away', lastSeen: '5 min ago' },
    { id: '3', name: 'Mike Davis', role: 'Supervisor', status: 'online' },
    { id: '4', name: 'Lisa Chen', role: 'Technician', status: 'offline', lastSeen: '2 hours ago' },
  ]);

  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'task_assigned',
      title: 'New Work Order Assigned',
      message: 'HVAC Maintenance has been assigned to you',
      timestamp: '5 minutes ago',
      read: false,
      fromUser: 'Sarah Johnson'
    },
    {
      id: '2',
      type: 'work_order_completed',
      title: 'Work Order Completed',
      message: 'Electrical inspection has been completed by Mike Davis',
      timestamp: '1 hour ago',
      read: false,
      fromUser: 'Mike Davis'
    },
    {
      id: '3',
      type: 'maintenance_due',
      title: 'Preventive Maintenance Due',
      message: 'Generator monthly check is due tomorrow',
      timestamp: '3 hours ago',
      read: true
    },
    {
      id: '4',
      type: 'message',
      title: 'Team Message',
      message: 'Team meeting scheduled for tomorrow at 9 AM',
      timestamp: '1 day ago',
      read: true,
      fromUser: 'Sarah Johnson'
    }
  ]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      toast.success("Message sent to team");
      setNewMessage("");
    }
  };

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, read: true }
          : notif
      )
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'task_assigned': return <UserPlus className="h-4 w-4" />;
      case 'work_order_completed': return <CheckCircle className="h-4 w-4" />;
      case 'maintenance_due': return <Clock className="h-4 w-4" />;
      case 'message': return <MessageSquare className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Collaboration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Stay connected with your maintenance team through real-time notifications and messaging.
          </p>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notifications
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="team" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Team Status
              </TabsTrigger>
              <TabsTrigger value="messages" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Quick Messages
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="notifications" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Recent Notifications</h3>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                    toast.success("All notifications marked as read");
                  }}
                >
                  Mark All Read
                </Button>
              </div>
              
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <Card 
                    key={notification.id} 
                    className={`cursor-pointer transition-colors hover:bg-gray-50 ${
                      !notification.read ? 'border-blue-200 bg-blue-50/50' : ''
                    }`}
                    onClick={() => handleMarkAsRead(notification.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-full ${
                          notification.type === 'task_assigned' ? 'bg-blue-100 text-blue-600' :
                          notification.type === 'work_order_completed' ? 'bg-green-100 text-green-600' :
                          notification.type === 'maintenance_due' ? 'bg-orange-100 text-orange-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm">{notification.title}</h4>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                            <Clock className="h-3 w-3" />
                            <span>{notification.timestamp}</span>
                            {notification.fromUser && (
                              <>
                                <span>•</span>
                                <span>from {notification.fromUser}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="team" className="space-y-4">
              <h3 className="text-lg font-medium">Team Members</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {teamMembers.map((member) => (
                  <Card key={member.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar>
                            <AvatarImage src={member.avatar} />
                            <AvatarFallback>
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(member.status)}`}></div>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{member.name}</h4>
                          <p className="text-sm text-gray-600">{member.role}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <Badge 
                              variant={member.status === 'online' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {member.status}
                            </Badge>
                            {member.lastSeen && (
                              <span className="text-xs text-gray-500">• {member.lastSeen}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="messages" className="space-y-4">
              <h3 className="text-lg font-medium">Quick Team Message</h3>
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Type your message to the team..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      />
                      <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="text-sm text-gray-500">
                      This will send a notification to all team members currently online.
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Recent Team Messages</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="text-xs">SJ</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">Sarah Johnson</span>
                          <span className="text-xs text-gray-500">2 hours ago</span>
                        </div>
                        <p className="text-sm mt-1">
                          Please prioritize the HVAC system check in Building A. We've received complaints about temperature control.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="text-xs">MD</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">Mike Davis</span>
                          <span className="text-xs text-gray-500">1 day ago</span>
                        </div>
                        <p className="text-sm mt-1">
                          Electrical inspection completed. Found a few minor issues that need attention next week.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamCollaborationContent;
