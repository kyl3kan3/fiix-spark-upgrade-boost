import { Link } from "react-router-dom";
import { useUserProfile } from "@/hooks/useUserProfile";

/** Nudge users who have not set a role or job title on their profile. */
export function ProfileSetupHint() {
  const { profile } = useUserProfile();
  if (!profile) return null;

  const missingRole = !profile.role || profile.role === "viewer";
  const missingName = !profile.first_name?.trim();
  if (!missingRole && !missingName) return null;

  return (
    <div className="mx-4 md:mx-6 lg:mx-8 mb-4 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-foreground">
      Complete your profile: add your{" "}
      {missingRole && missingName ? "name and role" : missingRole ? "role" : "name"} in{" "}
      <Link to="/profile" className="font-semibold text-primary hover:underline">Profile settings</Link>{" "}
      so your team sees the right permissions and contact info.
    </div>
  );
}
