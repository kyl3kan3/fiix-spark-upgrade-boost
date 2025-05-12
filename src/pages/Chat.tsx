
import React from "react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import ChatInterface from "../components/chat/ChatInterface";

const Chat = () => {
  return (
    <DashboardLayout>
      <div className="flex items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Team Chat</h1>
      </div>
      <ChatInterface />
    </DashboardLayout>
  );
};

export default Chat;
