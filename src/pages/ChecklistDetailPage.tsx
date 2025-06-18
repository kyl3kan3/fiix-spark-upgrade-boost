
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Play, Calendar, ListChecks } from "lucide-react";
import { checklistService } from "@/services/checklistService";
import { ChecklistTypes } from "@/types/checklists";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { format } from "date-fns";

const ChecklistDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: checklist, isLoading, error } = useQuery({
    queryKey: ["checklist", id],
    queryFn: () => checklistService.getChecklistById(id!),
    enabled: !!id,
  });

  const getTypeColor = (type: string) => {
    switch(type) {
      case 'safety': return 'bg-red-100 text-red-800';
      case 'equipment': return 'bg-blue-100 text-blue-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'quality': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="text-center py-12">Loading checklist...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !checklist) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <Button 
            variant="outline" 
            onClick={() => navigate("/checklists")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Checklists
          </Button>
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">Checklist not found</h2>
            <p className="text-gray-500">The checklist you're looking for doesn't exist.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <Button 
          variant="outline" 
          onClick={() => navigate("/checklists")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Checklists
        </Button>

        <div className="space-y-6">
          {/* Header */}
          <Card className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold">{checklist.name}</h1>
                  <Badge className={getTypeColor(checklist.type)}>
                    {ChecklistTypes.find(t => t.value === checklist.type)?.label || checklist.type}
                  </Badge>
                </div>
                
                {checklist.description && (
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {checklist.description}
                  </p>
                )}

                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <ListChecks className="h-4 w-4" />
                    <span>{checklist.items?.length || 0} items</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Created {format(new Date(checklist.created_at), "MMM d, yyyy")}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={() => navigate(`/checklists/${checklist.id}/submit`)}
                  className="flex items-center gap-2"
                >
                  <Play className="h-4 w-4" />
                  Fill Out
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => navigate(`/checklists/${checklist.id}/edit`)}
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
              </div>
            </div>
          </Card>

          {/* Checklist Items */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Checklist Items</h2>
            
            {!checklist.items || checklist.items.length === 0 ? (
              <div className="text-center py-8">
                <ListChecks className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No items yet
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  This checklist doesn't have any items yet.
                </p>
                <Button 
                  onClick={() => navigate(`/checklists/${checklist.id}/edit`)}
                  variant="outline"
                >
                  Add Items
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {checklist.items
                  .sort((a, b) => a.sort_order - b.sort_order)
                  .map((item, index) => (
                    <div 
                      key={item.id} 
                      className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-sm font-medium text-blue-600 dark:text-blue-300">
                        {index + 1}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">{item.title}</h3>
                          {item.is_required && (
                            <Badge variant="outline" className="text-xs">
                              Required
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs capitalize">
                            {item.item_type}
                          </Badge>
                        </div>
                        
                        {item.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ChecklistDetailPage;
