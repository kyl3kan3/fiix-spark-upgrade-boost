import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ShareReportDialogProps {
 open: boolean;
 onOpenChange: (v: boolean) => void;
 reportName: string;
 reportId?: string;
}

type Teammate = { id: string; first_name: string | null; last_name: string | null; email: string };

const ShareReportDialog: React.FC<ShareReportDialogProps> = ({ open, onOpenChange, reportName, reportId }) => {
 const [teammates, setTeammates] = useState<Teammate[]>([]);
 const [selected, setSelected] = useState<Set<string>>(new Set());
 const [summary, setSummary] = useState("");
 const [loading, setLoading] = useState(false);
 const [sending, setSending] = useState(false);

 useEffect(() => {
 if (!open) return;
 setLoading(true);
 (async () => {
 const { data: me } = await supabase.auth.getUser();
 if (!me.user) return;
 const { data } = await (supabase as any).rpc("get_company_directory");
 const teammates = (data || []).filter((p: any) => p.id !== me.user!.id);
 setTeammates(teammates);
 setLoading(false);
 })();
 }, [open]);

 const toggle = (id: string) => {
 setSelected((prev) => {
 const next = new Set(prev);
 next.has(id) ? next.delete(id) : next.add(id);
 return next;
 });
 };

 const handleSend = async () => {
 if (selected.size === 0) {
 toast.error("Select at least one recipient");
 return;
 }
 setSending(true);
 try {
 const { data: me } = await supabase.auth.getUser();
 const { data: meProfile } = await supabase
 .from("profiles")
 .select("first_name, last_name")
 .eq("id", me.user!.id)
 .maybeSingle();
 const senderName =
 [meProfile?.first_name, meProfile?.last_name].filter(Boolean).join(" ") || "A teammate";

 const { error } = await supabase.functions.invoke("notify-event", {
 body: {
 event_type: "report_shared",
 payload: {
 report_name: reportName,
 report_id: reportId,
 recipients: Array.from(selected),
 sender_name: senderName,
 summary,
 actor_id: me.user!.id,
 },
 },
 });
 if (error) throw error;
 toast.success(`Report sent to ${selected.size} recipient${selected.size > 1 ? "s" : ""}`);
 onOpenChange(false);
 setSelected(new Set());
 setSummary("");
 } catch (e: any) {
 toast.error(e.message || "Failed to send report");
 } finally {
 setSending(false);
 }
 };

 return (
 <Dialog open={open} onOpenChange={onOpenChange}>
 <DialogContent className="max-w-lg">
 <DialogHeader>
 <DialogTitle>Share "{reportName}"</DialogTitle>
 </DialogHeader>
 <div className="space-y-4">
 <div>
 <Label>Recipients</Label>
 <div className="border rounded-md mt-2 max-h-64 overflow-y-auto divide-y">
 {loading ? (
 <div className="p-4 flex items-center justify-center">
 <Loader2 className="h-4 w-4 animate-spin" />
 </div>
 ) : teammates.length === 0 ? (
 <p className="p-4 text-sm text-muted-foreground">No teammates found</p>
 ) : (
 teammates.map((t) => {
 const name = [t.first_name, t.last_name].filter(Boolean).join(" ") || t.email;
 return (
 <label
 key={t.id}
 className="flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer"
 >
 <Checkbox
 checked={selected.has(t.id)}
 onCheckedChange={() => toggle(t.id)}
 />
 <div className="flex-1">
 <div className="text-sm font-medium">{name}</div>
 <div className="text-xs text-muted-foreground">{t.email}</div>
 </div>
 </label>
 );
 })
 )}
 </div>
 </div>
 <div>
 <Label htmlFor="summary">Message (optional)</Label>
 <Textarea
 id="summary"
 value={summary}
 onChange={(e) => setSummary(e.target.value)}
 placeholder="Add context for recipients..."
 rows={3}
 />
 </div>
 </div>
 <DialogFooter>
 <Button variant="outline" onClick={() => onOpenChange(false)} disabled={sending}>
 Cancel
 </Button>
 <Button onClick={handleSend} disabled={sending || selected.size === 0}>
 {sending ? (
 <Loader2 className="h-4 w-4 mr-2 animate-spin" />
 ) : (
 <Mail className="h-4 w-4 mr-2" />
 )}
 Send
 </Button>
 </DialogFooter>
 </DialogContent>
 </Dialog>
 );
};

export default ShareReportDialog;