
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Check, DragVertical, LayoutDashboard, Plus, Trash2 } from "lucide-react";
import { Draggable } from "@/components/ui/draggable";

interface WidgetOption {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  size?: "small" | "medium" | "large";
  order: number;
}

interface DashboardCustomizationSetupProps {
  data: any;
  onUpdate: (data: any) => void;
}

const defaultWidgets: WidgetOption[] = [
  {
    id: "work_orders_summary",
    name: "Work Orders Summary",
    description: "Overview of work orders by status",
    enabled: true,
    size: "medium",
    order: 1
  },
  {
    id: "recent_activity",
    name: "Recent Activity",
    description: "Latest actions and updates",
    enabled: true,
    size: "medium",
    order: 2
  },
  {
    id: "tasks_overview",
    name: "Tasks Overview",
    description: "Tasks assigned to you",
    enabled: true,
    size: "medium",
    order: 3
  },
  {
    id: "upcoming_maintenance",
    name: "Upcoming Maintenance",
    description: "Scheduled preventive maintenance",
    enabled: true,
    size: "medium",
    order: 4
  },
  {
    id: "asset_status",
    name: "Asset Status",
    description: "Status overview of your assets",
    enabled: false,
    size: "small",
    order: 5
  },
  {
    id: "team_workload",
    name: "Team Workload",
    description: "Distribution of work across team",
    enabled: false,
    size: "medium",
    order: 6
  },
  {
    id: "performance_metrics",
    name: "Performance Metrics",
    description: "Key performance indicators",
    enabled: false,
    size: "large",
    order: 7
  }
];

