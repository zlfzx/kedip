import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';
import { FILTER_IDS, FILTER_LABELS, FILTERS } from '../../utils/filters';
import { useSessionStore } from '../../store/sessionStore';
import type { FilterId } from '../../types';

function FilterChip({
  filterId,
  isActive,
  videoEl,
  onClick,
}: {
  filterId: FilterId;
  isActive: boolean;
  videoEl: HTMLVideoElement | null;
  onClick: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!videoEl) return;
    let rafId: number;
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
      rafId = requestAnimationFrame(draw);
    };
    rafId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafId);
  }, [videoEl, filterId]);

  return (
    <button
      id={`filter-${filterId}`}
      onClick={onClick}
      className={cn(
        'w-16 h-16 rounded-xl relative overflow-hidden border-2 transition-all flex-shrink-0',
        isActive ? 'border-brand' : 'border-transparent',
      )}
    >
      <canvas
        ref={canvasRef}
        width={64}
        height={64}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ background: 'oklch(88% 0.008 90)' }}
      />
      <span
        className={cn(
          'absolute bottom-0 left-0 right-0 text-center py-1 font-body font-medium leading-none z-10',
          'text-[9px] text-white',
        )}
        style={{ background: 'linear-gradient(transparent, oklch(12% 0 0 / 0.55))' }}
      >
        {FILTER_LABELS[filterId]}
      </span>
    </button>
  );
}

export default function FilterPicker() {
  const { setFilter, setStep, session } = useSessionStore();
  const [selected, setSelected] = useState<FilterId>(session.filter);
  const [videoReady, setVideoReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current && mounted) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => { if (mounted) setVideoReady(true); };
        }
      } catch { /* camera preview unavailable */ }
    })();
    return () => {
      mounted = false;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return (
    <div className="min-h-screen bg-surface flex flex-col px-5 py-8">
      {/* Header */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div key={i} className={cn('h-1 rounded-full transition-all duration-300', i <= 1 ? 'w-6 bg-ink' : 'w-2 bg-border-light')} />
            ))}
          </div>
          <span className="font-body font-light text-xs text-ink-muted">Langkah 2 dari 3</span>
        </div>
        <h2 className="text-4xl text-ink" style={{ fontFamily: 'var(--font-display)' }}>
          Pilih filter
        </h2>
        <p className="font-body text-sm text-ink-muted mt-1">Preview langsung dari kamera kamu</p>
      </motion.div>

      {/* Live preview */}
      <motion.div
        className="flex justify-center mb-6"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        <div
          className="relative rounded-2xl overflow-hidden bg-surface-alt border border-border-light"
          style={{ width: 260, height: 195 }}
        >
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            style={{ filter: FILTERS[selected] || 'none', transform: 'scaleX(-1)' }}
          />
          {!videoReady && (
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                className="w-5 h-5 rounded-full border-2 border-ink/20 border-t-ink"
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
              />
            </div>
          )}
          {/* Filter label */}
          <span
            className="absolute bottom-2.5 left-1/2 -translate-x-1/2 font-body font-medium text-xs text-white px-3 py-1 rounded-full"
            style={{ background: 'oklch(12% 0 0 / 0.6)', backdropFilter: 'blur(6px)' }}
          >
            {FILTER_LABELS[selected]}
          </span>
        </div>
      </motion.div>

      {/* Filter chips */}
      <motion.div
        className="flex gap-2.5 overflow-x-auto pb-2 -mx-1 px-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {FILTER_IDS.map((filterId) => (
          <FilterChip
            key={filterId}
            filterId={filterId}
            isActive={selected === filterId}
            videoEl={videoReady ? videoRef.current : null}
            onClick={() => setSelected(filterId)}
          />
        ))}
      </motion.div>

      {/* Navigation */}
      <motion.div
        className="flex justify-between items-center mt-8 gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <button
          onClick={() => setStep('pick-layout')}
          className="bg-transparent text-ink font-body font-medium text-sm px-6 py-3 rounded-full border-2 border-ink transition-colors hover:bg-surface-alt"
        >
          Kembali
        </button>
        <button
          id="filter-next-btn"
          onClick={() => { setFilter(selected); setStep('camera'); }}
          className="bg-ink text-surface font-body font-medium text-sm px-8 py-3 rounded-full transition-colors hover:bg-ink/90 active:scale-95"
        >
          Lanjut →
        </button>
      </motion.div>
    </div>
  );
}
