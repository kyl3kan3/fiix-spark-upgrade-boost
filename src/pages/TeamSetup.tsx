
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useTeamSetupAuth } from "@/hooks/team/useTeamSetupAuth";
import { useTeamInvitation } from "@/hooks/team/useTeamInvitation";
import { TeamSetupNotAuthorized } from "@/components/team/setup/TeamSetupNotAuthorized";
import { TeamSetupLoading } from "@/components/team/setup/TeamSetupLoading";
import MaterialIcon from "@/components/ui/material-icon";

interface InviteEntry {
  email: string;
  role: string;
}

const TeamSetup: React.FC = () => {
  const navigate = useNavigate();
  const { isLoading, isAdmin, companyName } = useTeamSetupAuth();
  const { sendInvitation, isSubmitting, error } = useTeamInvitation();
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("technician");
  const [inviteList, setInviteList] = useState<InviteEntry[]>([]);

  if (isLoading) return <TeamSetupLoading />;
  if (!isAdmin) return <TeamSetupNotAuthorized />;

  const handleAddToList = () => {
    if (!inviteEmail || !inviteEmail.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }
    setInviteList(prev => [{ email: inviteEmail, role: inviteRole }, ...prev]);
    setInviteEmail("");
  };

  const handleRemove = (idx: number) => {
    setInviteList(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSendAll = async () => {
    for (const entry of inviteList) {
      await sendInvitation(entry.email);
    }
    toast.success("Invitations sent!");
    navigate("/dashboard");
  };

  const handleSkip = () => {
    toast.info("You can invite team members later from the Team page");
    navigate("/dashboard");
  };

  return (
    <div className="bg-surface text-on-surface font-body-md min-h-screen">
      {/* TopNavBar */}
      <header className="bg-surface/80 backdrop-blur-md fixed top-0 w-full z-50 border-b border-outline-variant/30 h-16 flex items-center px-container_padding">
        <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="font-headline-md text-headline-md font-bold text-primary">MaintenEase</span>
            <div className="h-6 w-[1px] bg-outline-variant/50"></div>
            <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Setup Wizard</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-label-sm text-label-sm text-on-surface-variant">Step 2 of 4</span>
            <div className="w-32 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
              <div className="w-1/2 h-full bg-primary transition-all duration-500"></div>
            </div>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-12 px-container_padding">
        <div className="max-w-5xl mx-auto">
          {/* Header Section */}
          <div className="mb-10 text-center">
            <h1 className="font-headline-lg text-headline-lg text-primary mb-3">Invite Your Team</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
              Collaboration is the core of efficient facility management. Add your administrators, managers, and technicians to get started.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
            {/* Left Column: Input Form */}
            <div className="lg:col-span-7 space-y-gutter">
              <section className="bg-surface-container-lowest p-card_padding rounded-xl border border-outline-variant/20" style={{ boxShadow: '0 10px 30px rgba(0,0,0,0.04)' }}>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="font-headline-md text-headline-md text-primary">Add Members</h2>
                  <button className="flex items-center gap-2 text-primary font-label-md text-label-md hover:underline transition-all">
                    <MaterialIcon name="upload_file" className="text-[20px]" />
                    Bulk Upload CSV
                  </button>
                </div>
                {error && (
                  <div className="mb-4 p-3 bg-error-container text-on-error-container rounded-lg font-label-sm text-label-sm flex items-center gap-2">
                    <MaterialIcon name="error" className="shrink-0" />
                    {error}
                  </div>
                )}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-label-md text-label-md text-on-surface-variant ml-1">Email Address</label>
                      <input
                        className="w-full bg-surface-container-low border-none rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary transition-all text-body-md outline-none"
                        placeholder="e.g. name@company.com"
                        type="email"
                        value={inviteEmail}
                        onChange={e => setInviteEmail(e.target.value)}
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-label-md text-label-md text-on-surface-variant ml-1">Initial Role</label>
                      <select
                        className="w-full bg-surface-container-low border-none rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary transition-all text-body-md outline-none appearance-none"
                        value={inviteRole}
                        onChange={e => setInviteRole(e.target.value)}
                      >
                        <option value="technician">Technician</option>
                        <option value="manager">Manager</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </div>
                  <button
                    className="w-full bg-primary text-on-primary font-label-md text-label-md uppercase tracking-widest py-4 rounded-lg flex justify-center items-center gap-2 hover:bg-primary-container transition-all active:scale-[0.98]"
                    onClick={handleAddToList}
                    disabled={isSubmitting}
                    type="button"
                  >
                    <MaterialIcon name="person_add" />
                    Add to Invitation List
                  </button>
                </div>
              </section>

              {/* Role Definitions */}
              <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-surface-container-high/30 p-4 rounded-lg border border-outline-variant/10">
                  <div className="flex items-center gap-2 mb-2 text-primary">
                    <MaterialIcon name="shield_person" filled className="text-[18px]" />
                    <span className="font-label-md text-label-md">Admin</span>
                  </div>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">Full system access, billing, and user management.</p>
                </div>
                <div className="bg-surface-container-high/30 p-4 rounded-lg border border-outline-variant/10">
                  <div className="flex items-center gap-2 mb-2 text-primary">
                    <MaterialIcon name="manage_accounts" filled className="text-[18px]" />
                    <span className="font-label-md text-label-md">Manager</span>
                  </div>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">Approves work orders and manages inventory.</p>
                </div>
                <div className="bg-surface-container-high/30 p-4 rounded-lg border border-outline-variant/10">
                  <div className="flex items-center gap-2 mb-2 text-primary">
                    <MaterialIcon name="build" filled className="text-[18px]" />
                    <span className="font-label-md text-label-md">Technician</span>
                  </div>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">Executes work orders and logs maintenance data.</p>
                </div>
              </section>
            </div>

            {/* Right Column: Preview List */}
            <div className="lg:col-span-5">
              <section className="bg-surface-container-lowest h-full flex flex-col rounded-xl border border-outline-variant/20 overflow-hidden" style={{ boxShadow: '0 10px 30px rgba(0,0,0,0.04)' }}>
                <div className="p-card_padding border-b border-outline-variant/10 bg-surface-container-low/50">
                  <h2 className="font-headline-md text-headline-md text-primary">Invitation Preview</h2>
                  <p className="font-label-sm text-label-sm text-on-surface-variant mt-1">Review your team before sending</p>
                </div>
                <div className="flex-1 overflow-y-auto p-card_padding space-y-3 min-h-[300px]">
                  {inviteList.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full opacity-40 text-center py-10">
                      <MaterialIcon name="group_add" className="text-[48px] mb-2" />
                      <p className="font-body-md text-body-md">No members added yet</p>
                    </div>
                  ) : (
                    inviteList.map((entry, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-surface border border-outline-variant/10 rounded-lg hover:border-primary/20 transition-all group">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary-fixed text-primary flex items-center justify-center font-bold text-label-md">
                            {entry.email.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-label-md text-label-md text-on-surface">{entry.email}</p>
                            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant">{entry.role}</span>
                          </div>
                        </div>
                        <button
                          className="p-2 text-on-surface-variant hover:text-error transition-colors opacity-0 group-hover:opacity-100"
                          onClick={() => handleRemove(idx)}
                          type="button"
                        >
                          <MaterialIcon name="close" className="text-[20px]" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
                <div className="p-card_padding bg-surface-container-low/20 border-t border-outline-variant/10">
                  <div className="flex justify-between items-center mb-6">
                    <span className="font-label-md text-label-md text-on-surface-variant">
                      Total Invitations: <span className="text-primary font-bold">{inviteList.length}</span>
                    </span>
                    <button
                      className="text-primary font-label-md text-label-md hover:underline"
                      onClick={() => setInviteList([])}
                      type="button"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="flex gap-4">
                    <button
                      className="flex-1 border border-primary text-primary font-label-md text-label-md uppercase tracking-widest py-3 rounded-lg hover:bg-primary/5 transition-all"
                      onClick={() => navigate("/company-setup")}
                      type="button"
                    >
                      Back
                    </button>
                    <button
                      className="flex-[2] bg-primary text-on-primary font-label-md text-label-md uppercase tracking-widest py-3 rounded-lg hover:bg-primary-container transition-all active:scale-95 disabled:opacity-50"
                      disabled={isSubmitting || inviteList.length === 0}
                      onClick={handleSendAll}
                      type="button"
                    >
                      {isSubmitting ? "Sending..." : "Send Invitations"}
                    </button>
                  </div>
                  <div className="mt-4 text-center">
                    <button
                      className="text-primary font-label-md text-label-md hover:underline text-sm"
                      onClick={handleSkip}
                      type="button"
                    >
                      Skip for now — invite later from Team page
                    </button>
                  </div>
                </div>
              </section>
            </div>
          </div>

          {/* Footer Compliance/Info */}
          <div className="mt-12 flex flex-col md:flex-row justify-between items-center gap-4 text-on-surface-variant">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <MaterialIcon name="verified_user" className="text-[18px]" />
                <span className="font-label-sm text-label-sm">Secure Invites</span>
              </div>
              <div className="flex items-center gap-2">
                <MaterialIcon name="gavel" className="text-[18px]" />
                <span className="font-label-sm text-label-sm">Enterprise Compliance</span>
              </div>
            </div>
            <div className="font-label-sm text-label-sm">
              © 2024 MaintenEase CMMS. Precision Facility Management.
            </div>
          </div>
        </div>
      </main>

      {/* Visual Background Elements */}
      <div className="fixed bottom-0 right-0 w-1/3 h-1/3 bg-primary-container/10 blur-[120px] rounded-full pointer-events-none -z-10"></div>
      <div className="fixed top-20 left-0 w-64 h-64 bg-tertiary-fixed/5 blur-[80px] rounded-full pointer-events-none -z-10"></div>
    </div>
  );
};

export default TeamSetup;
