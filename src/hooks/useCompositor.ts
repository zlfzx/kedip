import { useState, useCallback } from 'react';
import { compositePhotos } from '../utils/compositor';
import { useSessionStore } from '../store/sessionStore';
import { getLayout } from '../utils/layouts';
import type { LayoutId, TextOverlay, FrameSettings } from '../types';

export function useCompositor() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setComposite = useSessionStore((s) => s.setComposite);

  const buildComposite = useCallback(
    async (
      photos: string[],
      layoutId: LayoutId,
      textOverlays: TextOverlay[] = [],
      frameSettings?: FrameSettings,
    ) => {
      setIsLoading(true);
      setError(null);
      try {
        const layout = getLayout(layoutId);
        const dataUrl = await compositePhotos(photos, layout, textOverlays, frameSettings);
        setComposite(dataUrl);
        return dataUrl;
      } catch (err) {
        console.error('Composite failed:', err);
        setError('Gagal membuat gambar. Silakan coba lagi.');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [setComposite],
  );

  return { isLoading, error, buildComposite };
}
