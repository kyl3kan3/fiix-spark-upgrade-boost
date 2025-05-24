
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

const DashboardRecentActivities = () => {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    // This will be replaced with real data fetching from Supabase
  }, []);

  return (
    <Card className="card-gradient dark:card-gradient-dark glass-morphism dark:glass-morphism-dark shadow-lg rounded-2xl animate-entry">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg dark:text-gray-200">Recent Activities</CardTitle>
      </CardHeader>
      <CardContent className="pl-2">
        {activities.length > 0 ? (
          <div className="relative pl-6 border-l border-gray-200 dark:border-gray-700 space-y-6 py-2">
            {activities.map((activity) => (
              <div key={activity.id} className="relative pb-1">
                <span className="absolute -left-9 p-1 bg-white rounded-full">
                  {activity.icon}
                </span>
                <div>
                  <h4 className="text-sm font-medium">{activity.title}</h4>
                  <p className="text-sm text-gray-500">{activity.description}</p>
                  <span className="text-xs text-gray-400">{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-6 text-gray-500 dark:text-gray-400">
            No recent activities
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DashboardRecentActivities;
