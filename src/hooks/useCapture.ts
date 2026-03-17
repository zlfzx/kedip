import { useRef, useState, useCallback } from 'react';
import type { RefObject } from 'react';
import type { FilterId, TimerDuration } from '../types';
import { FILTERS } from '../utils/filters';

export function useCapture(videoRef: RefObject<HTMLVideoElement | null>) {
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isFlashing, setIsFlashing] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const captureFrame = useCallback(
    (filter: FilterId, mirrored = true): string => {
      const video = videoRef.current!;
      const canvas = document.createElement('canvas');
      const maxW = 1920;
      const w = Math.min(video.videoWidth, maxW);
      const ratio = w / video.videoWidth;
      canvas.width = w;
      canvas.height = video.videoHeight * ratio;
      const ctx = canvas.getContext('2d')!;
      if (mirrored) {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }
      if (FILTERS[filter]) ctx.filter = FILTERS[filter];
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      ctx.filter = 'none';
      return canvas.toDataURL('image/jpeg', 0.92);
    },
    [videoRef],
  );

  const startCapture = useCallback(
    (
      filter: FilterId,
      mirrored: boolean,
      timerDuration: TimerDuration,
      onCapture: (dataUrl: string) => void,
    ) => {
      if (isCapturing) return;
      setIsCapturing(true);

      // Instant capture (timer = 0)
      if (timerDuration === 0) {
        setIsFlashing(true);
        setTimeout(() => setIsFlashing(false), 350);
        const dataUrl = captureFrame(filter, mirrored);
        onCapture(dataUrl);
        setIsCapturing(false);
        return;
      }

      // Countdown capture
      setCountdown(timerDuration);
      let count = timerDuration;

      const tick = () => {
        count -= 1;
        if (count > 0) {
          setCountdown(count);
          timerRef.current = setTimeout(tick, 1000);
        } else {
          setCountdown(null);
          setIsFlashing(true);
          setTimeout(() => setIsFlashing(false), 350);
          const dataUrl = captureFrame(filter, mirrored);
          onCapture(dataUrl);
          setIsCapturing(false);
        }
      };

      timerRef.current = setTimeout(tick, 1000);
    },
    [isCapturing, captureFrame],
  );

  const cancelCapture = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setCountdown(null);
    setIsCapturing(false);
  }, []);

  return { countdown, isFlashing, isCapturing, startCapture, cancelCapture };
}
