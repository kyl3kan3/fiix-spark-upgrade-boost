
import React, { useEffect, useRef, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2, MessageCircle } from "lucide-react";
import MessageBubble from "./MessageBubble";
import { ChatUser, Message } from "@/types/chat";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface MessageAreaProps {
  selectedUser: ChatUser | null;
  messages: Message[];
  onSendMessage: (content: string) => void;
  loading: boolean;
  onMarkAsRead: () => void;
}

const MessageArea: React.FC<MessageAreaProps> = ({
  selectedUser,
  messages,
  onSendMessage,
  loading,
  onMarkAsRead,
}) => {
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mark messages as read when the user views them
  useEffect(() => {
    if (selectedUser && messages.some((m) => !m.read && m.sender_id === selectedUser.id)) {
      onMarkAsRead();
    }
  }, [selectedUser, messages, onMarkAsRead]);

  const handleSend = async () => {
    if (newMessage.trim() && !sending && selectedUser) {
      setSending(true);
      await onSendMessage(newMessage);
      setNewMessage("");
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null);

  // Get current user id
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setCurrentUser({ id: data.user.id });
      }
    };

    getCurrentUser();
  }, []);

  const formatMessageDate = (dateString: string) => {
    const today = new Date();
    const messageDate = new Date(dateString);

    // If message is from today, show only time
    if (messageDate.toDateString() === today.toDateString()) {
      return format(messageDate, "HH:mm");
    }

    // If message is from this year, show date without year
    if (messageDate.getFullYear() === today.getFullYear()) {
      return format(messageDate, "d MMM, HH:mm");
    }

    // Otherwise show full date
    return format(messageDate, "d MMM yyyy, HH:mm");
  };

  // Group messages by date
  const groupedMessages = React.useMemo(() => {
    const groups: { date: string; messages: Message[] }[] = [];

    messages.forEach((message) => {
      const messageDate = new Date(message.created_at);
      const dateKey = messageDate.toDateString();

      const existingGroup = groups.find((group) => group.date === dateKey);
      if (existingGroup) {
        existingGroup.messages.push(message);
      } else {
        groups.push({ date: dateKey, messages: [message] });
      }
    });

    return groups;
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      {selectedUser ? (
        <>
          {/* Conversation header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
            <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs border border-primary/20 shrink-0">
              {selectedUser.avatar || selectedUser.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground leading-tight">{selectedUser.name}</p>
              <p className="text-xs text-muted-foreground">{selectedUser.role}</p>
            </div>
          </div>

          {/* Message list */}
          <ScrollArea className="flex-1 px-4 py-4 bg-background">
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-center text-muted-foreground">
                <MessageCircle className="h-10 w-10 mb-3 text-muted-foreground/40" />
                <p className="text-sm font-medium">No messages yet with {selectedUser.name}</p>
                <p className="text-xs mt-1">Start the conversation below</p>
              </div>
            ) : (
              <div className="space-y-6">
                {groupedMessages.map((group, groupIndex) => (
                  <div key={groupIndex} className="space-y-3">
                    {/* Date divider */}
                    <div className="flex items-center justify-center">
                      <div className="bg-muted text-muted-foreground text-[11px] font-medium px-3 py-1 rounded-full border border-border">
                        {format(new Date(group.date), "EEEE, MMMM d, yyyy")}
                      </div>
                    </div>

                    <div className="space-y-3">
                      {group.messages.map((message) => (
                        <MessageBubble
                          key={message.id}
                          message={message}
                          isOwnMessage={currentUser?.id === message.sender_id}
                          formattedTime={formatMessageDate(message.created_at)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </ScrollArea>

          {/* Input area */}
          <div className="border-t border-border p-4 bg-card flex items-end gap-3">
            <Textarea
              placeholder="Type your message… (Enter to send, Shift+Enter for new line)"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              className="resize-none min-h-[72px] bg-background border-border focus-visible:ring-primary/30 text-sm"
              maxLength={5000}
            />
            <Button
              onClick={handleSend}
              disabled={!newMessage.trim() || sending || !selectedUser}
              className="bg-primary hover:bg-primary-variant text-primary-foreground shrink-0"
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-4 p-8 bg-background">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <MessageCircle className="h-8 w-8 text-primary/40" />
          </div>
          <div className="text-center">
            <h3 className="text-base font-semibold text-foreground mb-1">No conversation selected</h3>
            <p className="text-sm text-muted-foreground">
              Select a team member from the list to start chatting
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageArea;
