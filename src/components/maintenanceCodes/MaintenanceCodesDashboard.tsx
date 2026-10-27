import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import QueryErrorState from "@/components/common/QueryErrorState";
import { useMaintenanceCodes } from "@/hooks/useMaintenanceCodes";
import type { MaintenanceCodeType } from "@/types/maintenanceCodes";

export function MaintenanceCodesDashboard() {
  const failure = useMaintenanceCodes("failure");
  const downtime = useMaintenanceCodes("downtime");

  return (
    <Tabs defaultValue="failure">
      <TabsList>
        <TabsTrigger value="failure">Failure codes</TabsTrigger>
        <TabsTrigger value="downtime">Downtime codes</TabsTrigger>
      </TabsList>
      <TabsContent value="failure" className="mt-4">
        <CodePanel type="failure" hook={failure} />
      </TabsContent>
      <TabsContent value="downtime" className="mt-4">
        <CodePanel type="downtime" hook={downtime} />
      </TabsContent>
    </Tabs>
  );
}

function CodePanel({
  type,
  hook,
}: {
  type: MaintenanceCodeType;
  hook: ReturnType<typeof useMaintenanceCodes>;
}) {
  const [code, setCode] = useState("");
  const [label, setLabel] = useState("");

  if (hook.error) {
    return <QueryErrorState title="Could not load codes." onRetry={() => hook.refetch()} />;
  }

  const add = async () => {
    if (!code.trim() || !label.trim()) return;
    await hook.create.mutateAsync({ code_type: type, code: code.trim(), label: label.trim() });
    setCode("");
    setLabel("");
  };

  return (
    <div className="space-y-4">
      <Card className="p-4 grid sm:grid-cols-3 gap-3 items-end">
        <div>
          <Label className="text-xs">Code</Label>
          <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g. BRG-01" />
        </div>
        <div>
          <Label className="text-xs">Label</Label>
          <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Bearing failure" />
        </div>
        <Button onClick={add} disabled={hook.create.isPending}>
          <Plus className="h-4 w-4 mr-1" /> Add
        </Button>
      </Card>
      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40 text-left text-xs uppercase text-muted-foreground">
              <th className="p-3">Code</th>
              <th className="p-3">Label</th>
              <th className="p-3 w-16" />
            </tr>
          </thead>
          <tbody>
            {hook.isLoading ? (
              <tr><td colSpan={3} className="p-6 text-muted-foreground">Loading…</td></tr>
            ) : hook.codes.length === 0 ? (
              <tr><td colSpan={3} className="p-8 text-center text-muted-foreground">No codes yet.</td></tr>
            ) : (
              hook.codes.map((c) => (
                <tr key={c.id} className="border-b">
                  <td className="p-3 font-mono text-xs">{c.code}</td>
                  <td className="p-3">{c.label}</td>
                  <td className="p-3">
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => hook.remove.mutate(c.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
