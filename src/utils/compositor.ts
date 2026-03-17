import type { FilterId, LayoutConfig } from '../types';
import { FILTERS } from './filters';

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Draw an image into a canvas rect using "object-cover" (center-crop) logic —
 * the image fills the slot without stretching, excess is cropped from edges.
 */
function drawImageCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  dx: number,
  dy: number,
  dw: number,
  dh: number,
) {
  const imgRatio = img.naturalWidth / img.naturalHeight;
  const slotRatio = dw / dh;

  let sx: number, sy: number, sw: number, sh: number;

  if (imgRatio > slotRatio) {
    // Image is wider than slot → crop horizontal sides
    sh = img.naturalHeight;
    sw = sh * slotRatio;
    sx = (img.naturalWidth - sw) / 2;
    sy = 0;
  } else {
    // Image is taller than slot → crop top/bottom
    sw = img.naturalWidth;
    sh = sw / slotRatio;
    sx = 0;
    sy = (img.naturalHeight - sh) / 2;
  }

  ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
}

export async function compositePhotos(
  photos: string[],
  layout: LayoutConfig,
  filter: FilterId,
): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = layout.canvasWidth;
  canvas.height = layout.canvasHeight;
  const ctx = canvas.getContext('2d')!;

  // White background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < layout.slots.length; i++) {
    if (!photos[i]) continue;
    const slot = layout.slots[i];
    const img = await loadImage(photos[i]);

    ctx.save();
    // Clip to slot bounds before drawing (handles any rounding edge bleed)
    ctx.beginPath();
    ctx.rect(slot.x, slot.y, slot.width, slot.height);
    ctx.clip();

    // Apply filter then center-crop draw
    ctx.filter = FILTERS[filter] || 'none';
    drawImageCover(ctx, img, slot.x, slot.y, slot.width, slot.height);
    ctx.filter = 'none';
    ctx.restore();
  }

  return canvas.toDataURL('image/png');
}
