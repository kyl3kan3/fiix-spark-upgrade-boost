
export function validateInvitationEmail(inviteEmail: string): string | null {
  if (!inviteEmail || !inviteEmail.includes('@')) {
    return "Please enter a valid email address";
  }
  return null;
}
