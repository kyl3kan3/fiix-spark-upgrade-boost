
import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import AddTeamMemberDialog from "@/components/team/AddTeamMemberDialog";
import TeamMembersGrid from "@/components/team/TeamMembersGrid";
import TeamMembersList from "@/components/team/TeamMembersList";
import type { TeamMember } from "@/components/team/types";
import PendingInvitationsSection from "@/components/team/PendingInvitationsSection";
import RolePermissionsOverview from "@/components/team/RolePermissionsOverview";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import { usePendingInvitations } from "@/hooks/team/usePendingInvitations";
import { logger } from "@/lib/logger";
import MaterialIcon from "@/components/ui/material-icon";

const ROLE_FILTERS = ["All Roles", "Administrators", "Managers", "Technicians", "Contractors"];

const Team = () => {
  const [filters, setFilters] = useState({ search: "", role: "all", status: "all" });
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [viewMode] = useState<"grid" | "list">("grid");
  const [activeRoleFilter, setActiveRoleFilter] = useState("All Roles");

  const { teamMembers, loading } = useTeamMembers();
  const { pendingInvitations, loading: invitesLoading, refreshPendingInvitations } = usePendingInvitations();

  const filteredMembers = teamMembers.filter((member) => {
    const matchesSearch =
      !filters.search ||
      `${member.firstName} ${member.lastName}`
        .toLowerCase()
        .includes(filters.search.toLowerCase()) ||
      member.email?.toLowerCase().includes(filters.search.toLowerCase());
    const matchesRole = filters.role === "all" || member.role === filters.role;
    return matchesSearch && matchesRole;
  });

  const transformedMembers: TeamMember[] = filteredMembers.map((member) => ({
    ...member,
    first_name: member.firstName ?? "",
    last_name: member.lastName ?? "",
    joined: new Date().toISOString(),
    lastActive: new Date().toISOString(),
    status: "active" as const,
    phone: member.phone || "",
    companyName: member.companyName || "",
  }));

  const roleColorMap = {
    admin: "bg-destructive/10 text-destructive",
    manager: "bg-primary/10 text-primary",
    technician: "bg-success/10 text-success",
    viewer: "bg-muted text-muted-foreground",
  };

  const handleMemberUpdated = (
    userId: string,
    updates: {
      firstName?: string;
      lastName?: string;
      role?: string;
      email?: string;
      phone?: string;
      companyName?: string;
    }
  ) => {
    logger.log("Member updated:", userId, updates);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Helmet>
        <title>Team Directory | MaintenEase</title>
        <meta
          name="description"
          content="Manage team members, roles, and access for your MaintenEase workspace."
        />
        <link rel="canonical" href="https://maintenease.com/team" />
      </Helmet>

      {/* Page Header & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-background">Team Directory</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">Manage roles, access, and communication.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button className="flex-1 md:flex-none bg-surface-container-low text-primary font-label-md text-label-md py-3 px-6 rounded-DEFAULT hover:bg-surface-variant transition-colors border border-transparent">
            Export CSV
          </button>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <button className="flex-1 md:flex-none bg-primary text-on-primary font-label-md text-label-md py-3 px-6 rounded-DEFAULT uppercase hover:bg-primary/90 transition-colors shadow-sm">
                + Add Member
              </button>
            </DialogTrigger>
            <AddTeamMemberDialog />
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <div className="flex overflow-x-auto pb-4 mb-6 gap-2 hide-scrollbar">
        {ROLE_FILTERS.map((label) => (
          <button
            key={label}
            onClick={() => setActiveRoleFilter(label)}
            className={
              activeRoleFilter === label
                ? "px-4 py-2 rounded-full bg-primary text-on-primary font-label-sm text-label-sm whitespace-nowrap"
                : "px-4 py-2 rounded-full bg-surface-container-low text-on-surface-variant hover:bg-surface-variant font-label-sm text-label-sm whitespace-nowrap transition-colors"
            }
          >
            {label}
          </button>
        ))}
      </div>

      {/* Team Grid — live data or mockup sample cards */}
      {transformedMembers.length > 0 ? (
        viewMode === "grid" ? (
          <TeamMembersGrid
            members={transformedMembers}
            roleColorMap={roleColorMap}
            onMemberUpdated={handleMemberUpdated}
          />
        ) : (
          <TeamMembersList
            members={transformedMembers}
            roleColorMap={roleColorMap}
            loading={loading}
            onMemberUpdated={handleMemberUpdated}
          />
        )
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="bg-surface-container-lowest rounded-lg border border-transparent hover:border-primary/10 shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col group">
            <div className="p-card_padding flex-1 flex flex-col items-center text-center">
              <div className="relative mb-4">
                <img
                  alt="Sarah Jenkins, Facility Manager"
                  className="w-20 h-20 rounded-full object-cover border-2 border-surface-variant"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAPZJKwxY1TF6IQyqnKs-SWlbmSOewN-d0fqfYFxFjCM0ZFL7rJ3EYoHlkP9jZS84VypYJlwU29uJ0H7l6FoNb12Ew6MDneK_SfskxumFcp7nJHP_NHxcC1lOWbT_0N8I1qW9rP5PFk7T0WjyjMdsLi4106Exa-ivlCD1CIXI6ZG7HIWanSep2D-KfoylDk6CHnG1sNxKLJUrQa5IxyG8cb8fM7H_REoon4xHPyzi7zEEwBAj8V75JcTFWQt46UyXZtUDH3EYs12zk"
                />
                <span className="absolute bottom-0 right-0 w-4 h-4 bg-success border-2 border-surface-container-lowest rounded-full"></span>
              </div>
              <h3 className="font-headline-md text-headline-md text-on-background text-[20px]">Sarah Jenkins</h3>
              <p className="font-body-md text-label-md text-primary mt-1">Facility Manager</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <span className="bg-surface-container px-2 py-1 rounded text-label-sm font-label-sm text-on-surface-variant">HVAC</span>
                <span className="bg-surface-container px-2 py-1 rounded text-label-sm font-label-sm text-on-surface-variant">Electrical</span>
              </div>
            </div>
            <div className="border-t border-outline-variant/20 p-4 flex justify-between items-center bg-surface-blue/50 rounded-b-lg">
              <button className="text-primary font-label-md text-label-sm hover:underline flex items-center gap-1">
                <MaterialIcon name="edit" className="text-[18px]" /> Edit Role
              </button>
              <button className="text-primary hover:bg-primary/10 p-2 rounded-full transition-colors" title="Send Message">
                <MaterialIcon name="mail" />
              </button>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-surface-container-lowest rounded-lg border border-transparent hover:border-primary/10 shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col group">
            <div className="p-card_padding flex-1 flex flex-col items-center text-center">
              <div className="relative mb-4">
                <img
                  alt="David Chen, Senior Technician"
                  className="w-20 h-20 rounded-full object-cover border-2 border-surface-variant"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAndZxgCsts1Cja0Pvz4mPM_kuQhoht6XwJRztI-fnw78v1RSUAw2zwgjiIExe7puzgoLUYmLTLwWGLBiQeedrOYwFEU3n8PNrw7dwPAc7Tss1z6gn1NlsXEoo_TPhRavE-nJbZ2TuNOOHaRLfciEYe8WTrbCZyorK8y82yyGzbTgYlpwowJzuwQ8VGZar3sFoYoc4IX1AXVrMPfyC9yMxP4ePOsEXDjUx6lH-n8TnJr15cKg9zuHeEFWeyOYIWq3gO254Qk_m37y4"
                />
                <span className="absolute bottom-0 right-0 w-4 h-4 bg-outline border-2 border-surface-container-lowest rounded-full" title="Offline"></span>
              </div>
              <h3 className="font-headline-md text-headline-md text-on-background text-[20px]">David Chen</h3>
              <p className="font-body-md text-label-md text-primary mt-1">Senior Technician</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <span className="bg-surface-container px-2 py-1 rounded text-label-sm font-label-sm text-on-surface-variant">Plumbing</span>
              </div>
            </div>
            <div className="border-t border-outline-variant/20 p-4 flex justify-between items-center bg-surface-blue/50 rounded-b-lg">
              <button className="text-primary font-label-md text-label-sm hover:underline flex items-center gap-1">
                <MaterialIcon name="edit" className="text-[18px]" /> Edit Role
              </button>
              <button className="text-primary hover:bg-primary/10 p-2 rounded-full transition-colors" title="Send Message">
                <MaterialIcon name="mail" />
              </button>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-surface-container-lowest rounded-lg border border-transparent hover:border-primary/10 shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col group">
            <div className="p-card_padding flex-1 flex flex-col items-center text-center">
              <div className="relative mb-4">
                <div className="w-20 h-20 rounded-full bg-primary text-on-primary flex items-center justify-center font-headline-md text-[24px] border-2 border-surface-variant">
                  MR
                </div>
                <span className="absolute bottom-0 right-0 w-4 h-4 bg-success border-2 border-surface-container-lowest rounded-full"></span>
              </div>
              <h3 className="font-headline-md text-headline-md text-on-background text-[20px]">Marcus Reed</h3>
              <p className="font-body-md text-label-md text-primary mt-1">Administrator</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <span className="bg-surface-container px-2 py-1 rounded text-label-sm font-label-sm text-on-surface-variant">System</span>
                <span className="bg-surface-container px-2 py-1 rounded text-label-sm font-label-sm text-on-surface-variant">Security</span>
              </div>
            </div>
            <div className="border-t border-outline-variant/20 p-4 flex justify-between items-center bg-surface-blue/50 rounded-b-lg">
              <button className="text-primary font-label-md text-label-sm hover:underline flex items-center gap-1">
                <MaterialIcon name="edit" className="text-[18px]" /> Edit Role
              </button>
              <button className="text-primary hover:bg-primary/10 p-2 rounded-full transition-colors" title="Send Message">
                <MaterialIcon name="mail" />
              </button>
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-surface-container-lowest rounded-lg border border-transparent hover:border-primary/10 shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col group">
            <div className="p-card_padding flex-1 flex flex-col items-center text-center">
              <div className="relative mb-4">
                <img
                  alt="Elena Rodriguez, Technician"
                  className="w-20 h-20 rounded-full object-cover border-2 border-surface-variant"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAfVS6XLEkY4xGip23pMxtoXFJD0Rc8hSdCWYb71l_9fu3QJtqlxSguo9OBWJ4n5AmFB_4LOStATwFlxqlpMOznfl-hMjqqlD9QNq_7m4xCbCDOgwKJLnJS4nrBWl4CJe0zbHqNhLzu2gMPzpezhdWWrXR1-spTKKuVim8_Mh5G-KvgS0c7yXs9tchPz7_BLTgxM5iWE6fQFuB7PDNXgyplFJv_g6IMnuWHhxtmmB1genh6dR83HDivM4PjCR30ES8m1L9YBVtYxIQ"
                />
                <span className="absolute bottom-0 right-0 w-4 h-4 bg-warning border-2 border-surface-container-lowest rounded-full" title="Away"></span>
              </div>
              <h3 className="font-headline-md text-headline-md text-on-background text-[20px]">Elena Rodriguez</h3>
              <p className="font-body-md text-label-md text-primary mt-1">Technician</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <span className="bg-surface-container px-2 py-1 rounded text-label-sm font-label-sm text-on-surface-variant">HVAC</span>
                <span className="bg-error-container text-on-error-container px-2 py-1 rounded text-label-sm font-label-sm font-bold">On Call</span>
              </div>
            </div>
            <div className="border-t border-outline-variant/20 p-4 flex justify-between items-center bg-surface-blue/50 rounded-b-lg">
              <button className="text-primary font-label-md text-label-sm hover:underline flex items-center gap-1">
                <MaterialIcon name="edit" className="text-[18px]" /> Edit Role
              </button>
              <button className="text-primary hover:bg-primary/10 p-2 rounded-full transition-colors" title="Send Message">
                <MaterialIcon name="mail" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invitations & Roles sections */}
      <div className="mt-10 space-y-8">
        <PendingInvitationsSection
          invitations={pendingInvitations}
          roleColorMap={roleColorMap}
          loading={invitesLoading}
          onInvitationDeleted={refreshPendingInvitations}
        />
        <RolePermissionsOverview />
      </div>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </DashboardLayout>
  );
};

export default Team;
