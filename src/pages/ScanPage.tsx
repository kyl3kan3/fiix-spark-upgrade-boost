import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import PageHeader from "@/components/shell/PageHeader";
import PageContainer from "@/components/shell/PageContainer";
import { PaywallGate } from "@/components/billing/PaywallGate";
import { BarcodeScanner } from "@/components/scan/BarcodeScanner";
import { scanRecord, type ScannedPart } from "@/services/scanService";
import { PartStockAdjustDialog } from "@/components/parts/PartStockAdjustDialog";
import { Card } from "@/components/ui/card";

const ScanPage = () => {
  const navigate = useNavigate();
  const [part, setPart] = useState<ScannedPart | null>(null);

  const resolveScan = async (value: string, signal: AbortSignal) => {
    const record = await scanRecord(value, window.location.origin);
    if (signal.aborted) return;
    if (record.kind === "part") setPart(record.part);
    else navigate(`/${record.kind === "asset" ? "assets" : "work-orders"}/${record.id}`);
  };

  return (
    <DashboardLayout>
      <PageHeader
        code="SCN · 001"
        title="Scan"
        description="Scan a part number to receive or adjust stock, or open an asset or work order by its label."
      />
      <PageContainer>
        <PaywallGate
          feature="mobile_pwa_offline"
          title="Mobile scan & offline mode are Pro features"
          description="Upgrade for barcode/QR lookup and offline work-order sync."
        >
          <Card className="p-4 max-w-lg">
            <BarcodeScanner onScan={resolveScan} paused={!!part} />
            {part && <PartStockAdjustDialog part={part} onClose={() => setPart(null)} />}
          </Card>
        </PaywallGate>
      </PageContainer>
    </DashboardLayout>
  );
};

export default ScanPage;
