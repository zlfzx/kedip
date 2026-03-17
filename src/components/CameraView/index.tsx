import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FlipHorizontal2, RotateCcw, AlertCircle, Upload } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useCamera } from '../../hooks/useCamera';
import { useCapture } from '../../hooks/useCapture';
import { FILTERS, FILTER_IDS, FILTER_LABELS } from '../../utils/filters';
import { LAYOUTS } from '../../utils/layouts';
import { useSessionStore } from '../../store/sessionStore';
import CountdownOverlay from '../CountdownOverlay';
import type { FilterId, TimerDuration } from '../../types';

const TIMER_OPTIONS: { value: TimerDuration; label: string }[] = [
  { value: 0,  label: 'Off' },
  { value: 3,  label: '3s' },
  { value: 5,  label: '5s' },
  { value: 10, label: '10s' },
];

// ─── Filter chip with live canvas preview ─────────────────────────────────────
function FilterChip({
  filterId, isActive, videoEl, onClick,
}: {
  filterId: FilterId; isActive: boolean; videoEl: HTMLVideoElement | null; onClick: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!videoEl) return;
    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.save();
      ctx.filter = FILTERS[filterId] || 'none';
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
      ctx.restore();
      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [videoEl, filterId]);

  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1 flex-shrink-0">
      <div className={cn('w-12 h-12 rounded-xl overflow-hidden border-2 transition-all', isActive ? 'border-brand' : 'border-white/15')}>
        <canvas ref={canvasRef} width={48} height={48} className="w-full h-full object-cover" style={{ background: 'oklch(15% 0 0)' }} />
      </div>
      <span className={cn('font-body text-[9px] font-medium', isActive ? 'text-white' : 'text-white/40')}>
        {FILTER_LABELS[filterId]}
      </span>
    </button>
  );
}

