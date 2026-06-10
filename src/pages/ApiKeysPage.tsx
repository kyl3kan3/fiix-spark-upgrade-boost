import React, { useEffect, useState } from "react";
import { KeyRound, Loader2, Copy, Trash2, Plus, CheckCircle2 } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import BackToDashboard from "@/components/dashboard/BackToDashboard";
import { PaywallGate } from "@/components/billing/PaywallGate";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  type ApiKeySummary,
  createApiKey,
  deleteApiKey,
  listApiKeys,
  revokeApiKey,
} from "@/services/apiKeyService";
import PageContainer from "@/components/shell/PageContainer";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const ApiKeysPage: React.FC = () => {
  const [keys, setKeys] = useState<ApiKeySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);

  const fetchKeys = async () => {
    setLoading(true);
    try {
      setKeys(await listApiKeys());
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleCreate = async () => {
    if (!name.trim()) return toast.error("Name is required");
    setCreating(true);
    try {
      const fullKey = await createApiKey(name.trim());
      setNewKey(fullKey);
      setName("");
      fetchKeys();
    } catch (e) {
      toast.error((e as { message?: string })?.message || "Failed to create key");
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = async (id: string) => {
    if (!confirm("Revoke this key? It will stop working immediately.")) return;
    try {
      await revokeApiKey(id);
      toast.success("Key revoked");
      fetchKeys();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Permanently delete this key?")) return;
    try {
      await deleteApiKey(id);
      fetchKeys();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <DashboardLayout>
      <PageContainer className="space-y-8">
        <BackToDashboard />

        {/* Page Header */}
        <div>
          <h1 className="font-headline text-3xl font-bold text-primary flex items-center gap-3">
            <KeyRound className="h-8 w-8" />
            API &amp; Integrations
          </h1>
          <p className="text-base text-muted-foreground mt-1">
            Manage API keys for programmatic access to your MaintenEase data.
          </p>
        </div>

        <PaywallGate
          feature="api"
          title="API access is a Business feature"
          description="Upgrade to Business to generate API keys and integrate MaintenEase with your other systems."
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Active API Keys — spans 2 cols */}
            <Card className="lg:col-span-2 bg-card border border-border rounded-lg shadow-sm hover:shadow-md hover:border-primary/20 transition-all flex flex-col">
              <CardHeader className="border-b border-border pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="font-headline text-xl text-foreground flex items-center gap-2">
                      <KeyRound className="h-5 w-5 text-primary" />
                      Active API Keys
                    </CardTitle>
                    <CardDescription className="text-muted-foreground mt-1">
                      Give the key a memorable name. You'll see the full key once — store it securely.
                    </CardDescription>
                  </div>
                  <Button
                    onClick={handleCreate}
                    disabled={creating || !name.trim()}
                    className="bg-primary hover:bg-primary-variant text-primary-foreground uppercase tracking-wide text-xs font-semibold shadow-sm"
                  >
                    {creating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                    <span className="ml-1 hidden sm:inline">Generate Key</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-4 flex-1">
                {/* Create form */}
                <div className="flex flex-col sm:flex-row gap-2 p-4 bg-background rounded-lg border border-border">
                  <div className="flex-1">
                    <Label htmlFor="keyName" className="sr-only">
                      Name
                    </Label>
                    <Input
                      id="keyName"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Integration name (e.g. Zapier integration)"
                      className="bg-background border-border focus:ring-primary"
                      onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                    />
                  </div>
                  <Button
                    onClick={handleCreate}
                    disabled={creating}
                    className="bg-primary hover:bg-primary-variant text-primary-foreground uppercase tracking-wide text-xs font-semibold"
                  >
                    {creating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                    Create key
                  </Button>
                </div>

                {/* Keys list */}
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : keys.length === 0 ? (
                  <p className="text-muted-foreground text-sm py-6 text-center">
                    No API keys yet. Create one above.
                  </p>
                ) : (
                  <ul className="divide-y divide-border">
                    {keys.map((k) => (
                      <li
                        key={k.id}
                        className="flex flex-wrap items-center justify-between gap-3 py-4 group hover:bg-muted/30 px-2 -mx-2 rounded-lg transition-colors"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground truncate">{k.name}</span>
                            {k.revoked_at ? (
                              <Badge variant="destructive" className="text-xs rounded-full px-2 py-0.5">
                                Revoked
                              </Badge>
                            ) : (
                              <Badge className="text-xs rounded-full px-2 py-0.5 bg-success/20 text-success border-0 font-semibold">
                                Active
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground font-mono truncate mt-0.5">
                            {k.key_prefix}…
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Created {new Date(k.created_at).toLocaleDateString()}
                            {k.last_used_at
                              ? ` · Last used ${new Date(k.last_used_at).toLocaleDateString()}`
                              : " · Never used"}
                          </p>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!k.revoked_at && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRevoke(k.id)}
                              className="border-border text-primary hover:bg-primary/5 text-xs uppercase tracking-wide font-semibold"
                            >
                              Revoke
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(k.id)}
                            aria-label="Delete"
                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            {/* Developer Docs sidebar */}
            <Card className="bg-card border border-border rounded-lg shadow-sm hover:shadow-md hover:border-primary/20 transition-all flex flex-col relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
              <CardHeader className="border-b border-border pb-4 relative z-10">
                <CardTitle className="font-headline text-xl text-foreground flex items-center gap-2">
                  <KeyRound className="h-5 w-5 text-primary" />
                  Developer Docs
                </CardTitle>
                <CardDescription className="text-muted-foreground mt-1">
                  Explore guides, endpoints, and SDKs to build custom workflows.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 flex-1 flex flex-col relative z-10">
                <ul className="space-y-3 flex-1">
                  {[
                    "REST API Reference",
                    "Authentication Guide",
                    "Webhook Events",
                    "SDK Downloads",
                  ].map((item) => (
                    <li key={item}>
                      <a
                        href="#"
                        className="flex items-center gap-2 text-primary hover:underline text-sm font-semibold group"
                      >
                        <CheckCircle2 className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  variant="outline"
                  className="w-full mt-6 border-border text-primary hover:bg-primary/5 uppercase tracking-wide text-xs font-semibold"
                >
                  <a href="#" target="_blank" rel="noreferrer">
                    View API Portal
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </PaywallGate>
      </PageContainer>

      <Dialog open={!!newKey} onOpenChange={(o) => !o && setNewKey(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save your new API key</DialogTitle>
            <DialogDescription>
              This is the only time you'll see the full key. Copy and store it now.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-muted rounded-lg p-3 font-mono text-xs break-all border border-border">
            {newKey}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => newKey && copy(newKey)}
              className="border-border text-primary hover:bg-primary/5"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
            <Button
              onClick={() => setNewKey(null)}
              className="bg-primary hover:bg-primary-variant text-primary-foreground"
            >
              I've saved it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default ApiKeysPage;
