
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MoreHorizontal } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const DashboardTasksOverview = () => {
  const [tasksByCategory, setTasksByCategory] = useState([
    { category: "Preventive Maintenance", total: 0, completed: 0, color: "bg-info" },
    { category: "Repairs", total: 0, completed: 0, color: "bg-warning" },
    { category: "Inspections", total: 0, completed: 0, color: "bg-success" },
    { category: "Safety Checks", total: 0, completed: 0, color: "bg-destructive" },
  ]);

  const [overallProgress, setOverallProgress] = useState({
    completed: 0,
    total: 0,
    percentage: 0
  });

  useEffect(() => {
    // This will be replaced with real data fetching from Supabase
  }, []);

  return (
    <Card className="surface-card animate-entry h-full">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold tracking-tight">Tasks Overview</CardTitle>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-5">
          {tasksByCategory.map((category, index) => {
            const percentage = category.total > 0 ? (category.completed / category.total) * 100 : 0;
            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">{category.category}</span>
                  <span className="text-muted-foreground tabular-nums">
                    {category.completed}/{category.total}
                  </span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full ${category.color} rounded-full transition-all`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 pt-5 border-t border-border">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-foreground">Overall Progress</span>
            <span className="text-muted-foreground tabular-nums">
              {overallProgress.completed}/{overallProgress.total} ({overallProgress.percentage}%)
            </span>
          </div>
          <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-primary rounded-full transition-all"
              style={{ width: `${overallProgress.percentage}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardTasksOverview;
