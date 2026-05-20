
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Clock, Activity } from "lucide-react";

const DashboardAnalytics: React.FC = () => {
 return (
 <Card className="bg-card dark:bg-card border-border dark:border-border shadow-sm animate-entry">
 <CardHeader>
 <CardTitle className="flex items-center gap-2">
 <Activity className="h-5 w-5 text-maintenease-500" />
 Key Metrics
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="space-y-4">
 <div className="grid grid-cols-2 gap-4">
 <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
 <div className="font-semibold text-sm text-blue-700 dark:text-blue-300">Avg. Response</div>
 <div className="text-2xl font-bold mt-1 flex items-baseline">
 24<span className="text-sm ml-1 font-normal text-muted-foreground dark:text-muted-foreground">min</span>
 </div>
 </div>
 
 <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
 <div className="font-semibold text-sm text-green-700 dark:text-green-300">Completion Rate</div>
 <div className="text-2xl font-bold mt-1 flex items-baseline">
 92<span className="text-sm ml-1 font-normal text-muted-foreground dark:text-muted-foreground">%</span>
 </div>
 </div>
 </div>
 
 <div className="mt-4 pt-4 border-t border-border dark:border-border">
 <h4 className="text-sm font-semibold mb-2">Monthly Progress</h4>
 <div className="w-full bg-secondary dark:bg-card rounded-full h-2.5 mb-2">
 <div className="bg-maintenease-500 h-2.5 rounded-full" style={{ width: '68%' }}></div>
 </div>
 <div className="flex justify-between text-xs text-muted-foreground dark:text-muted-foreground">
 <span>68% Complete</span>
 <span>32% Remaining</span>
 </div>
 </div>
 </div>
 </CardContent>
 </Card>
 );
};

export default DashboardAnalytics;
