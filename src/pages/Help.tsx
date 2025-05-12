
import React, { useState, useEffect } from "react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HelpCircle, Mail, MessageSquare, FileText, BookOpen, CheckCircle, Search as SearchIcon } from "lucide-react";
import DocumentationSection from "@/components/help/DocumentationSection";
import TutorialsSection from "@/components/help/TutorialsSection";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";

const Help = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<Array<{text: string, isUser: boolean}>>([
    {text: "Hello! How can I help you today?", isUser: false}
  ]);
  const [activeTab, setActiveTab] = useState("faq");
  const { toast } = useToast();
  
  // Combined search results state
  const [searchResults, setSearchResults] = useState<{
    faq: any[],
    documentation: any[],
    tutorials: any[]
  }>({
    faq: [],
    documentation: [],
    tutorials: []
  });
  
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

  // Documentation data (simplified version of what's in DocumentationSection)
  const documentationItems = [
    {
      category: "Getting Started",
      articles: [
        {
          title: "System Overview",
          description: "Learn about the key components of MaintenEase",
          content: "MaintenEase is a comprehensive maintenance management system designed to streamline work order processing, asset management, and preventive maintenance scheduling."
        },
        {
          title: "Quick Start Guide",
          description: "Set up your account and start using MaintenEase",
          content: "This quick start guide will help you get up and running with MaintenEase in minutes."
        }
      ]
    },
    {
      category: "Work Orders",
      articles: [
        {
          title: "Creating Work Orders",
          description: "Step-by-step guide to creating work orders",
          content: "To create a work order, navigate to the Work Orders section and click the 'Create Work Order' button."
        },
        {
          title: "Managing Work Order Status",
          description: "Learn how to update and track work order status",
          content: "Work orders in MaintenEase progress through several status stages: New, Assigned, In Progress, On Hold, and Completed."
        }
      ]
    }
  ];

  // Tutorial data (simplified version of what's in TutorialsSection)
  const tutorialItems = [
    {
      title: "Getting Started with MaintenEase",
      description: "Learn the basics of navigating and using MaintenEase",
      difficulty: "Beginner",
      category: "Basics",
      content: "This tutorial covers the basics of MaintenEase."
    },
    {
      title: "Creating and Managing Work Orders",
      description: "Master the work order lifecycle from creation to completion",
      difficulty: "Beginner",
      category: "Work Orders",
      content: "This tutorial shows how to create and manage work orders."
    }
  ];

  // Form states
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    message: ""
  });
  
  const [featureForm, setFeatureForm] = useState({
    title: "",
    description: ""
  });

  // Search across all sections when query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults({ faq: [], documentation: [], tutorials: [] });
      return;
    }
    
    const query = searchQuery.toLowerCase();
    
    // Search FAQs
    const faqResults = faqItems.filter(item => 
      item.question.toLowerCase().includes(query) || 
      item.answer.toLowerCase().includes(query)
    );
    
    // Search documentation
    const docResults = documentationItems.flatMap(category => 
      category.articles.filter(article => 
        article.title.toLowerCase().includes(query) || 
        article.description.toLowerCase().includes(query) ||
        article.content.toLowerCase().includes(query)
      )
    );
    
    // Search tutorials
    const tutorialResults = tutorialItems.filter(tutorial => 
      tutorial.title.toLowerCase().includes(query) || 
      tutorial.description.toLowerCase().includes(query) ||
      tutorial.category.toLowerCase().includes(query)
    );
    
    setSearchResults({
      faq: faqResults,
      documentation: docResults,
      tutorials: tutorialResults
    });
    
    // Switch to the tab with most results
    const resultCounts = [
      { tab: "faq", count: faqResults.length },
      { tab: "documentation", count: docResults.length },
      { tab: "tutorials", count: tutorialResults.length }
    ];
    
    const maxResultTab = resultCounts.reduce((max, current) => 
      current.count > max.count ? current : max
    , resultCounts[0]);
    
    if (maxResultTab.count > 0) {
      setActiveTab(maxResultTab.tab);
    }
  }, [searchQuery]);

  // Handle chat message
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

  // Handle contact form submission
  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message sent",
      description: "We've received your message and will respond shortly.",
    });
    setContactForm({ name: "", email: "", message: "" });
  };

  // Handle feature request submission
  const handleFeatureSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Feature request submitted",
      description: "Thank you for your suggestion!",
    });
    setFeatureForm({ title: "", description: "" });
  };

  // Count total search results
  const totalSearchResults = 
    searchResults.faq.length + 
    searchResults.documentation.length + 
    searchResults.tutorials.length;

  return (
    <DashboardLayout>
      <div className="flex items-center mb-6">
        <HelpCircle className="h-6 w-6 text-maintenease-600 mr-2" />
        <h1 className="text-2xl font-bold text-gray-900">Help Center</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
          <Input 
            placeholder="Search help topics..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 max-w-full"
          />
        </div>
        <Button onClick={() => setSearchQuery("")} variant="outline" className="whitespace-nowrap">
          Clear Search
        </Button>
      </div>
      
      {searchQuery && (
        <div className="mb-4 p-2 bg-gray-50 rounded-md">
          <p className="text-sm text-gray-600">
            Found {totalSearchResults} {totalSearchResults === 1 ? 'result' : 'results'} for "{searchQuery}"
          </p>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="faq">
            Frequently Asked Questions
            {searchQuery && searchResults.faq.length > 0 && (
              <span className="ml-2 text-xs bg-maintenease-100 text-maintenease-700 px-2 py-0.5 rounded-full">
                {searchResults.faq.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="documentation">
            Documentation
            {searchQuery && searchResults.documentation.length > 0 && (
              <span className="ml-2 text-xs bg-maintenease-100 text-maintenease-700 px-2 py-0.5 rounded-full">
                {searchResults.documentation.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="tutorials">
            Tutorials
            {searchQuery && searchResults.tutorials.length > 0 && (
              <span className="ml-2 text-xs bg-maintenease-100 text-maintenease-700 px-2 py-0.5 rounded-full">
                {searchResults.tutorials.length}
              </span>
            )}
          </TabsTrigger>
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
              {searchQuery && searchResults.faq.length === 0 ? (
                <p className="text-gray-500">No results found for "{searchQuery}" in FAQs</p>
              ) : (
                <Accordion type="single" collapsible className="w-full">
                  {(searchQuery ? searchResults.faq : faqItems).map((item, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="text-left">{item.question}</AccordionTrigger>
                      <AccordionContent>
                        <div className="prose">
                          {item.answer}
                          <div className="mt-4 flex items-center gap-2">
                            <span className="text-sm text-gray-500">Was this helpful?</span>
                            <Button size="sm" variant="outline" className="h-8">Yes</Button>
                            <Button size="sm" variant="outline" className="h-8">No</Button>
                          </div>
                        </div>
                      </AccordionContent>
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
                <Button 
                  variant="outline" 
                  className="w-full justify-start" 
                  onClick={() => window.location.href = "mailto:support@maintenease.com"}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Email Support
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setChatOpen(true)}
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Live Chat
                </Button>
                <form onSubmit={handleContactSubmit} className="pt-4 space-y-4">
                  <h3 className="font-medium mb-2">Send us a message</h3>
                  <div>
                    <label className="text-sm font-medium block mb-1">Name</label>
                    <Input 
                      value={contactForm.name} 
                      onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                      placeholder="Your name" 
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1">Email</label>
                    <Input 
                      type="email" 
                      value={contactForm.email}
                      onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                      placeholder="your.email@example.com" 
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1">Message</label>
                    <textarea 
                      className="w-full min-h-[100px] p-2 border rounded-md"
                      value={contactForm.message}
                      onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                      placeholder="How can we help you?"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">Submit</Button>
                </form>
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
                <form onSubmit={handleFeatureSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium block mb-1">Feature Title</label>
                    <Input 
                      placeholder="Enter a short title for your feature request" 
                      value={featureForm.title}
                      onChange={(e) => setFeatureForm({...featureForm, title: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1">Description</label>
                    <textarea 
                      className="w-full min-h-[150px] p-2 border rounded-md" 
                      placeholder="Please describe the feature you'd like to see..."
                      value={featureForm.description}
                      onChange={(e) => setFeatureForm({...featureForm, description: e.target.value})}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">Submit Request</Button>
                </form>
                
                <div className="mt-6 border-t pt-4">
                  <h3 className="font-medium mb-3">Popular Feature Requests</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Mobile app for field technicians</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>QR code scanning for assets</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Custom dashboard widgets</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Live Chat Sheet */}
      <Sheet open={chatOpen} onOpenChange={setChatOpen}>
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
    </DashboardLayout>
  );
};

export default Help;
