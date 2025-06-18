
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search, Calendar, User, FileText } from "lucide-react";
import { checklistService } from "@/services/checklistService";
import { ChecklistTypes } from "@/types/checklists";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { format } from "date-fns";

const ChecklistSubmissionsPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: submissions = [], isLoading } = useQuery({
    queryKey: ["checklist-submissions"],
    queryFn: checklistService.getSubmissions,
  });

  const filteredSubmissions = submissions.filter(submission => {
    const matchesSearch = 
      submission.checklist?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
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

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="text-center py-12">Loading submissions...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate("/checklists")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Checklists
          </Button>
          
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Checklist Submissions
              </h1>
              <p className="text-gray-500 dark:text-gray-400">
                View completed checklist submissions and their details
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search submissions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Submissions List */}
        {filteredSubmissions.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              {submissions.length === 0 ? "No submissions yet" : "No submissions match your search"}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {submissions.length === 0 
                ? "Submit some checklists to see them here"
                : "Try adjusting your search criteria"
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSubmissions.map((submission) => (
              <Card key={submission.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">
                        {submission.checklist?.name}
                      </h3>
                      {submission.checklist?.type && (
                        <Badge className={getTypeColor(submission.checklist.type)}>
                          {ChecklistTypes.find(t => t.value === submission.checklist?.type)?.label || submission.checklist.type}
                        </Badge>
                      )}
                      <Badge className={getStatusColor(submission.status)}>
                        {submission.status}
                      </Badge>
                    </div>
                    
                    {submission.notes && (
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                        {submission.notes}
                      </p>
                    )}

                    <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{format(new Date(submission.submitted_at), "MMM d, yyyy 'at' h:mm a")}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span>{submission.items?.length || 0} items completed</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submission Items Summary */}
                {submission.items && submission.items.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="font-medium mb-3">Responses:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {submission.items.slice(0, 6).map((item) => (
                        <div key={item.id} className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                          <div className="font-medium text-sm mb-1">
                            {item.checklist_item?.title}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            {item.checklist_item?.item_type === 'checkbox' 
                              ? (item.is_checked ? '✓ Completed' : '✗ Not completed')
                              : item.response_value || 'No response'
                            }
                          </div>
                          {item.notes && (
                            <div className="text-xs text-gray-500 mt-1 italic">
                              "{item.notes}"
                            </div>
                          )}
                        </div>
                      ))}
                      {submission.items.length > 6 && (
                        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded flex items-center justify-center text-sm text-gray-500">
                          +{submission.items.length - 6} more items
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ChecklistSubmissionsPage;
