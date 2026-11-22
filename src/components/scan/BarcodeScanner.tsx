import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  onScan: (value: string, signal: AbortSignal) => Promise<void>;
  paused?: boolean;
}

export function BarcodeScanner({ onScan, paused = false }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastCameraCode = useRef<string>();
  const [manual, setManual] = useState("");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [supported, setSupported] = useState(false);
  const [lookingUp, setLookingUp] = useState(false);
  const [lookupError, setLookupError] = useState("");
  const request = useRef<AbortController | null>(null);
  const scanHandler = useRef(onScan);

  useEffect(() => { scanHandler.current = onScan; }, [onScan]);
  useEffect(() => () => { request.current?.abort(); }, []);

  const lookup = useCallback(async (raw: string) => {
    const value = raw.trim();
    if (!value || request.current) return;
    const controller = new AbortController();
    request.current = controller;
    setLookingUp(true);
    setLookupError("");
    try {
      await scanHandler.current(value, controller.signal);
      if (!controller.signal.aborted) setManual("");
    } catch (err) {
      if (!controller.signal.aborted) setLookupError(err instanceof Error ? err.message : "Lookup failed.");
    } finally {
      request.current = null;
      if (!controller.signal.aborted) setLookingUp(false);
    }
  }, []);

  useEffect(() => {
    if (paused) return;
    const Detector = (window as unknown as { BarcodeDetector?: new () => {
      detect: (source: HTMLVideoElement) => Promise<{ rawValue: string }[]>;
    } }).BarcodeDetector;
    if (!Detector || !navigator.mediaDevices?.getUserMedia) {
      setSupported(false);
      return;
    }
    setSupported(true);
    setCameraError(null);
    let stream: MediaStream | null = null;
    let timer: number | undefined;
    let cancelled = false;
    let detecting = false;

    const start = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        if (cancelled) return;
        const detector = new Detector();
        timer = window.setInterval(async () => {
          if (!videoRef.current || detecting || request.current) return;
          detecting = true;
          try {
            const codes = await detector.detect(videoRef.current);
            if (cancelled) return;
            const value = codes[0]?.rawValue;
            if (value && value !== lastCameraCode.current) void lookup(value);
            lastCameraCode.current = value;
          } catch {
            /* ignore frame errors */
          } finally {
            detecting = false;
          }
        }, 500);
      } catch (e) {
        stream?.getTracks().forEach((track) => track.stop());
        if (!cancelled) setCameraError(e instanceof Error ? e.message : "Camera unavailable");
      }
    };
    void start();
    return () => {
      cancelled = true;
      if (timer) window.clearInterval(timer);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [lookup, paused]);

  return (
    <div className="space-y-4">
      <div hidden={!supported} className="relative aspect-video max-h-48 bg-black rounded-lg overflow-hidden">
        <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
      </div>
      {!supported && (
        <p className="text-sm text-muted-foreground">
          Use a handheld scanner or enter the code below.
        </p>
      )}
      {cameraError && <p className="text-sm text-destructive">{cameraError}</p>}
      <form className="flex gap-2" onSubmit={(event) => { event.preventDefault(); void lookup(manual); }}>
        <Input
          aria-label="Barcode or QR value"
          placeholder="Barcode / QR value"
          value={manual}
          onChange={(e) => setManual(e.target.value)}
        />
        <Button type="submit" disabled={lookingUp || !manual.trim()}>
          {lookingUp ? "Looking up…" : "Look up"}
        </Button>
      </form>
      {lookupError && <p role="alert" className="text-sm text-destructive">{lookupError}</p>}
    </div>
  );
}
