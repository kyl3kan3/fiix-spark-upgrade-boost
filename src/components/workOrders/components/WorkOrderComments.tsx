import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { MessageSquare, Send, Loader2 } from "lucide-react";
import { WorkOrderComment, WorkOrderWithRelations } from "@/types/workOrders";
import { formatDate } from "../utils/dateUtils";

interface WorkOrderCommentsProps {
  workOrder: WorkOrderWithRelations;
}

export const WorkOrderComments: React.FC<WorkOrderCommentsProps> = ({ workOrder }) => {
  const { toast } = useToast();
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
  );
};
