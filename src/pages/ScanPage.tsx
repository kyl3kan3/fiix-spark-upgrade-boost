import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import PageHeader from "@/components/shell/PageHeader";
import PageContainer from "@/components/shell/PageContainer";
import { PaywallGate } from "@/components/billing/PaywallGate";
import { BarcodeScanner } from "@/components/scan/BarcodeScanner";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";

const ScanPage = () => {
  const navigate = useNavigate();

  const resolveScan = async (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;

    const { data: asset } = await supabase
      .from("assets")
      .select("id, name")
      .or(`serial_number.eq.${trimmed},id.eq.${trimmed}`)
      .maybeSingle();

    if (asset?.id) {
      toast.success(`Opened ${asset.name}`);
      navigate(`/assets/${asset.id}`);
      return;
    }

    const { data: wo } = await supabase
      .from("work_orders")
      .select("id, title")
      .eq("id", trimmed)
      .maybeSingle();

    if (wo?.id) {
      navigate(`/work-orders/${wo.id}`);
      return;
    }

    toast.error("No asset or work order matched this code.");
  };

  return (
    <DashboardLayout>
      <PageHeader
        code="SCN · 001"
        title="Scan"
        description="Scan a QR or barcode to jump to equipment or a work order."
      />
      <PageContainer>
        <PaywallGate
          feature="mobile_pwa_offline"
          title="Mobile scan & offline mode are Pro features"
          description="Upgrade for barcode/QR lookup and offline work-order sync."
        >
          <Card className="p-4 max-w-lg">
            <BarcodeScanner onScan={resolveScan} />
          </Card>
        </PaywallGate>
      </PageContainer>
    </DashboardLayout>
  );
};

export default ScanPage;
