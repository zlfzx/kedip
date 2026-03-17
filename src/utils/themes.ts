import type { ThemeId } from '../types';

export const THEMES: { id: ThemeId; label: string }[] = [
  { id: 'none', label: 'Polos' },
  { id: 'polkadot', label: 'Polkadot' },
  { id: 'grid', label: 'Grid' },
  { id: 'hearts', label: 'Hati' },
  { id: 'stars', label: 'Bintang' },
  { id: 'film', label: 'Roll Film' },
  { id: 'y2k', label: 'Y2K Pop' },
  { id: 'floral', label: 'Bunga 🌸' },
  { id: 'retro', label: 'Retro 🍒' },
  { id: 'starry', label: 'Malam 🌙' },
];

export function getThemeIcon(id: ThemeId): string {
  switch (id) {
    case 'none': return '⚪';
    case 'polkadot': return '⏺';
    case 'grid': return '▦';
    case 'hearts': return '💖';
    case 'stars': return '⭐';
    case 'film': return '🎞️';
    case 'y2k': return '✨';
    case 'floral': return '🌸';
    case 'retro': return '🍒';
    case 'starry': return '🌙';
    default: return '✨';
  }
}

/**
 * Draws the background pattern based on the selected theme.
 * Uses off-screen canvas to create repeatable patterns for performance.
 */
export function drawThemeBackground(
  ctx: CanvasRenderingContext2D,
  theme: ThemeId,
  w: number,
  h: number,
  bgColor: string,
) {
  // Always draw base color first
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, w, h);

  if (theme === 'none' || theme === 'film' || theme === 'y2k' || theme === 'floral' || theme === 'retro' || theme === 'starry') return; // These only have foreground/solid bg

  const patternCanvas = document.createElement('canvas');
  const pCtx = patternCanvas.getContext('2d');
  if (!pCtx) return;

  // Helper to get a contrasting accent color based on background luminance
  // Very simplistic: if bg is dark, use light/white accent. If light, use dark/brand accent.
  const isDark = isColorDark(bgColor);
  const accentColor = isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(13, 13, 13, 0.08)';
  const highlightColor = isDark ? 'rgba(255, 255, 255, 0.4)' : '#FF6B8A'; // Kedip pink for light bg

  if (theme === 'polkadot') {
    patternCanvas.width = 40;
    patternCanvas.height = 40;
    pCtx.fillStyle = accentColor;
    pCtx.beginPath();
    pCtx.arc(10, 10, 4, 0, Math.PI * 2);
    pCtx.arc(30, 30, 4, 0, Math.PI * 2);
    pCtx.fill();
  } 
  else if (theme === 'grid') {
    patternCanvas.width = 30;
    patternCanvas.height = 30;
    pCtx.strokeStyle = accentColor;
    pCtx.lineWidth = 1.5;
    pCtx.beginPath();
    pCtx.moveTo(0, 0);
    pCtx.lineTo(30, 0);
    pCtx.moveTo(0, 0);
    pCtx.lineTo(0, 30);
    pCtx.stroke();
  }
  else if (theme === 'hearts') {
    patternCanvas.width = 60;
    patternCanvas.height = 60;
    pCtx.fillStyle = highlightColor;
    pCtx.globalAlpha = 0.2;
    // Draw a small heart
    pCtx.translate(30, 30);
    pCtx.rotate(-Math.PI / 8);
    drawHeart(pCtx, 0, 0, 12);
    pCtx.fill();
  }
  else if (theme === 'stars') {
    patternCanvas.width = 80;
    patternCanvas.height = 80;
    pCtx.fillStyle = highlightColor;
    pCtx.globalAlpha = 0.25;
    
    pCtx.save();
    pCtx.translate(20, 20);
    drawStar(pCtx, 0, 0, 5, 10, 4);
    pCtx.fill();
    pCtx.restore();

    pCtx.fillStyle = accentColor;
    pCtx.save();
    pCtx.translate(60, 60);
    drawStar(pCtx, 0, 0, 5, 14, 5);
    pCtx.fill();
    pCtx.restore();
  }

  const pattern = ctx.createPattern(patternCanvas, 'repeat');
  if (pattern) {
    ctx.fillStyle = pattern;
    ctx.fillRect(0, 0, w, h);
  }
}

/**
 * Draws foreground decorations (drawn AFTER photos and borders, BEFORE text).
 */
