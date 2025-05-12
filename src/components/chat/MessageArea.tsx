
import React, { useEffect, useRef, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2, Paperclip, MessageCircle } from "lucide-react";
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
  onMarkAsRead
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
    if (selectedUser && messages.some(m => !m.read && m.sender_id === selectedUser.id)) {
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
    
    messages.forEach(message => {
      const messageDate = new Date(message.created_at);
      const dateKey = messageDate.toDateString();
      
      const existingGroup = groups.find(group => group.date === dateKey);
      if (existingGroup) {
        existingGroup.messages.push(message);
      } else {
        groups.push({
          date: dateKey,
          messages: [message]
        });
      }
    });
    
    return groups;
  }, [messages]);
  
  return (
    <div className="flex flex-col h-full">
      {selectedUser ? (
        <>
          <div className="border-b p-4">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-maintenease-100 text-maintenease-600 flex items-center justify-center font-bold text-sm mr-2">
                {selectedUser.avatar || selectedUser.name.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="font-medium">{selectedUser.name}</h3>
                <p className="text-sm text-gray-500">{selectedUser.role}</p>
              </div>
            </div>
          </div>
          
          <ScrollArea className="flex-1 p-4">
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-maintenease-600" />
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                <p className="mb-2">No messages yet with {selectedUser.name}.</p>
                <p>Start the conversation!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {groupedMessages.map((group, groupIndex) => (
                  <div key={groupIndex} className="space-y-4">
                    <div className="flex justify-center">
                      <div className="bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded-full">
                        {format(new Date(group.date), "EEEE, MMMM d, yyyy")}
                      </div>
                    </div>
                    
                    <div className="space-y-4">
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
          
          <div className="border-t p-4 flex items-end gap-2">
            <Textarea
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              className="resize-none min-h-[80px] focus-visible:ring-maintenease-500"
              maxLength={5000}
            />
            <div className="flex flex-col gap-2">
              <Button 
                className="flex-shrink-0" 
                onClick={handleSend}
                disabled={!newMessage.trim() || sending || !selectedUser}
              >
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
          <div className="mb-4">
            <MessageCircle className="h-12 w-12 text-gray-300" />
          </div>
          <h3 className="text-lg font-medium mb-2">No conversation selected</h3>
          <p className="text-center">Select a team member from the list to start chatting</p>
        </div>
      )}
    </div>
  );
};

export default MessageArea;
