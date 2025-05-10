
import React from "react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HelpCircle, Mail, MessageSquare } from "lucide-react";

const Help = () => {
  const faqItems = [
    {
      question: "How do I create a new work order?",
      answer: "You can create a new work order by clicking on the 'Create Work Order' button on the dashboard or using the Quick Actions section. Fill in all the required details and submit the form."
    },
    {
      question: "How do I assign a work order to a team member?",
      answer: "When viewing a work order, click on the 'Assign' button and select the team member you wish to assign the task to from the dropdown menu."
    },
    {
      question: "How do I track maintenance history for an asset?",
      answer: "Navigate to the Asset Management section, select the asset you're interested in, and click on the 'History' tab to view all past maintenance activities."
    },
    {
      question: "How do I schedule recurring maintenance?",
      answer: "In the Schedule Maintenance section, create a new maintenance task and toggle the 'Recurring' option. You can then set the frequency and duration for the recurring task."
    },
    {
      question: "How do I generate reports?",
      answer: "Go to the Reports section from the sidebar or Quick Actions. Select the type of report you need, set any filters or parameters, and click 'Generate Report'."
    }
  ];

  return (
    <DashboardLayout>
      <div className="flex items-center mb-6">
        <HelpCircle className="h-6 w-6 text-maintenease-600 mr-2" />
        <h1 className="text-2xl font-bold text-gray-900">Help Center</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>
                Find answers to common questions about using MaintenEase
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqItems.map((item, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">{item.question}</AccordionTrigger>
                    <AccordionContent>{item.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Need More Help?</CardTitle>
              <CardDescription>
                Contact our support team
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full justify-start" onClick={() => window.location.href = "mailto:support@maintenease.com"}>
                <Mail className="mr-2 h-4 w-4" />
                Email Support
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <MessageSquare className="mr-2 h-4 w-4" />
                Live Chat
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Search Help Topics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2">
                <Input placeholder="Enter keywords..." />
                <Button>Search</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Help;
