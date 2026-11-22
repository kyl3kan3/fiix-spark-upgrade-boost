import { render, waitFor } from "@testing-library/react";
import JsBarcode from "jsbarcode";
import QRCode from "qrcode";
import { afterEach, expect, it, vi } from "vitest";
import { BarcodeScanner } from "./BarcodeScanner";
import { createSoftwareBarcodeReader } from "./softwareBarcodeReader";

afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });

function renderFrame(width: number, height: number, black: (x: number, y: number) => boolean) {
  const data = new Uint8ClampedArray(width * height * 4).fill(255);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (black(x, y)) data.fill(0, 4 * (y * width + x), 4 * (y * width + x) + 3);
    }
  }
  const video = document.createElement("video");
  Object.defineProperties(video, { videoWidth: { value: width }, videoHeight: { value: height } });
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
    getImageData: () => ({ data }), drawImage: vi.fn(),
  } as unknown as CanvasRenderingContext2D);
  return video;
}

it("decodes an existing asset QR label from camera pixels", () => {
  const value = "https://maintenease.com/assets/abcdef01-0000-4000-9000-000000000001";
  const matrix = QRCode.create(value).modules;
  const size = (matrix.size + 8) * 4;
  const video = renderFrame(size, size, (x, y) => {
    const column = Math.floor(x / 4) - 4;
    const row = Math.floor(y / 4) - 4;
    return row >= 0 && column >= 0 && row < matrix.size && column < matrix.size && !!matrix.get(row, column);
  });
  expect(createSoftwareBarcodeReader()(video)).toBe(value);
});

it("loads the software decoder when native scanning is unavailable and reads a Code 128 label", async () => {
  const value = "0012-BELT";
  const barcode = { encodings: [] as { data: string }[] };
  JsBarcode(barcode, value, { format: "CODE128" });
  const bars = barcode.encodings.map((item) => item.data).join("");
  const width = 40 + bars.length * 3;
  renderFrame(width, 80, (x) => bars[Math.floor((x - 20) / 3)] === "1");
  vi.spyOn(HTMLVideoElement.prototype, "videoWidth", "get").mockReturnValue(width);
  vi.spyOn(HTMLVideoElement.prototype, "videoHeight", "get").mockReturnValue(80);
  vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue();
  const stop = vi.fn();
  const camera = { getUserMedia: vi.fn().mockResolvedValue({ getTracks: () => [{ stop }] }) };
  vi.stubGlobal("navigator", Object.assign(Object.create(navigator), { mediaDevices: camera }));
  vi.stubGlobal("BarcodeDetector", undefined);
  const onScan = vi.fn().mockResolvedValue(undefined);
  const view = render(<BarcodeScanner onScan={onScan} />);
  await waitFor(() => expect(onScan).toHaveBeenCalledWith(value, expect.any(AbortSignal)), { timeout: 4000 });
  const video = view.container.querySelector("video")!;
  view.unmount();
  expect(stop).toHaveBeenCalledOnce();
  expect(video.srcObject).toBeNull();
});

it("uses the native decoder when available and releases the camera on pause", async () => {
  const stop = vi.fn();
  const camera = { getUserMedia: vi.fn().mockResolvedValue({ getTracks: () => [{ stop }] }) };
  vi.stubGlobal("navigator", Object.assign(Object.create(navigator), { mediaDevices: camera }));
  const detect = vi.fn().mockResolvedValue([{ rawValue: "0012-BELT" }]);
  vi.stubGlobal("BarcodeDetector", class { detect = detect; });
  vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue();
  const onScan = vi.fn().mockResolvedValue(undefined);
  const view = render(<BarcodeScanner onScan={onScan} />);
  await waitFor(() => expect(onScan).toHaveBeenCalledWith("0012-BELT", expect.any(AbortSignal)), { timeout: 4000 });
  view.rerender(<BarcodeScanner onScan={onScan} paused />);
  expect(stop).toHaveBeenCalledOnce();
  expect(camera.getUserMedia).toHaveBeenCalledOnce();
});
