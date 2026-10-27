import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  onScan: (value: string) => void;
}

export function BarcodeScanner({ onScan }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [manual, setManual] = useState("");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    const Detector = (window as unknown as { BarcodeDetector?: new (opts: { formats: string[] }) => {
      detect: (source: HTMLVideoElement) => Promise<{ rawValue: string }[]>;
    } }).BarcodeDetector;
    if (!Detector || !navigator.mediaDevices?.getUserMedia) {
      setSupported(false);
      return;
    }
    setSupported(true);
    let stream: MediaStream | null = null;
    let timer: number | undefined;

    const start = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        const detector = new Detector({ formats: ["qr_code", "code_128", "ean_13"] });
        timer = window.setInterval(async () => {
          if (!videoRef.current) return;
          try {
            const codes = await detector.detect(videoRef.current);
            const value = codes[0]?.rawValue;
            if (value) onScan(value);
          } catch {
            /* ignore frame errors */
          }
        }, 500);
      } catch (e) {
        setCameraError(e instanceof Error ? e.message : "Camera unavailable");
      }
    };
    start();
    return () => {
      if (timer) window.clearInterval(timer);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [onScan]);

  return (
    <div className="space-y-4">
      {supported ? (
        <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
          <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Live camera scan is not supported in this browser. Enter a barcode or QR value below.
        </p>
      )}
      {cameraError && <p className="text-sm text-destructive">{cameraError}</p>}
      <div className="flex gap-2">
        <Input
          placeholder="Barcode / QR value"
          value={manual}
          onChange={(e) => setManual(e.target.value)}
        />
        <Button type="button" onClick={() => manual.trim() && onScan(manual.trim())}>
          Lookup
        </Button>
      </div>
    </div>
  );
}
