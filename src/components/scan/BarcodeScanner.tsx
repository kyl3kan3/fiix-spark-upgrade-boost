import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  onScan: (value: string, signal: AbortSignal) => Promise<void>;
  paused?: boolean;
}

type NativeDetector = {
  new (): { detect: (source: HTMLVideoElement) => Promise<{ rawValue: string }[]> };
  getSupportedFormats?: () => Promise<string[]>;
};

async function createCameraReader() {
  const Detector = (window as Window & { BarcodeDetector?: NativeDetector }).BarcodeDetector;
  if (Detector) {
    try {
      const formats = await Detector.getSupportedFormats?.();
      if (!formats || ["qr_code", "code_128", "ean_13"].every((format) => formats.includes(format))) {
        const detector = new Detector();
        return async (video: HTMLVideoElement) => (await detector.detect(video))[0]?.rawValue;
      }
    } catch {
      // Some browsers expose the detector before a native decoder is available.
    }
  }
  const { createSoftwareBarcodeReader } = await import("./softwareBarcodeReader");
  return createSoftwareBarcodeReader();
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
    const video = videoRef.current;
    if (!video || !navigator.mediaDevices?.getUserMedia) {
      setSupported(false);
      return;
    }
    setSupported(true);
    setCameraError(null);
    let stream: MediaStream | null = null;
    let timer: number | undefined;
    let cancelled = false;
    let detecting = false;
    const stopCamera = () => {
      if (!stream) return;
      stream.getTracks().forEach((track) => track.stop());
      if (video.srcObject === stream) video.srcObject = null;
      stream = null;
    };

    const start = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        if (cancelled) {
          stopCamera();
          return;
        }
        video.srcObject = stream;
        await video.play();
        if (cancelled) return;
        const readFrame = await createCameraReader();
        if (cancelled) return;
        timer = window.setInterval(async () => {
          if (detecting || request.current) return;
          detecting = true;
          try {
            const value = await readFrame(video);
            if (cancelled) return;
            if (value && value !== lastCameraCode.current) void lookup(value);
            lastCameraCode.current = value;
          } catch {
            /* ignore frame errors */
          } finally {
            detecting = false;
          }
        }, 500);
      } catch (e) {
        stopCamera();
        if (!cancelled) setCameraError(e instanceof Error ? e.message : "Camera unavailable");
      }
    };
    void start();
    return () => {
      cancelled = true;
      if (timer) window.clearInterval(timer);
      stopCamera();
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
