import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import KeywordTrackerWidget from "../KeywordTrackerWidget";
import MultiKeywordTracker from "./MultiKeywordTracker";
import DomainAnalysisWidget from "./DomainAnalysisWidget";
import BacklinksWidget from "./BacklinksWidget";
import PositionTrackingWidget from "./PositionTrackingWidget";

const SemrushInsightsPanel = () => (
  <div className="space-y-2">
    <div>
      <h3 className="text-lg font-semibold">Semrush insights</h3>
      <p className="text-sm text-muted-foreground">
        SEO intelligence powered by the connected Semrush account. Super-admin only.
      </p>
    </div>
    <Tabs defaultValue="keywords">
      <TabsList className="flex-wrap">
        <TabsTrigger value="keywords">Keyword by market</TabsTrigger>
        <TabsTrigger value="multi">Multi-keyword</TabsTrigger>
        <TabsTrigger value="domain">Domain & competitors</TabsTrigger>
        <TabsTrigger value="backlinks">Backlinks</TabsTrigger>
        <TabsTrigger value="tracking">Position Tracking</TabsTrigger>
      </TabsList>
      <TabsContent value="keywords" className="mt-4"><KeywordTrackerWidget /></TabsContent>
      <TabsContent value="multi" className="mt-4"><MultiKeywordTracker /></TabsContent>
      <TabsContent value="domain" className="mt-4"><DomainAnalysisWidget /></TabsContent>
      <TabsContent value="backlinks" className="mt-4"><BacklinksWidget /></TabsContent>
      <TabsContent value="tracking" className="mt-4"><PositionTrackingWidget /></TabsContent>
    </Tabs>
  </div>
);

export default SemrushInsightsPanel;