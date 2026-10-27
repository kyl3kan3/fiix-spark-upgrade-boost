import { useState } from "react";
import QRCode from "qrcode";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { assetScanUrl } from "@/lib/assetScanUrl";

type AssetRow = { id: string; name: string };

export function AssetBulkQrLabels({ assets }: { assets: AssetRow[] }) {
  const [printing, setPrinting] = useState(false);

  const printLabels = async () => {
    if (!assets.length) return;
    setPrinting(true);
    try {
      const origin = window.location.origin;
      const labels = await Promise.all(
        assets.map(async (asset) => ({
          name: asset.name,
          url: assetScanUrl(asset.id, origin),
          dataUrl: await QRCode.toDataURL(assetScanUrl(asset.id, origin), { width: 160, margin: 1 }),
        })),
      );
      const w = window.open("", "_blank");
      if (!w) return;
      const cells = labels
        .map(
          (l) => `
        <div style="display:inline-block;width:2.25in;padding:12px;text-align:center;vertical-align:top;page-break-inside:avoid">
          <p style="font-size:11px;font-weight:600;margin:0 0 8px;max-height:2.4em;overflow:hidden">${l.name}</p>
          <img src="${l.dataUrl}" width="140" height="140" alt="" />
          <p style="font-size:8px;color:#666;margin:6px 0 0;word-break:break-all">${l.url}</p>
        </div>`,
        )
        .join("");
      w.document.write(`<html><head><title>Asset QR labels</title></head><body>${cells}</body></html>`);
      w.document.close();
      w.focus();
      w.print();
    } finally {
      setPrinting(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="lg"
      onClick={printLabels}
      disabled={printing || assets.length === 0}
    >
      <Printer className="h-5 w-5" />
      QR labels ({assets.length})
    </Button>
  );
}
