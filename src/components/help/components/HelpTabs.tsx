
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FAQSection } from "./FAQSection";
import { ContactSection } from "./ContactSection";
import DocumentationSection from "../DocumentationSection";
import TutorialsSection from "../TutorialsSection";

interface HelpTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  searchQuery: string;
  searchResults: any;
  onOpenChat: () => void;
}

export const HelpTabs: React.FC<HelpTabsProps> = ({
  activeTab,
  onTabChange,
  searchQuery,
  searchResults,
  onOpenChat
}) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
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
        <FAQSection 
          searchQuery={searchQuery}
          searchResults={searchResults.faq}
        />
      </TabsContent>
      
      <TabsContent value="documentation">
        <DocumentationSection searchQuery={searchQuery} />
      </TabsContent>
      
      <TabsContent value="tutorials">
        <TutorialsSection searchQuery={searchQuery} />
      </TabsContent>
      
      <TabsContent value="contact">
        <ContactSection onOpenChat={onOpenChat} />
      </TabsContent>
    </Tabs>
  );
};
