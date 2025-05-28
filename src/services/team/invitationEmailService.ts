
import { sendEmailNotification } from "@/services/notifications/notificationSenders";

export async function sendInvitationEmail(
  inviteEmail: string, 
  companyName: string, 
  token: string, 
  userId: string, 
  invitationId: string
) {
  console.log("7. Sending invitation email...");
  
  const inviteUrl = `${window.location.origin}/auth?signup=true&token=${token}`;
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

  console.log("7. Calling sendEmailNotification with:", {
    to: inviteEmail,
    subject: emailSubject,
    userId,
    invitationId
  });

  await sendEmailNotification(inviteEmail, emailSubject, emailBody, userId, invitationId);
  console.log("7. SUCCESS: Email sent successfully to:", inviteEmail);
}
