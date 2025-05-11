import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { 
  Pencil, 
  Trash2, 
  AlertTriangle, 
  Clock, 
  User, 
  MessageSquare,
  Send,
  Calendar,
  Package
} from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { WorkOrderComment, WorkOrderWithRelations } from "@/types/workOrders";

// Define props interface for the component
interface WorkOrderDetailProps {
  workOrder: WorkOrderWithRelations;
}

const statusColorMap: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  in_progress: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-gray-100 text-gray-800",
};

const priorityColorMap: Record<string, string> = {
  low: "bg-blue-100 text-blue-800",
  medium: "bg-gray-100 text-gray-800",
  high: "bg-orange-100 text-orange-800",
  urgent: "bg-red-100 text-red-800",
};

// Update component to receive and use the workOrder prop
const WorkOrderDetail: React.FC<WorkOrderDetailProps> = ({ workOrder }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Fetch comments for this work order
  const { data: comments, refetch: refetchComments } = useQuery({
    queryKey: ["workOrderComments", workOrder.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("work_order_comments")
        .select(`
          *,
          user:profiles(*)
        `)
        .eq("work_order_id", workOrder.id)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as (WorkOrderComment & { user: any })[];
    },
  });

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric"
    }).format(date);
  };

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from("work_orders")
        .delete()
        .eq("id", workOrder.id);

      if (error) throw error;

      toast({
        title: "Work Order Deleted",
        description: "The work order has been successfully deleted."
      });
      
      navigate("/work-orders");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete the work order",
        variant: "destructive"
      });
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    try {
      setIsSubmittingComment(true);
      const user = (await supabase.auth.getUser()).data.user;
      
      if (!user) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to add comments",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from("work_order_comments")
        .insert({
          work_order_id: workOrder.id,
          user_id: user.id,
          comment: newComment.trim()
        });

      if (error) throw error;

      toast({
        title: "Comment Added",
        description: "Your comment has been added successfully."
      });
      
      setNewComment("");
      refetchComments();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add comment",
        variant: "destructive"
      });
    } finally {
      setIsSubmittingComment(false);
    }
  };

  return (
    <>
      <div className="flex flex-col space-y-6">
        {/* Header with title and actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{workOrder.title}</h1>
            <div className="flex items-center gap-2 mt-2 text-gray-500">
              <span>Work Order #{workOrder.id.split('-')[0]}</span>
              <span>•</span>
              <span>Created {formatDate(workOrder.created_at)}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" asChild>
              <Link to="/work-orders">
                Back
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to={`/work-orders/${workOrder.id}/edit`}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
        
        {/* Status badges */}
        <div className="flex flex-wrap gap-2">
          <Badge className={statusColorMap[workOrder.status] || "bg-gray-100"}>
            Status: {workOrder.status?.replace("_", " ")}
          </Badge>
          <Badge className={priorityColorMap[workOrder.priority] || "bg-gray-100"}>
            Priority: {workOrder.priority}
          </Badge>
        </div>
        
        {/* Work Order Details */}
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Description</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{workOrder.description}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div>
                <div className="flex items-center mb-2">
                  <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                  <h3 className="font-medium">Due Date</h3>
                </div>
                <p className="text-gray-700">
                  {workOrder.due_date ? formatDate(workOrder.due_date) : "No due date set"}
                </p>
              </div>
              
              <div>
                <div className="flex items-center mb-2">
                  <Package className="h-4 w-4 mr-2 text-gray-500" />
                  <h3 className="font-medium">Related Asset</h3>
                </div>
                {workOrder.asset ? (
                  <div>
                    <p className="font-medium">{workOrder.asset.name}</p>
                    {workOrder.asset.location && (
                      <p className="text-gray-500 text-sm">Location: {workOrder.asset.location}</p>
                    )}
                    {workOrder.asset.serial_number && (
                      <p className="text-gray-500 text-sm">S/N: {workOrder.asset.serial_number}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500">No asset associated</p>
                )}
              </div>
              
              <div>
                <div className="flex items-center mb-2">
                  <User className="h-4 w-4 mr-2 text-gray-500" />
                  <h3 className="font-medium">Assigned To</h3>
                </div>
                {workOrder.assignee ? (
                  <p className="text-gray-700">
                    {workOrder.assignee.first_name} {workOrder.assignee.last_name}
                  </p>
                ) : (
                  <p className="text-gray-500">Unassigned</p>
                )}
              </div>
              
              <div>
                <div className="flex items-center mb-2">
                  <User className="h-4 w-4 mr-2 text-gray-500" />
                  <h3 className="font-medium">Created By</h3>
                </div>
                {workOrder.creator ? (
                  <p className="text-gray-700">
                    {workOrder.creator.first_name} {workOrder.creator.last_name}
                  </p>
                ) : (
                  <p className="text-gray-500">Unknown</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Comments Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="h-5 w-5 mr-2" />
              Comments
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Existing comments */}
            <div className="space-y-4 mb-6">
              {comments && comments.length > 0 ? (
                comments.map((comment) => (
                  <div key={comment.id} className="rounded-lg bg-gray-50 p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-medium">
                        {comment.user?.first_name} {comment.user?.last_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(comment.created_at)}
                      </div>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap">{comment.comment}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <MessageSquare className="h-8 w-8 mx-auto opacity-30 mb-2" />
                  <p>No comments yet</p>
                </div>
              )}
            </div>
            
            {/* Add new comment */}
            <div>
              <Separator className="my-4" />
              <h3 className="font-medium mb-2">Add Comment</h3>
              <div className="flex flex-col space-y-2">
                <Textarea 
                  placeholder="Write your comment here..." 
                  className="min-h-[100px]"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <div className="flex justify-end">
                  <Button 
                    onClick={handleSubmitComment} 
                    disabled={isSubmittingComment || !newComment.trim()}
                  >
                    {isSubmittingComment ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Add Comment
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Work Order</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this work order? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WorkOrderDetail;
