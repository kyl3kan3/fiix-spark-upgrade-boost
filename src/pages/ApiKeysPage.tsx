import React, { useEffect, useState } from "react";
import { KeyRound, Loader2, Copy, Trash2 } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import BackToDashboard from "@/components/dashboard/BackToDashboard";
import { PaywallGate } from "@/components/billing/PaywallGate";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  created_at: string;
  last_used_at: string | null;
  revoked_at: string | null;
}

async function sha256(text: string): Promise<string> {
  const buf = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function generateKey(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  const b64 = btoa(String.fromCharCode(...bytes)).replace(/[+/=]/g, "").slice(0, 40);
  return `mke_live_${b64}`;
}

const ApiKeysPage: React.FC = () => {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);

  const fetchKeys = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("api_keys")
      .select("id, name, key_prefix, created_at, last_used_at, revoked_at")
      .order("created_at", { ascending: false });
    if (error) {
      console.error(error);
    } else {
      setKeys((data || []) as ApiKey[]);
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in");
      const { data: profile } = await supabase
        .from("profiles").select("company_id").eq("id", user.id).maybeSingle();
      if (!profile?.company_id) throw new Error("No company");

      const fullKey = generateKey();
      const key_hash = await sha256(fullKey);
      const key_prefix = fullKey.slice(0, 16);

      const { error } = await supabase.from("api_keys").insert({
        company_id: profile.company_id,
        created_by: user.id,
        name: name.trim(),
        key_hash,
        key_prefix,
      });
      if (error) throw error;
      setNewKey(fullKey);
      setName("");
      fetchKeys();
    } catch (e: any) {
      toast.error(e?.message || "Failed to create key");
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = async (id: string) => {
    if (!confirm("Revoke this key? It will stop working immediately.")) return;
    const { error } = await supabase
      .from("api_keys")
      .update({ revoked_at: new Date().toISOString() })
      .eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Key revoked");
      fetchKeys();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Permanently delete this key?")) return;
    const { error } = await supabase.from("api_keys").delete().eq("id", id);
    if (error) toast.error(error.message);
    else fetchKeys();
  };

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        <BackToDashboard />
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold flex items-center gap-2">
            <KeyRound className="h-6 w-6 sm:h-8 sm:w-8" />
            API Keys
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Manage API keys for programmatic access to your MaintenEase data.
          </p>
        </div>

        <PaywallGate
          feature="api"
          title="API access is a Business feature"
          description="Upgrade to Business to generate API keys and integrate MaintenEase with your other systems."
        >
          <Card>
            <CardHeader>
              <CardTitle>Create new key</CardTitle>
              <CardDescription>
                Give the key a memorable name (e.g. "Zapier integration"). You'll see the
                full key once — store it securely.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1">
                <Label htmlFor="keyName" className="sr-only">Name</Label>
                <Input
                  id="keyName"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Integration name"
                />
              </div>
              <Button onClick={handleCreate} disabled={creating}>
                {creating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Create key
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your keys</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : keys.length === 0 ? (
                <p className="text-muted-foreground text-sm py-6 text-center">
                  No API keys yet.
                </p>
              ) : (
                <ul className="divide-y">
                  {keys.map((k) => (
                    <li key={k.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate">{k.name}</span>
                          {k.revoked_at && <Badge variant="destructive">Revoked</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground font-mono truncate">
                          {k.key_prefix}…
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Created {new Date(k.created_at).toLocaleDateString()}
                          {k.last_used_at
                            ? ` · Last used ${new Date(k.last_used_at).toLocaleDateString()}`
                            : " · Never used"}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {!k.revoked_at && (
                          <Button size="sm" variant="outline" onClick={() => handleRevoke(k.id)}>
                            Revoke
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(k.id)}
                          aria-label="Delete"
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
        </PaywallGate>
      </div>

      <Dialog open={!!newKey} onOpenChange={(o) => !o && setNewKey(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save your new API key</DialogTitle>
            <DialogDescription>
              This is the only time you'll see the full key. Copy and store it now.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-muted rounded-lg p-3 font-mono text-xs break-all">
            {newKey}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => newKey && copy(newKey)}>
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
            <Button onClick={() => setNewKey(null)}>I've saved it</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default ApiKeysPage;