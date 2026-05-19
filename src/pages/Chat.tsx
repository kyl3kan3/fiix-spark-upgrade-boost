import React from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import PageHeader from "@/components/shell/PageHeader";
import ChatInterface from "@/components/chat/ChatInterface";
import { Helmet } from "react-helmet";

const Chat = () => {
  return (
    <DashboardLayout>
      <Helmet>
        <title>Team Chat | MaintenEase</title>
        <meta name="description" content="Real-time team chat for maintenance crews. Coordinate work orders, share updates, and collaborate with technicians in one secure channel." />
        <link rel="canonical" href="https://maintenease.com/chat" />
      </Helmet>
      <PageHeader code="MSG · 001" title="Team Chat" description="Direct messages and channel conversations." />
      <div className="px-4 md:px-6 lg:px-8 py-6">
        <ChatInterface />
      </div>
    </DashboardLayout>
  );
};

export default Chat;
