
import React, { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface LiveChatSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const LiveChatSheet: React.FC<LiveChatSheetProps> = ({
  open,
  onOpenChange
}) => {
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<Array<{text: string, isUser: boolean}>>([
    {text: "Hello! How can I help you today?", isUser: false}
  ]);

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;
    
    // Add user message
    setChatMessages([...chatMessages, {text: chatMessage, isUser: true}]);
    
    // Simulate bot response after a short delay
    setTimeout(() => {
      let botResponse = "I'm looking into this for you. Our support team will follow up by email shortly.";
      
      // Simple keyword matching for demo purposes
      if (chatMessage.toLowerCase().includes("work order")) {
        botResponse = "To create a work order, go to the Work Orders section and click 'Create Work Order'. You can assign it to team members and set priority there.";
      } else if (chatMessage.toLowerCase().includes("report")) {
        botResponse = "You can generate reports from the Reports section. We offer various templates including work order statistics, asset performance, and maintenance trends.";
      } else if (chatMessage.toLowerCase().includes("asset")) {
        botResponse = "Asset management can be accessed from the main sidebar. There you can add new assets, view details, and track maintenance history.";
      }
      
      setChatMessages(prev => [...prev, {text: botResponse, isUser: false}]);
    }, 1000);
    
    setChatMessage("");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Live Chat Support</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col h-[calc(100vh-120px)]">
          <div className="flex-1 overflow-y-auto py-4">
            {chatMessages.map((msg, i) => (
              <div 
                key={i} 
                className={`mb-4 flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`rounded-lg px-4 py-2 max-w-[80%] ${
                    msg.isUser 
                      ? 'bg-maintenease-600 text-white' 
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
          <div className="border-t pt-4 flex gap-2">
            <Input 
              placeholder="Type your message..." 
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1"
            />
            <Button onClick={handleSendMessage}>Send</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
