
import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { MessageSquare, Send, Loader2 } from "lucide-react";
import { WorkOrderComment, WorkOrderWithRelations } from "@/types/workOrders";
import { formatDate } from "../utils/dateUtils";
import {
 Pagination,
 PaginationContent,
 PaginationItem,
 PaginationLink,
 PaginationNext,
 PaginationPrevious,
} from "@/components/ui/pagination";

interface WorkOrderCommentsProps {
 workOrder: WorkOrderWithRelations;
}

// Define constants for pagination
const COMMENTS_PER_PAGE = 5;

export const WorkOrderComments: React.FC<WorkOrderCommentsProps> = ({ workOrder }) => {
 const { toast } = useToast();
 const [newComment, setNewComment] = useState("");
 const [isSubmittingComment, setIsSubmittingComment] = useState(false);
 const [currentPage, setCurrentPage] = useState(1);

 // Fetch comments with pagination
 const { data: commentsData, refetch: refetchComments } = useQuery({
 queryKey: ["workOrderComments", workOrder.id, currentPage],
 queryFn: async () => {
 // Get total count first
 const countResponse = await supabase
 .from("work_order_comments")
 .select("id", { count: "exact", head: true })
 .eq("work_order_id", workOrder.id);
 
 const totalCount = countResponse.count || 0;
 
 // Then get paginated data
 const { data, error } = await supabase
 .from("work_order_comments")
 .select(`
 *,
 user:profiles(*)
 `)
 .eq("work_order_id", workOrder.id)
 .order("created_at", { ascending: false })
 .range((currentPage - 1) * COMMENTS_PER_PAGE, currentPage * COMMENTS_PER_PAGE - 1);

 if (error) throw error;
 
 return {
 comments: data as (WorkOrderComment & { user: any })[],
 totalCount,
 totalPages: Math.ceil(totalCount / COMMENTS_PER_PAGE)
 };
 },
 });

 // Add comments to workOrder object for PDF export
 useEffect(() => {
 if (commentsData?.comments && workOrder) {
 workOrder.comments = commentsData.comments;
 }
 }, [commentsData, workOrder]);

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
 setCurrentPage(1); // Return to first page after adding a new comment
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

 // Function to handle page change
 const handlePageChange = (page: number) => {
 if (page < 1 || page > (commentsData?.totalPages || 1)) return;
 setCurrentPage(page);
 };

 return (
 <div className="bg-surface-container-lowest rounded-xl border border-border/60 shadow-sm p-6">
 <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-6 flex items-center gap-2">
 <MessageSquare className="h-4 w-4" />
 Comments {commentsData?.totalCount ? `(${commentsData.totalCount})` : ""}
 </h3>

 {/* Add new comment */}
 <div className="mb-6">
 <div className="flex flex-col space-y-3">
 <Textarea
 placeholder="Write your comment here…"
 className="min-h-[90px] bg-muted/30 border-border/60 resize-none focus-visible:ring-primary/30"
 value={newComment}
 onChange={(e) => setNewComment(e.target.value)}
 />
 <div className="flex justify-end">
 <Button
 onClick={handleSubmitComment}
 disabled={isSubmittingComment || !newComment.trim()}
 size="sm"
 className="gap-1.5"
 >
 {isSubmittingComment ? (
 <>
 <Loader2 className="h-3.5 w-3.5 animate-spin" />
 Posting…
 </>
 ) : (
 <>
 <Send className="h-3.5 w-3.5" />
 Post Comment
 </>
 )}
 </Button>
 </div>
 </div>
 </div>

 <Separator className="my-5 border-border/60" />

 {/* Existing comments */}
 <div className="space-y-3 mb-4">
 {commentsData?.comments && commentsData.comments.length > 0 ? (
 commentsData.comments.map((comment) => (
 <div key={comment.id} className="rounded-lg bg-muted/30 border border-border/40 p-4">
 <div className="flex justify-between items-start mb-2">
 <div className="flex items-center gap-2">
 <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
 {(comment.user?.first_name?.[0] || "?")}
 </div>
 <span className="text-sm font-semibold text-foreground">
 {comment.user?.first_name} {comment.user?.last_name}
 </span>
 </div>
 <span className="text-xs text-muted-foreground">{formatDate(comment.created_at)}</span>
 </div>
 <p className="text-sm text-muted-foreground whitespace-pre-wrap ml-9">{comment.comment}</p>
 </div>
 ))
 ) : (
 <div className="text-center py-8 text-muted-foreground">
 <MessageSquare className="h-8 w-8 mx-auto opacity-20 mb-2" />
 <p className="text-sm">No comments yet. Be the first.</p>
 </div>
 )}
 </div>
 
 {/* Pagination */}
 {commentsData?.totalPages && commentsData.totalPages > 1 && (
 <Pagination>
 <PaginationContent>
 <PaginationItem>
 <PaginationPrevious 
 onClick={() => handlePageChange(currentPage - 1)} 
 className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
 />
 </PaginationItem>
 
 {/* Generate page numbers */}
 {Array.from({ length: commentsData.totalPages }, (_, i) => i + 1).map(page => (
 <PaginationItem key={page}>
 <PaginationLink 
 isActive={page === currentPage} 
 onClick={() => handlePageChange(page)}
 className="cursor-pointer"
 >
 {page}
 </PaginationLink>
 </PaginationItem>
 ))}
 
 <PaginationItem>
 <PaginationNext 
 onClick={() => handlePageChange(currentPage + 1)}
 className={currentPage === commentsData.totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
 />
 </PaginationItem>
 </PaginationContent>
 </Pagination>
 )}
 </div>
 );
};
