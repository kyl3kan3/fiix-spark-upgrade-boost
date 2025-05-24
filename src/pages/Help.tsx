
import React, { useState, useEffect } from "react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { HelpCircle } from "lucide-react";
import { HelpSearchBar } from "@/components/help/components/HelpSearchBar";
import { SearchResults } from "@/components/help/components/SearchResults";
import { HelpTabs } from "@/components/help/components/HelpTabs";
import { LiveChatSheet } from "@/components/help/components/LiveChatSheet";
import { useHelpSearch } from "@/components/help/hooks/useHelpSearch";

const Help = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("faq");
  
  const { searchResults, totalResults } = useHelpSearch(searchQuery);

  // Switch to the tab with most results when searching
  useEffect(() => {
    if (searchQuery && totalResults > 0) {
      const resultCounts = [
        { tab: "faq", count: searchResults.faq.length },
        { tab: "documentation", count: searchResults.documentation.length },
        { tab: "tutorials", count: searchResults.tutorials.length }
      ];
      
      const maxResultTab = resultCounts.reduce((max, current) => 
        current.count > max.count ? current : max
      , resultCounts[0]);
      
      if (maxResultTab.count > 0) {
        setActiveTab(maxResultTab.tab);
      }
    }
  }, [searchQuery, searchResults, totalResults]);

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  const handleOpenChat = () => {
    setChatOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="flex items-center mb-6">
        <HelpCircle className="h-6 w-6 text-maintenease-600 mr-2" />
        <h1 className="text-2xl font-bold text-gray-900">Help Center</h1>
      </div>

      <HelpSearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onClearSearch={handleClearSearch}
      />
      
      <SearchResults
        searchQuery={searchQuery}
        totalResults={totalResults}
      />

      <HelpTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchQuery={searchQuery}
        searchResults={searchResults}
        onOpenChat={handleOpenChat}
      />
      
      <LiveChatSheet
        open={chatOpen}
        onOpenChange={setChatOpen}
      />
    </DashboardLayout>
  );
};

export default Help;
