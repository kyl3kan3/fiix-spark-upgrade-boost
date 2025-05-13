
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import UserList from "./UserList";
import MessageArea from "./MessageArea";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import { useMessages } from "@/hooks/useMessages";
import { ChatUser } from "@/types/chat";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";
import { toast } from "sonner";

const ChatInterface = () => {
  const { teamMembers, loading: loadingTeam, refreshTeamMembers } = useTeamMembers();
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const { messages, sendMessage, markAsRead, loading: loadingMessages } = useMessages(selectedUser?.id);

  // Select first user by default once team members are loaded
  useEffect(() => {
    if (teamMembers.length > 0 && !selectedUser) {
      // Find user with unread messages if any, otherwise select first user
      const userWithUnread = teamMembers.find(user => user.unread > 0);
      setSelectedUser(userWithUnread || teamMembers[0]);
    } else if (teamMembers.length === 0) {
      setSelectedUser(null);
    } else if (selectedUser) {
      // Update selected user if it's in teamMembers
      const updatedUser = teamMembers.find(user => user.id === selectedUser.id);
      if (updatedUser && (
        updatedUser.name !== selectedUser.name || 
        updatedUser.online !== selectedUser.online || 
        updatedUser.unread !== selectedUser.unread
      )) {
        setSelectedUser(updatedUser);
      }
    }
  }, [teamMembers, selectedUser]);

  const handleSendMessage = (content: string) => {
    if (selectedUser && content.trim()) {
      sendMessage(content, selectedUser.id);
    }
  };

  const handleRefresh = () => {
    refreshTeamMembers();
    toast.success("Team members refreshed");
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-[calc(100vh-170px)]">
      <div className="md:col-span-1">
        <Card className="h-full">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Team Chat</h3>
              <Button variant="ghost" size="sm" onClick={handleRefresh} title="Refresh team members">
                <RefreshCcw className="h-4 w-4" />
              </Button>
            </div>
            <UserList 
              users={teamMembers} 
              selectedUser={selectedUser} 
              onSelectUser={setSelectedUser} 
              loading={loadingTeam}
            />
          </CardContent>
        </Card>
      </div>
      
      <div className="md:col-span-3">
        <Card className="h-full flex flex-col">
          <CardContent className="p-0 flex-1 flex flex-col">
            <MessageArea 
              selectedUser={selectedUser}
              messages={messages}
              onSendMessage={handleSendMessage}
              loading={loadingMessages}
              onMarkAsRead={markAsRead}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChatInterface;
