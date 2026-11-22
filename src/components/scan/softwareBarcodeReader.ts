import {
  BarcodeFormat, BinaryBitmap, DecodeHintType, HybridBinarizer,
  MultiFormatReader, NotFoundException, RGBLuminanceSource,
} from "@zxing/library";

export function createSoftwareBarcodeReader() {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("Camera frames could not be read. Enter the code below.");
  const reader = new MultiFormatReader();
  reader.setHints(new Map([[DecodeHintType.POSSIBLE_FORMATS, [
    BarcodeFormat.QR_CODE, BarcodeFormat.CODE_128, BarcodeFormat.CODE_39,
    BarcodeFormat.EAN_13, BarcodeFormat.EAN_8, BarcodeFormat.UPC_A, BarcodeFormat.UPC_E, BarcodeFormat.ITF,
  ]]]));

  return (video: HTMLVideoElement): string | undefined => {
    if (!video.videoWidth || !video.videoHeight) return;
    const scale = Math.min(1, 1280 / Math.max(video.videoWidth, video.videoHeight));
    const width = Math.round(video.videoWidth * scale);
    const height = Math.round(video.videoHeight * scale);
    if (canvas.width !== width) canvas.width = width;
    if (canvas.height !== height) canvas.height = height;
    context.drawImage(video, 0, 0, width, height);
    const { data } = context.getImageData(0, 0, width, height);
    const luminance = new Uint8ClampedArray(width * height);
    for (let i = 0; i < luminance.length; i++) {
      const p = i * 4;
      luminance[i] = (data[p] + 2 * data[p + 1] + data[p + 2]) / 4;
    }
    const source = new RGBLuminanceSource(luminance, width, height);
    try {
      return reader.decodeWithState(new BinaryBitmap(new HybridBinarizer(source))).getText();
    } catch (error) {
      if (!(error instanceof NotFoundException)) throw error;
    }
  };
}
