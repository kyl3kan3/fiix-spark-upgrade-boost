
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import UserList from "./UserList";
import MessageArea from "./MessageArea";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import { useMessages } from "@/hooks/useMessages";
import { ChatUser } from "@/types/chat";

const ChatInterface = () => {
  const { teamMembers, loading: loadingTeam } = useTeamMembers();
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const { messages, sendMessage, markAsRead, loading: loadingMessages } = useMessages(selectedUser?.id);

  // Select first user by default once team members are loaded
  useEffect(() => {
    if (teamMembers.length > 0 && !selectedUser) {
      setSelectedUser(teamMembers[0]);
    }
  }, [teamMembers, selectedUser]);

  const handleSendMessage = (content: string) => {
    if (selectedUser && content.trim()) {
      sendMessage(content, selectedUser.id);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-[calc(100vh-170px)]">
      <div className="md:col-span-1">
        <Card className="h-full">
          <CardContent className="p-4">
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
