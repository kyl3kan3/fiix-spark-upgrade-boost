
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { ChatUser } from "@/types/chat";

export const useTeamUpdates = (setTeamMembers: React.Dispatch<React.SetStateAction<ChatUser[]>>) => {
  const updateTeamMember = useCallback(async (userId: string, updates: {
    firstName?: string;
    lastName?: string;
    role?: string;
    email?: string;
    phone?: string;
    companyName?: string;
  }) => {
    try {
      console.log("Updating team member:", userId, updates);
      
      const updateData: Record<string, any> = {};
      if (updates.firstName !== undefined) updateData.first_name = updates.firstName;
      if (updates.lastName !== undefined) updateData.last_name = updates.lastName;
      if (updates.role !== undefined) updateData.role = updates.role;
      if (updates.email !== undefined) updateData.email = updates.email;
      if (updates.phone !== undefined) updateData.phone_number = updates.phone; // Map phone to phone_number field
      
      console.log("Sending update to Supabase:", updateData);
      
      const { data, error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", userId)
        .select();
        
      if (error) {
        console.error("Error updating team member:", error);
        throw error;
      }
      
      console.log("Update successful, received data:", data);
      
      // Update local state with the new information immediately
      setTeamMembers(prev => 
        prev.map(member => {
          if (member.id === userId) {
            console.log(`Found member to update: ${member.name}`);
            const updatedMember = { 
              ...member, 
              ...(updates.firstName !== undefined && { firstName: updates.firstName }),
              ...(updates.lastName !== undefined && { lastName: updates.lastName }),
              ...(updates.role !== undefined && { role: updates.role }),
              ...(updates.email !== undefined && { email: updates.email }),
              ...(updates.phone !== undefined && { phone: updates.phone }),
              ...(updates.firstName !== undefined || updates.lastName !== undefined ? { 
                name: `${updates.firstName || member.firstName} ${updates.lastName || member.lastName}`.trim() || member.email,
                avatar: (updates.firstName || member.firstName) && (updates.lastName || member.lastName) ? 
                  `${(updates.firstName || member.firstName)[0]}${(updates.lastName || member.lastName)[0]}`.toUpperCase() : 
                  (updates.firstName || member.firstName || updates.email || member.email).substring(0, 2).toUpperCase()
              } : {})
            };
            console.log("Updated member object:", updatedMember);
            return updatedMember;
          }
          return member;
        })
      );
      
      // If company name is being updated, we need to update the company record,
      // but since we're moving to a proper company structure, we no longer
      // update the company name directly in the profile.
      
      return { success: true, data: data?.[0] };
    } catch (error) {
      console.error("Error updating team member:", error);
      toast("Failed to update team member");
      return { success: false, error };
    }
  }, [setTeamMembers]);

  return { updateTeamMember };
};
