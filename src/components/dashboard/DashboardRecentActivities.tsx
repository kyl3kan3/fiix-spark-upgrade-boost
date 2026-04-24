
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

const DashboardRecentActivities = () => {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    // This will be replaced with real data fetching from Supabase
  }, []);

  return (
    <Card className="surface-card animate-entry h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold tracking-tight">Recent Activities</CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length > 0 ? (
          <div className="relative pl-6 border-l border-border space-y-6 py-2">
            {activities.map((activity) => (
              <div key={activity.id} className="relative pb-1">
                <span className="absolute -left-[34px] h-6 w-6 flex items-center justify-center rounded-full bg-primary/10 text-primary ring-2 ring-background">
                  {activity.icon}
                </span>
                <div>
                  <h4 className="text-sm font-medium text-foreground">{activity.title}</h4>
                  <p className="text-sm text-muted-foreground">{activity.description}</p>
                  <span className="text-xs text-muted-foreground/70">{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <span className="text-muted-foreground text-xl">·</span>
            </div>
            <p className="text-sm text-muted-foreground">No recent activities</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DashboardRecentActivities;
