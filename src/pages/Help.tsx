
import React, { useState } from "react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HelpCircle, Mail, MessageSquare, FileText, BookOpen } from "lucide-react";
import DocumentationSection from "@/components/help/DocumentationSection";
import TutorialsSection from "@/components/help/TutorialsSection";

const Help = () => {
  const [searchQuery, setSearchQuery] = useState("");
  
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
    },
    {
      question: "Can I export reports to PDF?",
      answer: "Yes, after generating a report, look for the 'Export' or 'Download PDF' button near the report visualization. Click it to download the report as a PDF file."
    },
    {
      question: "How can I view asset details?",
      answer: "Navigate to the Assets section, then click on any asset in the list to view its detailed information, including specifications, maintenance history, and assigned work orders."
    }
  ];

  const filteredFAQs = searchQuery 
    ? faqItems.filter(item => 
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : faqItems;

  return (
    <DashboardLayout>
      <div className="flex items-center mb-6">
        <HelpCircle className="h-6 w-6 text-maintenease-600 mr-2" />
        <h1 className="text-2xl font-bold text-gray-900">Help Center</h1>
      </div>

      <div className="flex space-x-2 mb-6">
        <Input 
          placeholder="Search help topics..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
        <Button>Search</Button>
      </div>

      <Tabs defaultValue="faq" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="faq">Frequently Asked Questions</TabsTrigger>
          <TabsTrigger value="documentation">Documentation</TabsTrigger>
          <TabsTrigger value="tutorials">Tutorials</TabsTrigger>
          <TabsTrigger value="contact">Contact Support</TabsTrigger>
        </TabsList>
        
        <TabsContent value="faq">
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>
                Find answers to common questions about using MaintenEase
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredFAQs.length === 0 ? (
                <p className="text-gray-500">No results found for "{searchQuery}"</p>
              ) : (
                <Accordion type="single" collapsible className="w-full">
                  {filteredFAQs.map((item, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="text-left">{item.question}</AccordionTrigger>
                      <AccordionContent>{item.answer}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="documentation">
          <DocumentationSection searchQuery={searchQuery} />
        </TabsContent>
        
        <TabsContent value="tutorials">
          <TutorialsSection searchQuery={searchQuery} />
        </TabsContent>
        
        <TabsContent value="contact">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Support</CardTitle>
                <CardDescription>
                  Reach out to our team for personalized help
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
                <div className="pt-4">
                  <h3 className="font-medium mb-2">Support Hours</h3>
                  <p className="text-sm text-gray-500">Monday - Friday: 9am - 5pm EST</p>
                  <p className="text-sm text-gray-500">Weekend: Limited support</p>
                </div>
                <div className="pt-2">
                  <h3 className="font-medium mb-2">Emergency Contact</h3>
                  <p className="text-sm text-gray-500">For urgent maintenance issues:</p>
                  <p className="text-sm font-medium">1-800-MAINTAIN</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Request Feature</CardTitle>
                <CardDescription>
                  Suggest new features or improvements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div>
                    <label className="text-sm font-medium block mb-1">Feature Title</label>
                    <Input placeholder="Enter a short title for your feature request" />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1">Description</label>
                    <textarea 
                      className="w-full min-h-[100px] p-2 border rounded-md" 
                      placeholder="Please describe the feature you'd like to see..."
                    />
                  </div>
                  <Button className="w-full">Submit Request</Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default Help;