export function drawThemeForeground(
  ctx: CanvasRenderingContext2D,
  theme: ThemeId,
  w: number,
  h: number,
  pad: number, // outer padding size (to know where to draw edges without covering photos completely)
) {
  if (theme === 'film') {
    // Draw film roll sprocket holes along left and right edges
    ctx.fillStyle = '#0D0D0D';
    // hole width scales with padding, minimum 12px
    const holeWidth = Math.max(12, pad * 0.4);
    const holeHeight = holeWidth * 1.5;
    const spacing = holeHeight * 2;
    const marginX = pad * 0.2;
    
    for (let y = spacing; y < h; y += spacing) {
      // Left edge
      roundedRectPath(ctx, marginX, y, holeWidth, holeHeight, holeWidth * 0.2);
      ctx.fill();
      // Right edge
      roundedRectPath(ctx, w - marginX - holeWidth, y, holeWidth, holeHeight, holeWidth * 0.2);
      ctx.fill();
    }
  }
  else if (theme === 'y2k') {
    // Y2K style sparkles/stars in the corners
    ctx.save();
    ctx.fillStyle = '#FF6B8A'; // Kedip pink
    
    // Top Left Sparkle
    ctx.translate(pad * 1.2, pad * 1.2);
    drawSparkle(ctx, 0, 0, pad * 0.8, pad * 0.3);
    ctx.fill();

    // Bottom Right Sparkle
    ctx.resetTransform();
    ctx.translate(w - pad * 1.2, h - pad * 1.2);
    ctx.fillStyle = '#3ECFB2'; // Teal
    drawSparkle(ctx, 0, 0, pad * 0.9, pad * 0.35);
    ctx.fill();

    // Top Right small dots
    ctx.resetTransform();
    ctx.fillStyle = '#FFE566'; // Yellow
    ctx.beginPath();
    ctx.arc(w - pad, pad * 0.8, pad * 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(w - pad * 0.6, pad * 1.4, pad * 0.1, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
  else if (theme === 'floral' || theme === 'retro' || theme === 'starry') {
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Size is responsive to padding, but has a minimum so it's always visible
    const s = Math.max(28, pad * 1.2);
    ctx.font = `${s}px sans-serif`;

    // Ensure icons stay within canvas bounds even if padding is 0
    const marginX = Math.max(s / 2 + 6, pad);
    const marginY = Math.max(s / 2 + 6, pad);

    const icons = 
      theme === 'floral' ? ['🌸', '🌿', '🌼', '🌷'] :
      theme === 'retro' ? ['🛼', '🍒', '🕹️', '👾'] :
      ['🌙', '⭐', '🌠', '✨'];

    // Top Left
    ctx.fillText(icons[0], marginX, marginY);
    // Top Right
    ctx.fillText(icons[1], w - marginX, marginY);
    // Bottom Right
    ctx.fillText(icons[2], w - marginX, h - marginY);
    // Bottom Left
    ctx.fillText(icons[3], marginX, h - marginY);

    ctx.restore();
  }
}

// ─── Drawing Helpers ───

function drawHeart(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.beginPath();
  const topCurveHeight = size * 0.3;
  ctx.moveTo(x, y + topCurveHeight);
  // top left curve
  ctx.bezierCurveTo(x, y, x - size / 2, y, x - size / 2, y + topCurveHeight);
  // bottom left
  ctx.bezierCurveTo(x - size / 2, y + (size + topCurveHeight) / 2, x, y + (size + topCurveHeight) / 2, x, y + size);
  // bottom right
  ctx.bezierCurveTo(x, y + (size + topCurveHeight) / 2, x + size / 2, y + (size + topCurveHeight) / 2, x + size / 2, y + topCurveHeight);
  // top right curve
  ctx.bezierCurveTo(x + size / 2, y, x, y, x, y + topCurveHeight);
  ctx.closePath();
}

function drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number) {
  let rot = (Math.PI / 2) * 3;
  let x = cx;
  let y = cy;
  const step = Math.PI / spikes;

  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);
  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;

    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
}

function drawSparkle(ctx: CanvasRenderingContext2D, cx: number, cy: number, rOut: number, rIn: number) {
  ctx.beginPath();
  ctx.moveTo(cx, cy - rOut);
  ctx.quadraticCurveTo(cx + rIn, cy - rIn, cx + rOut, cy);
  ctx.quadraticCurveTo(cx + rIn, cy + rIn, cx, cy + rOut);
  ctx.quadraticCurveTo(cx - rIn, cy + rIn, cx - rOut, cy);
  ctx.quadraticCurveTo(cx - rIn, cy - rIn, cx, cy - rOut);
  ctx.closePath();
}

function roundedRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
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

function isColorDark(hex: string) {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
  if (h.length !== 6) return false;
  
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  
  // YIQ equation from http://24ways.org/2010/calculating-color-contrast
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return yiq < 128; // returns true if dark
}
