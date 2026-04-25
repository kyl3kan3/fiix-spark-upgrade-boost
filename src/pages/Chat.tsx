import React from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import PageHeader from "@/components/shell/PageHeader";
import ChatInterface from "@/components/chat/ChatInterface";
import { Helmet } from "react-helmet";

const Chat = () => {
  return (
    <DashboardLayout>
      <Helmet><title>Team Chat | MaintenEase</title></Helmet>
      <PageHeader code="MSG · 001" title="Team Chat" description="Direct messages and channel conversations." />
      <div className="px-4 md:px-6 lg:px-8 py-6">
        <ChatInterface />
      </div>
    </DashboardLayout>
  );
};

export default Chat;
