
import React, { useState, useEffect } from "react";
import UserList from "./UserList";
import MessageArea from "./MessageArea";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import { useMessages } from "@/hooks/useMessages";
import { ChatUser } from "@/types/chat";
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
      const userWithUnread = teamMembers.find((user) => user.unread > 0);
      setSelectedUser(userWithUnread || teamMembers[0]);
    } else if (teamMembers.length === 0) {
      setSelectedUser(null);
    } else if (selectedUser) {
      // Update selected user if it's in teamMembers
      const updatedUser = teamMembers.find((user) => user.id === selectedUser.id);
      if (
        updatedUser &&
        (updatedUser.name !== selectedUser.name ||
          updatedUser.online !== selectedUser.online ||
          updatedUser.unread !== selectedUser.unread)
      ) {
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
      {/* Sidebar — contacts list */}
      <div className="md:col-span-1">
        <div className="h-full bg-card border border-border rounded-lg shadow-sm flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 className="font-headline text-base font-semibold text-foreground">Team Members</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              title="Refresh team members"
              className="text-muted-foreground hover:text-primary hover:bg-primary/5"
            >
              <RefreshCcw className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex-1 overflow-hidden p-3">
            <UserList
              users={teamMembers}
              selectedUser={selectedUser}
              onSelectUser={setSelectedUser}
              loading={loadingTeam}
            />
          </div>
        </div>
      </div>

      {/* Message area */}
      <div className="md:col-span-3">
        <div className="h-full bg-card border border-border rounded-lg shadow-sm flex flex-col overflow-hidden">
          <MessageArea
            selectedUser={selectedUser}
            messages={messages}
            onSendMessage={handleSendMessage}
            loading={loadingMessages}
            onMarkAsRead={markAsRead}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
