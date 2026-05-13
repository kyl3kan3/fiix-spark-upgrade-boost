import React from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import PageHeader from "@/components/shell/PageHeader";
import ChatInterface from "@/components/chat/ChatInterface";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
const Chat = () => {
  useDocumentTitle("Team Chat | MaintenEase");

  return (
    <DashboardLayout>
      
      <PageHeader code="MSG · 001" title="Team Chat" description="Direct messages and channel conversations." />
      <div className="px-4 md:px-6 lg:px-8 py-6">
        <ChatInterface />
      </div>
    </DashboardLayout>
  );
};

export default Chat;
