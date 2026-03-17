import { saveAs } from 'file-saver';

export function downloadComposite(dataUrl: string, filename = 'snapbooth.png') {
  try {
    saveAs(dataUrl, filename);
  } catch {
    // Fallback
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    link.click();
  }
}

export async function shareComposite(dataUrl: string) {
  try {
    const blob = await (await fetch(dataUrl)).blob();
    const file = new File([blob], 'snapbooth.png', { type: 'image/png' });
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: 'Foto Photobooth — SnapBooth' });
    }
  } catch (err) {
    console.error('Share failed:', err);
  }
}

export function canShare(): boolean {
  return typeof navigator.share === 'function';
}
