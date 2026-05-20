import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Thermometer } from "lucide-react";

type Unit = "F" | "C";

interface CompanyTempSettings {
 id: string;
 temp_min_c: number | null;
 temp_max_c: number | null;
 temp_unit: Unit;
 weather_alerts_enabled: boolean;
}

interface LocationRow {
 id: string;
 name: string;
 latitude: number | null;
 longitude: number | null;
 weather_alerts_enabled: boolean;
}

const cToDisplay = (c: number | null, unit: Unit) =>
 c == null ? "" : unit === "F" ? ((c * 9) / 5 + 32).toFixed(1) : c.toFixed(1);
const displayToC = (val: string, unit: Unit): number | null => {
 if (val.trim() === "") return null;
 const n = Number(val);
 if (Number.isNaN(n)) return null;
 return unit === "F" ? ((n - 32) * 5) / 9 : n;
};

const WeatherAlertsCard: React.FC = () => {
 const [loading, setLoading] = useState(true);
 const [saving, setSaving] = useState(false);
 const [company, setCompany] = useState<CompanyTempSettings | null>(null);
 const [locations, setLocations] = useState<LocationRow[]>([]);

 // editable fields
 const [unit, setUnit] = useState<Unit>("F");
 const [enabled, setEnabled] = useState(false);
 const [minDisp, setMinDisp] = useState("");
 const [maxDisp, setMaxDisp] = useState("");

 useEffect(() => {
 void load();
 }, []);

 const load = async () => {
 setLoading(true);
 try {
 const { data: userData } = await supabase.auth.getUser();
 const userId = userData?.user?.id;
 if (!userId) return;
 const { data: profile } = await supabase
 .from("profiles")
 .select("company_id")
 .eq("id", userId)
 .maybeSingle();
 const companyId = profile?.company_id;
 if (!companyId) return;

 const { data: c } = await supabase
 .from("companies")
 .select("id, temp_min_c, temp_max_c, temp_unit, weather_alerts_enabled")
 .eq("id", companyId)
 .maybeSingle();
 if (c) {
 const u = ((c as any).temp_unit as Unit) || "F";
 setCompany(c as CompanyTempSettings);
 setUnit(u);
 setEnabled(!!(c as any).weather_alerts_enabled);
 setMinDisp(cToDisplay((c as any).temp_min_c, u));
 setMaxDisp(cToDisplay((c as any).temp_max_c, u));
 }

 const { data: locs } = await supabase
 .from("locations")
 .select("id, name, latitude, longitude, weather_alerts_enabled")
 .eq("company_id", companyId)
 .order("name");
 setLocations((locs ?? []) as LocationRow[]);
 } finally {
 setLoading(false);
 }
 };

 const saveCompany = async () => {
 if (!company) return;
 setSaving(true);
 try {
 const min_c = displayToC(minDisp, unit);
 const max_c = displayToC(maxDisp, unit);
 const { error } = await supabase
 .from("companies")
 .update({
 temp_unit: unit,
 weather_alerts_enabled: enabled,
 temp_min_c: min_c,
 temp_max_c: max_c,
 })
 .eq("id", company.id);
 if (error) throw error;
 toast.success("Weather alert settings saved");
 } catch (e: any) {
 toast.error(e?.message || "Failed to save");
 } finally {
 setSaving(false);
 }
 };

 const updateLocation = async (id: string, patch: Partial<LocationRow>) => {
 setLocations((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
 const { error } = await supabase.from("locations").update(patch).eq("id", id);
 if (error) toast.error(`Location update failed: ${error.message}`);
 };

 return (
 <Card className="dark:bg-card dark:border-border border-border">
 <CardHeader>
 <CardTitle className=" text-foreground flex items-center gap-2">
 <Thermometer className="h-5 w-5" />
 Temperature Alerts
 </CardTitle>
 <CardDescription className="dark:text-muted-foreground text-foreground">
 Get notified when outdoor temperature at any of your locations crosses your configured min/max thresholds. Powered by OpenWeather, checked every 15 minutes.
 </CardDescription>
 </CardHeader>
 <CardContent className="space-y-6">
 <div className="flex items-center justify-between p-4 rounded-lg bg-muted dark:bg-card border dark:border-gray-600 border-border">
 <div>
 <Label className=" text-foreground font-medium">Enable temperature alerts</Label>
 <p className="text-sm text-foreground dark:text-muted-foreground">Master switch for your whole company.</p>
 </div>
 <Switch checked={enabled} onCheckedChange={setEnabled} disabled={loading} />
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
 <div>
 <Label className=" text-foreground">Unit</Label>
 <Select value={unit} onValueChange={(v) => setUnit(v as Unit)}>
 <SelectTrigger className="mt-1">
 <SelectValue />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="F">Fahrenheit (°F)</SelectItem>
 <SelectItem value="C">Celsius (°C)</SelectItem>
 </SelectContent>
 </Select>
 </div>
 <div>
 <Label className=" text-foreground">Min temperature (°{unit})</Label>
 <Input
 type="number"
 value={minDisp}
 onChange={(e) => setMinDisp(e.target.value)}
 placeholder="e.g. 32"
 className="mt-1"
 />
 </div>
 <div>
 <Label className=" text-foreground">Max temperature (°{unit})</Label>
 <Input
 type="number"
 value={maxDisp}
 onChange={(e) => setMaxDisp(e.target.value)}
 placeholder="e.g. 90"
 className="mt-1"
 />
 </div>
 </div>

 <Button onClick={saveCompany} disabled={saving || loading}>
 {saving ? "Saving..." : "Save thresholds"}
 </Button>

 <div className="pt-4 border-t dark:border-border">
 <h4 className="font-medium text-foreground mb-2">Locations</h4>
 <p className="text-sm text-foreground dark:text-muted-foreground mb-4">
 Add latitude/longitude for each location you want monitored, then enable it.
 </p>
 {locations.length === 0 && (
 <p className="text-sm text-muted-foreground">No locations yet. Add a location first.</p>
 )}
 <div className="space-y-3">
 {locations.map((loc) => (
 <div
 key={loc.id}
 className="grid grid-cols-1 sm:grid-cols-[1fr_120px_120px_auto] gap-2 sm:items-center p-3 rounded-md border dark:border-border"
 >
 <div className="font-medium text-foreground">{loc.name}</div>
 <Input
 type="number"
 step="0.0001"
 placeholder="Latitude"
 defaultValue={loc.latitude ?? ""}
 onBlur={(e) => {
 const v = e.target.value === "" ? null : Number(e.target.value);
 if (v !== loc.latitude) updateLocation(loc.id, { latitude: v });
 }}
 />
 <Input
 type="number"
 step="0.0001"
 placeholder="Longitude"
 defaultValue={loc.longitude ?? ""}
 onBlur={(e) => {
 const v = e.target.value === "" ? null : Number(e.target.value);
 if (v !== loc.longitude) updateLocation(loc.id, { longitude: v });
 }}
 />
 <div className="flex items-center gap-2 justify-end">
 <span className="text-sm text-foreground dark:text-muted-foreground">Alerts</span>
 <Switch
 checked={loc.weather_alerts_enabled}
 onCheckedChange={(v) => updateLocation(loc.id, { weather_alerts_enabled: v })}
 />
 </div>
 </div>
 ))}
 </div>
 </div>
 </CardContent>
 </Card>
 );
};

export default WeatherAlertsCard;