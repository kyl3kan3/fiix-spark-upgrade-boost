
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Loader2 } from "lucide-react";

interface TeamSetupFormProps {
 onSubmit: (email: string) => Promise<boolean>;
 isSubmitting: boolean;
 error: string | null;
}

export const TeamSetupForm: React.FC<TeamSetupFormProps> = ({
 onSubmit,
 isSubmitting,
 error
}) => {
 const [inviteEmail, setInviteEmail] = useState("");

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 const success = await onSubmit(inviteEmail);
 if (success) {
 setInviteEmail("");
 }
 };

 return (
 <>
 {error && (
 <Alert variant="destructive" className="mb-4">
 <AlertCircle className="h-4 w-4" />
 <AlertDescription>{error}</AlertDescription>
 </Alert>
 )}

 <form onSubmit={handleSubmit} className="space-y-4">
 <div>
 <Label htmlFor="inviteEmail" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">
   Email Address
 </Label>
 <Input
 id="inviteEmail"
 type="email"
 value={inviteEmail}
 onChange={(e) => setInviteEmail(e.target.value)}
 placeholder="colleague@example.com"
 disabled={isSubmitting}
 className="bg-muted border-transparent focus:border-primary focus:ring-primary focus:bg-background transition-all"
 />
 </div>

 <Button
 type="submit"
 className="w-full bg-primary text-primary-foreground hover:bg-primary-variant uppercase tracking-wide font-semibold shadow-sm hover:-translate-y-0.5 transition-all"
 disabled={isSubmitting || !inviteEmail}
 >
 {isSubmitting ? (
 <>
 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
 Sending Invitation...
 </>
 ) : (
 "Send Invitation"
 )}
 </Button>
 </form>
 </>
 );
};
