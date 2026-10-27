import React, { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";
import { assetScanUrl } from "@/lib/assetScanUrl";

interface Props {
  assetId: string;
  assetName: string;
}

export function AssetQrPanel({ assetId, assetName }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const url = assetScanUrl(assetId);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      await QRCode.toCanvas(canvas, url, { width: 200, margin: 2 });
      if (!cancelled) setDataUrl(canvas.toDataURL("image/png"));
    })();
    return () => {
      cancelled = true;
    };
  }, [url]);

  const download = () => {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `asset-${assetId.slice(0, 8)}-qr.png`;
    a.click();
  };

  const printLabel = () => {
    const w = window.open("", "_blank", "width=400,height=520");
    if (!w || !dataUrl) return;
    w.document.write(`
      <html><head><title>${assetName} QR</title></head>
      <body style="font-family:sans-serif;text-align:center;padding:24px">
        <h2 style="font-size:14px;margin:0 0 12px">${assetName}</h2>
        <img src="${dataUrl}" width="200" height="200" alt="QR" />
        <p style="font-size:10px;color:#666;margin-top:8px">${url}</p>
      </body></html>`);
    w.document.close();
    w.focus();
    w.print();
  };

  return (
    <div className="surface-card rounded-lg p-6">
      <h3 className="label-eyebrow mb-4">Field Identification</h3>
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <canvas ref={canvasRef} className="rounded-lg border border-border bg-white" aria-label="Asset QR code" />
        <div className="flex-1 space-y-2 text-center sm:text-left">
          <p className="text-sm font-semibold text-foreground">{assetName}</p>
          <p className="text-xs text-muted-foreground break-all">{url}</p>
          <div className="flex flex-wrap gap-2 justify-center sm:justify-start pt-2">
            <Button type="button" size="sm" variant="outline" onClick={download} disabled={!dataUrl}>
              <Download className="h-4 w-4 mr-1" /> Download
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={printLabel} disabled={!dataUrl}>
              <Printer className="h-4 w-4 mr-1" /> Print label
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
