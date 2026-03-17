import { useState, useCallback } from 'react';
import { compositePhotos } from '../utils/compositor';
import { useSessionStore } from '../store/sessionStore';
import { getLayout } from '../utils/layouts';
import type { FilterId, LayoutId } from '../types';

export function useCompositor() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setComposite = useSessionStore((s) => s.setComposite);

  const buildComposite = useCallback(
    async (photos: string[], layoutId: LayoutId, filter: FilterId) => {
      setIsLoading(true);
      setError(null);
      try {
        const layout = getLayout(layoutId);
        const dataUrl = await compositePhotos(photos, layout, filter);
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
