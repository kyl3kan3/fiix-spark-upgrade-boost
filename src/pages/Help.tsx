
import React, { useState, useEffect } from "react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { HelpCircle } from "lucide-react";
import { HelpSearchBar } from "@/components/help/components/HelpSearchBar";
import { SearchResults } from "@/components/help/components/SearchResults";
import { HelpTabs } from "@/components/help/components/HelpTabs";
import { LiveChatSheet } from "@/components/help/components/LiveChatSheet";
import { useHelpSearch } from "@/components/help/hooks/useHelpSearch";
import { Button } from "@/components/ui/button";
import { Compass, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useOnboardingProgress } from "@/hooks/onboarding/useOnboardingProgress";
import { toast } from "sonner";

const Help = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("faq");
  const navigate = useNavigate();
  const { restartTour, restartWizard, showChecklist } = useOnboardingProgress();
  
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

      <div className="mb-6 flex flex-wrap gap-2">
        <Button
          variant="outline"
          onClick={() => {
            restartTour();
            showChecklist();
            toast.info("Heading to your dashboard to start the tour…");
            navigate("/dashboard");
          }}
        >
          <Compass className="h-4 w-4 mr-2" />
          Take the product tour
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            restartWizard();
            navigate("/setup");
          }}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Re-run setup wizard
        </Button>
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