// ─── Main CameraView ──────────────────────────────────────────────────────────
export default function CameraView() {
  const { session, addPhoto, replacePhoto, resetPhotos, setFilter, setTimerDuration, setRetakeIndex, setStep, retakeIndex } =
    useSessionStore();
  const { videoRef, hasPermission, error, facingMode, startCamera, flipCamera } = useCamera();
  const { countdown, isFlashing, isCapturing, startCapture, cancelCapture } = useCapture(videoRef);
  const [videoReady, setVideoReady] = useState(false);

  const layout = LAYOUTS.find((l) => l.id === session.layout) ?? LAYOUTS[0];
  const photosNeeded = layout.photoCount;
  const photosTaken = session.photos.length;

  // retake mode: camera goes back to review after one capture
  const isRetakeMode = retakeIndex !== null;

  useEffect(() => {
    startCamera().then(() => {
      if (videoRef.current) {
        videoRef.current.onloadedmetadata = () => setVideoReady(true);
      }
    });
    return () => cancelCapture();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Normal mode: auto-advance when all slots filled
  useEffect(() => {
    if (!isRetakeMode && photosTaken >= photosNeeded) {
      setTimeout(() => setStep('review'), 500);
    }
  }, [photosTaken, photosNeeded, setStep, isRetakeMode]);

  const handleCapture = () => {
    if (isCapturing) return;
    if (isRetakeMode) {
      // Replace only the one slot, then return to review
      startCapture(session.filter, facingMode === 'user', session.timerDuration, (dataUrl) => {
        replacePhoto(retakeIndex!, dataUrl);
        setRetakeIndex(null);
        setTimeout(() => setStep('review'), 400);
      });
    } else {
      if (photosTaken >= photosNeeded) return;
      startCapture(session.filter, facingMode === 'user', session.timerDuration, addPhoto);
    }
  };

  const handleBack = () => {
    cancelCapture();
    if (isRetakeMode) {
      setRetakeIndex(null);
      setStep('review');
    } else {
      resetPhotos();
      setStep('pick-layout');
    }
  };

  const readFileAsDataUrl = (file: File): Promise<string> =>
    new Promise((res) => {
      const reader = new FileReader();
      reader.onload = (e) => res(e.target?.result as string);
      reader.readAsDataURL(file);
    });

  const applyFilterToUpload = (dataUrl: string, filterId: FilterId): Promise<string> => {
    if (filterId === 'none') return Promise.resolve(dataUrl);
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d')!;
        ctx.filter = FILTERS[filterId] || 'none';
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/jpeg', 0.92));
      };
      img.src = dataUrl;
    });
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const rawDataUrl = await readFileAsDataUrl(file);
    const dataUrl = await applyFilterToUpload(rawDataUrl, session.filter);
    if (isRetakeMode) {
      replacePhoto(retakeIndex!, dataUrl);
      setRetakeIndex(null);
      setStep('review');
    } else if (photosTaken < photosNeeded) {
      addPhoto(dataUrl);
    }
    e.target.value = '';
  };

  const handleReplaceUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const rawDataUrl = await readFileAsDataUrl(file);
    const dataUrl = await applyFilterToUpload(rawDataUrl, session.filter);
    replacePhoto(index, dataUrl);
    e.target.value = '';
  };

  const allFilled = !isRetakeMode && photosTaken >= photosNeeded;
  const captureDisabled = isCapturing || allFilled;

  return (
    <div className="h-dvh flex flex-col overflow-hidden" style={{ background: 'oklch(10% 0.01 270)' }}>
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2 flex-shrink-0">
        <button onClick={handleBack} className="font-body font-medium text-sm px-4 py-2 rounded-full border border-white/15 text-white/60 hover:text-white transition-colors">
          ← {isRetakeMode ? 'Batal' : 'Kembali'}
        </button>

        {/* Progress or retake indicator */}
        {isRetakeMode ? (
          <div className="flex items-center gap-2">
            <span className="font-body font-medium text-xs text-brand px-3 py-1 rounded-full bg-brand/15">
              Mengambil ulang foto {retakeIndex! + 1}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            {Array.from({ length: photosNeeded }).map((_, i) => (
              <div key={i} className={cn('h-2 rounded-full transition-all duration-300',
                i < photosTaken  ? 'w-2 bg-white' :
                i === photosTaken ? 'w-6 bg-brand' :
                                   'w-2 bg-white/20',
              )} />
            ))}
            <span className="ml-1.5 font-body font-light text-[11px] text-white/40">{photosTaken}/{photosNeeded}</span>
          </div>
        )}

        <button onClick={flipCamera} className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
          <FlipHorizontal2 size={16} className="text-white/80" />
        </button>
      </div>

      {/* ── Camera viewport ── */}
      <div className="relative mx-4 rounded-2xl overflow-hidden bg-white/5 flex-1 min-h-0">
        {(hasPermission === false || error) ? (
          <div className="absolute inset-0 bg-surface flex flex-col items-center justify-center p-6 text-center">
            <AlertCircle size={36} className="text-brand mb-3" strokeWidth={1.5} />
            <p className="font-body font-medium text-sm text-ink mb-1">Kamera tidak bisa diakses</p>
            <p className="font-body text-xs text-ink-muted mb-4">{error}</p>
            <button onClick={() => startCamera()} className="font-body font-medium text-sm px-4 py-2.5 rounded-full bg-ink text-surface">Coba lagi</button>
          </div>
        ) : (
          <video ref={videoRef} autoPlay playsInline muted
            className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: FILTERS[session.filter] || 'none', transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
          />
        )}
        <CountdownOverlay countdown={countdown} isFlashing={isFlashing} />
      </div>

      {/* ── Bottom controls ── */}
      <div className="flex flex-col gap-3 px-4 pt-3 pb-4 flex-shrink-0">
        {/* Timer + filter (hidden in retake mode to keep it focused) */}
        {!isRetakeMode && (
          <>
            {/* Timer selector */}
            <div className="flex items-center gap-2">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/35 flex-shrink-0">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              <div className="flex gap-1.5">
                {TIMER_OPTIONS.map(({ value, label }) => (
                  <button key={value} onClick={() => setTimerDuration(value)}
                    className={cn('font-body font-medium text-xs px-3 py-1 rounded-full transition-all',
                      session.timerDuration === value ? 'bg-white text-ink' : 'bg-white/10 text-white/45 hover:bg-white/18 hover:text-white',
                    )}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter strip */}
            <div className="flex gap-3 overflow-x-auto pb-1">
              {FILTER_IDS.map((filterId) => (
                <FilterChip key={filterId} filterId={filterId} isActive={session.filter === filterId}
                  videoEl={videoReady ? videoRef.current : null} onClick={() => setFilter(filterId)} />
              ))}
            </div>
          </>
        )}

        {/* Thumbnail strip (only in normal mode) */}
        <AnimatePresence>
          {!isRetakeMode && photosTaken > 0 && (
            <motion.div className="flex gap-2 overflow-x-auto"
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}>
              {session.photos.map((p, i) => (
                <div key={i} className="relative flex-shrink-0 group">
                  <img src={p} className="h-14 w-auto rounded-lg object-cover border border-white/15" />
                  <label htmlFor={`replace-${i}`}
                    className="absolute inset-0 rounded-lg bg-ink/0 group-hover:bg-ink/50 transition-colors flex items-center justify-center cursor-pointer">
                    <Upload size={14} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </label>
                  <input id={`replace-${i}`} type="file" accept="image/*" className="hidden"
                    onChange={(e) => handleReplaceUpload(i, e)} />
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Capture row */}
        <div className="flex items-center justify-between mt-1">
          {!isRetakeMode && photosTaken > 0 ? (
            <button onClick={() => resetPhotos()} className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
              <RotateCcw size={17} className="text-white/70" />
            </button>
          ) : (
            <div className="w-11" />
          )}

          {/* Analog shutter */}
          <motion.button id="capture-btn" onClick={handleCapture} disabled={captureDisabled}
            className={cn('w-[68px] h-[68px] rounded-full bg-white border-[3px] border-white flex items-center justify-center shadow-md',
              captureDisabled && 'opacity-30 cursor-not-allowed',
            )}
            whileTap={captureDisabled ? {} : { scale: 0.9 }}>
            <div className={cn('w-[50px] h-[50px] rounded-full bg-ink transition-transform duration-100', isCapturing && 'scale-90')} />
          </motion.button>

          {/* Upload */}
          <label htmlFor="upload-slot"
            className={cn('w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer',
              allFilled && 'opacity-30 pointer-events-none',
            )} title="Upload dari galeri">
            <Upload size={17} className="text-white/70" />
          </label>
          <input id="upload-slot" type="file" accept="image/*" className="hidden"
            disabled={allFilled} onChange={handleUpload} />
        </div>
      </div>
    </div>
  );
}
