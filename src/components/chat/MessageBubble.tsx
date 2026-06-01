
import React from "react";
import { CheckCheck } from "lucide-react";
import { Message } from "@/types/chat";

interface MessageBubbleProps {
 message: Message;
 isOwnMessage: boolean;
 formattedTime: string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ 
 message, 
 isOwnMessage,
 formattedTime
}) => {
 return (
 <div 
 className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
 >
 <div 
 className={`max-w-[80%] rounded-lg px-4 py-2 ${ isOwnMessage ? 'bg-primary text-white' : 'bg-muted text-foreground' }`}
 >
 <p className="whitespace-pre-wrap break-words">{message.content}</p>
 <div 
 className={`text-xs mt-1 flex items-center justify-end gap-1 ${ isOwnMessage ? 'text-primary-foreground' : 'text-muted-foreground' }`}
 >
 {formattedTime}
 {isOwnMessage && (
 <CheckCheck 
 className={`h-3 w-3 ${message.read ? 'text-success' : 'text-primary-foreground'}`} 
 />
 )}
 </div>
 </div>
 </div>
 );
};

export default MessageBubble;
