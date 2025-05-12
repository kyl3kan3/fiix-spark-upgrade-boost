
import React from "react";
import { format } from "date-fns";
import { CheckCheck } from "lucide-react";
import { Message } from "@/types/chat";

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwnMessage }) => {
  const messageTime = new Date(message.created_at);
  const formattedTime = format(messageTime, "HH:mm");
  
  return (
    <div 
      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
    >
      <div 
        className={`max-w-[80%] rounded-lg px-4 py-2 ${
          isOwnMessage 
            ? 'bg-maintenease-600 text-white' 
            : 'bg-gray-100 text-gray-800'
        }`}
      >
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
        <div 
          className={`text-xs mt-1 flex items-center justify-end gap-1 ${
            isOwnMessage ? 'text-maintenease-100' : 'text-gray-500'
          }`}
        >
          {formattedTime}
          {isOwnMessage && (
            <CheckCheck 
              className={`h-3 w-3 ${message.read ? 'text-green-400' : 'text-maintenease-100'}`} 
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
