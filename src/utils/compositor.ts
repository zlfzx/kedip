import type { LayoutConfig, TextOverlay, FrameSettings } from '../types';

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/** Pre-load an array of data-URL photos and return HTMLImageElement[]. Call once. */
export async function preloadImages(photos: string[]): Promise<HTMLImageElement[]> {
  return Promise.all(photos.map(loadImage));
}

/** Rounded rect path helper (works in all modern browsers) */
function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/** Object-cover center-crop: fills slot without distortion */
function drawImageCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  dx: number, dy: number, dw: number, dh: number,
) {
  const imgRatio = img.naturalWidth / img.naturalHeight;
  const slotRatio = dw / dh;
  let sx: number, sy: number, sw: number, sh: number;
  if (imgRatio > slotRatio) {
    sh = img.naturalHeight; sw = sh * slotRatio;
    sx = (img.naturalWidth - sw) / 2; sy = 0;
  } else {
    sw = img.naturalWidth; sh = sw / slotRatio;
    sx = 0; sy = (img.naturalHeight - sh) / 2;
  }
  ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
}

/** Transform a layout slot using frame padding + gap settings */
function applyFrameToSlot(
  slot: { x: number; y: number; width: number; height: number },
  frame: FrameSettings,
  canvasW: number,
  canvasH: number,
) {
  const p = frame.padding;
  const g = frame.gap / 2;
  const scaleX = (canvasW - 2 * p) / canvasW;
  const scaleY = (canvasH - 2 * p) / canvasH;
  return {
    x: slot.x * scaleX + p + g,
    y: slot.y * scaleY + p + g,
    width: slot.width * scaleX - 2 * g,
    height: slot.height * scaleY - 2 * g,
  };
}

const FONT_SIZE_MAP: Record<TextOverlay['fontSize'], number> = {
  sm: 22,
  md: 36,
  lg: 52,
};

/** Draw text overlays at free x/y percentage positions */
function drawTextOverlays(
  ctx: CanvasRenderingContext2D,
  overlays: TextOverlay[],
  canvasW: number,
  canvasH: number,
) {
  for (const overlay of overlays) {
    if (!overlay.text.trim()) continue;
    const px = FONT_SIZE_MAP[overlay.fontSize];
    ctx.font = `${px}px ${overlay.fontFamily}`;
    ctx.textAlign = overlay.align as CanvasTextAlign;
    ctx.textBaseline = 'middle';

    const xPx = (overlay.x / 100) * canvasW;
    const yPx = (overlay.y / 100) * canvasH;

    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.45)';
    ctx.shadowBlur = 10;
    ctx.fillStyle = overlay.color;
    ctx.fillText(overlay.text, xPx, yPx, canvasW - 40);
    ctx.restore();
  }
}

const DEFAULT_FRAME: FrameSettings = {
  backgroundColor: '#ffffff',
  padding: 20,
  gap: 8,
  borderWidth: 0,
  borderColor: '#0D0D0D',
  borderRadius: 0,
};

/**
 * Draw the composite directly onto the provided canvas context.
 * Accepts pre-loaded HTMLImageElement[] so no async image loading is needed.
 * This is synchronous and flicker-free — ideal for live preview.
 */
export function drawComposite(
  ctx: CanvasRenderingContext2D,
  images: HTMLImageElement[],
  layout: LayoutConfig,
  textOverlays: TextOverlay[] = [],
  frameSettings: FrameSettings = DEFAULT_FRAME,
) {
  const w = layout.canvasWidth;
  const h = layout.canvasHeight;

  // Background
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = frameSettings.backgroundColor;
  ctx.fillRect(0, 0, w, h);

  // Photos in slots
  for (let i = 0; i < layout.slots.length; i++) {
    if (!images[i]) continue;
    const raw = layout.slots[i];
    const slot = applyFrameToSlot(raw, frameSettings, w, h);

    ctx.save();
    roundedRect(ctx, slot.x, slot.y, slot.width, slot.height, frameSettings.borderRadius);
    ctx.clip();
    drawImageCover(ctx, images[i], slot.x, slot.y, slot.width, slot.height);
    ctx.restore();

    if (frameSettings.borderWidth > 0) {
      ctx.save();
      roundedRect(ctx, slot.x, slot.y, slot.width, slot.height, frameSettings.borderRadius);
      ctx.strokeStyle = frameSettings.borderColor;
      ctx.lineWidth = frameSettings.borderWidth;
      ctx.stroke();
      ctx.restore();
    }
  }

  // Text overlays
  if (textOverlays.length > 0) {
    drawTextOverlays(ctx, textOverlays, w, h);
  }
}

/**
 * Build the final composite as a PNG data URL (for download / share).
 * Uses loadImage internally — suitable for one-shot final export.
 */
export async function compositePhotos(
  photos: string[],
  layout: LayoutConfig,
  textOverlays: TextOverlay[] = [],
  frameSettings: FrameSettings = DEFAULT_FRAME,
): Promise<string> {
  const images = await preloadImages(photos);
  const canvas = document.createElement('canvas');
  canvas.width = layout.canvasWidth;
  canvas.height = layout.canvasHeight;
  const ctx = canvas.getContext('2d')!;

  drawComposite(ctx, images, layout, textOverlays, frameSettings);

  return canvas.toDataURL('image/png');
}

