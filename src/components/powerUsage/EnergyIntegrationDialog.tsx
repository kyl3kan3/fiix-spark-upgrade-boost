import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plug, Copy, RefreshCw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  ingestEndpointUrl,
  getOrCreateIngestToken,
  regenerateIngestToken,
} from "@/services/energyIngestService";

const TOKEN_KEY = ["power-usage", "ingest-token"] as const;

const copy = async (value: string, what: string) => {
  try {
    await navigator.clipboard.writeText(value);
    toast.success(`${what} copied`);
  } catch {
    toast.error("Couldn't copy");
  }
};

const EnergyIntegrationDialog: React.FC = () => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const endpoint = ingestEndpointUrl();

  const { data: token, isLoading } = useQuery({
    queryKey: TOKEN_KEY,
    queryFn: getOrCreateIngestToken,
    enabled: open,
  });

  const regen = useMutation({
    mutationFn: regenerateIngestToken,
    onSuccess: (t) => {
      queryClient.setQueryData(TOKEN_KEY, t);
      toast.success("New token generated");
    },
    onError: () => toast.error("Couldn't regenerate the token"),
  });

  const curl = `curl -X POST '${endpoint}' \\
  -H 'x-ingest-token: ${token ?? "<your-token>"}' \\
  -H 'content-type: application/json' \\
  -d '{"readings":[{"kwh":120,"cost":24.5,"meter_label":"Main"}]}'`;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plug className="h-4 w-4 mr-2" />
          Integration
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Live energy integration</DialogTitle>
          <DialogDescription>
            Have a utility portal or IoT meter POST readings to this endpoint with your token. They land in this
            dashboard tagged as “integration”.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1">
            <Label className="text-xs">Endpoint</Label>
            <div className="flex gap-2">
              <Input readOnly value={endpoint} className="font-mono text-xs" />
              <Button variant="outline" size="icon" onClick={() => copy(endpoint, "Endpoint")} aria-label="Copy endpoint">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Token (sent as the x-ingest-token header)</Label>
            <div className="flex gap-2">
              <Input
                readOnly
                value={isLoading ? "Loading…" : token ?? ""}
                className="font-mono text-xs"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => token && copy(token, "Token")}
                disabled={!token}
                aria-label="Copy token"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => regen.mutate()}
                disabled={regen.isPending}
                aria-label="Regenerate token"
              >
                {regen.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Regenerating immediately invalidates the old token.
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Example request</Label>
              <Button variant="ghost" size="sm" onClick={() => copy(curl, "Example")} className="h-7">
                <Copy className="h-3.5 w-3.5 mr-1" /> Copy
              </Button>
            </div>
            <pre className="rounded-md bg-muted p-3 text-[11px] overflow-x-auto whitespace-pre-wrap break-all">
              {curl}
            </pre>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EnergyIntegrationDialog;