const DashboardCustomizationSetup: React.FC<DashboardCustomizationSetupProps> = ({ data, onUpdate }) => {
  const [widgets, setWidgets] = useState<WidgetOption[]>(
    data?.widgets || defaultWidgets
  );
  
  const [showQuickActions, setShowQuickActions] = useState<boolean>(
    data?.showQuickActions !== undefined ? data.showQuickActions : true
  );
  
  const [dashboardTitle, setDashboardTitle] = useState<string>(
    data?.dashboardTitle || "MaintenEase Dashboard"
  );

  const enabledWidgets = widgets.filter(w => w.enabled).sort((a, b) => a.order - b.order);
  const disabledWidgets = widgets.filter(w => !w.enabled);

  const handleToggleWidget = (id: string, enabled: boolean) => {
    const updated = widgets.map(widget => {
      if (widget.id === id) {
        return { ...widget, enabled };
      }
      return widget;
    });
    
    setWidgets(updated);
    onUpdate({
      widgets: updated,
      showQuickActions,
      dashboardTitle
    });
  };

  const handleMoveWidget = (id: string, direction: 'up' | 'down') => {
    const currentIndex = enabledWidgets.findIndex(w => w.id === id);
    
    if (
      (direction === 'up' && currentIndex === 0) || 
      (direction === 'down' && currentIndex === enabledWidgets.length - 1)
    ) {
      return;
    }
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const updatedOrder = [...enabledWidgets];
    
    // Swap positions
    [updatedOrder[currentIndex], updatedOrder[newIndex]] = 
      [updatedOrder[newIndex], updatedOrder[currentIndex]];
    
    // Update orders
    const withNewOrders = updatedOrder.map((widget, index) => ({
      ...widget,
      order: index + 1
    }));
    
    // Merge with disabled widgets
    const updated = [
      ...withNewOrders,
      ...disabledWidgets
    ];
    
    setWidgets(updated);
    onUpdate({
      widgets: updated,
      showQuickActions,
      dashboardTitle
    });
  };

  const handleWidgetSizeChange = (id: string, size: "small" | "medium" | "large") => {
    const updated = widgets.map(widget => {
      if (widget.id === id) {
        return { ...widget, size };
      }
      return widget;
    });
    
    setWidgets(updated);
    onUpdate({
      widgets: updated,
      showQuickActions,
      dashboardTitle
    });
  };

  const handleQuickActionsToggle = (enabled: boolean) => {
    setShowQuickActions(enabled);
    onUpdate({
      widgets,
      showQuickActions: enabled,
      dashboardTitle
    });
  };

  const handleTitleChange = (title: string) => {
    setDashboardTitle(title);
    onUpdate({
      widgets,
      showQuickActions,
      dashboardTitle: title
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <LayoutDashboard className="h-6 w-6 text-maintenease-600" />
        <h2 className="text-xl font-semibold">Dashboard Customization</h2>
      </div>
      
      <p className="text-muted-foreground">
        Customize your dashboard layout and appearance.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardContent className="pt-6">
              <div className="mb-6">
                <Label htmlFor="dashboard-title">Dashboard Title</Label>
                <Input
                  id="dashboard-title"
                  value={dashboardTitle}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Quick Action Buttons</h3>
                  <p className="text-sm text-muted-foreground">
                    Show quick action buttons at the top of dashboard
                  </p>
                </div>
                <Switch 
                  checked={showQuickActions} 
                  onCheckedChange={handleQuickActionsToggle}
                />
              </div>
              
              <div className="space-y-4">
                <h3 className="font-medium">Dashboard Widgets</h3>
                <p className="text-sm text-muted-foreground">
                  Drag to reorder widgets or toggle them on/off
                </p>
                
                <div className="space-y-3">
                  {enabledWidgets.map((widget) => (
                    <div 
                      key={widget.id}
                      className="flex items-center justify-between bg-white border rounded-md p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-gray-400 cursor-move">
                          <DragVertical className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-medium">{widget.name}</div>
                          <p className="text-xs text-muted-foreground">{widget.description}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <select
                          value={widget.size}
                          onChange={(e) => handleWidgetSizeChange(widget.id, e.target.value as any)}
                          className="text-sm border rounded p-1"
                        >
                          <option value="small">Small</option>
                          <option value="medium">Medium</option>
                          <option value="large">Large</option>
                        </select>
                        
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleMoveWidget(widget.id, 'up')}
                            disabled={widget === enabledWidgets[0]}
                          >
                            <span className="sr-only">Move up</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-up"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleMoveWidget(widget.id, 'down')}
                            disabled={widget === enabledWidgets[enabledWidgets.length - 1]}
                          >
                            <span className="sr-only">Move down</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-down"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleWidget(widget.id, false)}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Remove</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {enabledWidgets.length === 0 && (
                    <div className="text-center py-8 border border-dashed rounded-md">
                      <p className="text-muted-foreground">No widgets enabled</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Enable widgets from the list below
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              {disabledWidgets.length > 0 && (
                <div className="mt-8 pt-6 border-t">
                  <h3 className="font-medium mb-3">Available Widgets</h3>
                  <div className="space-y-2">
                    {disabledWidgets.map((widget) => (
                      <div
                        key={widget.id}
                        className="flex items-center justify-between bg-gray-50 border rounded-md p-3"
                      >
                        <div>
                          <div className="font-medium">{widget.name}</div>
                          <p className="text-xs text-muted-foreground">{widget.description}</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleWidget(widget.id, true)}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div>
          <div className="sticky top-6">
            <h3 className="font-medium mb-4">Preview</h3>
            <div className="border rounded-md p-4 bg-white shadow-sm">
              <div className="border-b pb-2 mb-4">
                <h2 className="font-bold text-lg">{dashboardTitle}</h2>
              </div>
              
              {showQuickActions && (
                <div className="flex flex-wrap gap-2 mb-4">
                  <div className="h-8 w-28 rounded-md bg-maintenease-600"></div>
                  <div className="h-8 w-28 rounded-md bg-gray-100"></div>
                  <div className="h-8 w-28 rounded-md bg-gray-100"></div>
                </div>
              )}
              
              <div className="space-y-4">
                {enabledWidgets.length > 0 ? (
                  enabledWidgets.map((widget) => (
                    <div key={widget.id} className={`
                      border rounded bg-gray-50 p-3
                      ${widget.size === "small" ? "h-20" : widget.size === "medium" ? "h-32" : "h-56"}
                    `}>
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 bg-maintenease-600 rounded-full"></div>
                        <div className="font-medium text-sm">{widget.name}</div>
                      </div>
                      <div className={`
                        mt-2 flex items-center justify-center
                        ${widget.size === "small" ? "h-12" : widget.size === "medium" ? "h-24" : "h-44"}
                      `}>
                        <div className="bg-white w-11/12 h-full rounded border border-dashed"></div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>No widgets to display</p>
                  </div>
                )}
              </div>
              
              {enabledWidgets.length > 0 && (
                <div className="mt-3 text-center">
                  <Check className="h-5 w-5 mx-auto text-green-500" />
                  <p className="text-xs text-muted-foreground mt-1">
                    Your dashboard layout is saved
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCustomizationSetup;
