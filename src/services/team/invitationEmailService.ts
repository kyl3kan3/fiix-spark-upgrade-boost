
import { supabase } from "@/integrations/supabase/client";

export async function sendInvitationEmail(
 inviteEmail: string, 
 companyName: string, 
 token: string, 
 userId: string, 
 invitationId: string
) {
 console.log("Sending invitation email...");

  // Always send invitations pointing at the production domain so recipients
  // never land on a preview/lovable.app/lovable.dev URL. If the app is being
  // exercised from a preview environment we still want the email link to go
  // to maintenease.com.
  const PRODUCTION_ORIGIN = "https://maintenease.com";
  const currentOrigin =
    typeof window !== "undefined" && window.location?.origin
      ? window.location.origin
      : "";
  const isProductionHost = /maintenease\.com$/i.test(
    (() => {
      try { return new URL(currentOrigin).hostname; } catch { return ""; }
    })()
  );
  const origin = isProductionHost ? currentOrigin : PRODUCTION_ORIGIN;
  const inviteUrl = `${origin}/auth?signup=true&token=${token}`;
 const emailSubject = `You're invited to join ${companyName} on MaintenEase`;
 const emailBody = `
 <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
 <h2>You're invited to join ${companyName}!</h2>
 <p>Hello,</p>
 <p>You've been invited to join <strong>${companyName}</strong> on MaintenEase, a maintenance management platform.</p>
 <p>Click the link below to accept your invitation and create your account:</p>
 <p style="margin: 20px 0;">
 <a href="${inviteUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
 Accept Invitation
 </a>
 </p>
 <p>Or copy and paste this link into your browser:</p>
 <p style="word-break: break-all; color: #666;">${inviteUrl}</p>
 <p>This invitation will expire in 7 days.</p>
 <p>Best regards,<br>The MaintenEase Team</p>
 </div>
 `;

 console.log("📧 Invoking send-email edge function for invitation...");

 try {
 const { data, error } = await supabase.functions.invoke("send-email", {
 body: {
 to: inviteEmail,
 subject: emailSubject,
 body: emailBody,
 userId,
 notificationType: "invitation",
 referenceId: invitationId,
 },
 });
 if (error) throw new Error(error.message || "Edge function error");
 if (!data || !data.success) {
 throw new Error(data?.error || "Email sending failed");
 }
 console.log("Invitation email sent successfully");
 } catch (error) {
 console.error("❌ Invitation email sending failed:", error);
 throw error;
 }
}
