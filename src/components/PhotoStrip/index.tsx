import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Download, Camera, Pencil } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useSessionStore } from '../../store/sessionStore';
import { useCompositor } from '../../hooks/useCompositor';
import { LAYOUTS } from '../../utils/layouts';

export default function PhotoStrip() {
  const { session, setStep, resetPhotos, setRetakeIndex } = useSessionStore();
  const { isLoading, error, buildComposite } = useCompositor();

  const layout = LAYOUTS.find((l) => l.id === session.layout) ?? LAYOUTS[0];

  useEffect(() => {
    if (session.photos.length === layout.photoCount && !session.compositeImage) {
      buildComposite(session.photos, session.layout, session.textOverlays, session.frameSettings);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Go back to camera to retake a specific slot
  const handleRetakeOne = (index: number) => {
    setRetakeIndex(index);
    setStep('camera');
  };

  const aspectW = layout.canvasWidth;
  const aspectH = layout.canvasHeight;

  return (
    <div className="min-h-screen bg-surface flex flex-col px-5 py-8">
      {/* Header */}
      <motion.div className="mb-5" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
        <h2 className="text-4xl text-ink" style={{ fontFamily: 'var(--font-display)' }}>
          Hasil foto
        </h2>
        <p className="font-body text-sm text-ink-muted mt-1">
          Tap foto untuk mengambil ulang satu per satu
        </p>
      </motion.div>

      {/* Composite preview */}
      <div className="flex flex-1 items-start justify-center">
        <motion.div
          className="relative overflow-hidden bg-surface-alt border border-border-light shadow-sm"
          style={{ width: '100%', maxWidth: Math.min(aspectW, 320), aspectRatio: `${aspectW}/${aspectH}` }}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <motion.div className="w-8 h-8 rounded-full border-2 border-ink/10 border-t-ink"
                animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} />
              <p className="font-body text-xs text-ink-muted">Menyusun foto…</p>
            </div>
          )}
          {error && !isLoading && (
            <div className="absolute inset-0 flex items-center justify-center p-4 text-center">
              <p className="font-body text-xs text-brand-dark">{error}</p>
            </div>
          )}
          {session.compositeImage && !isLoading && (
            <img src={session.compositeImage} alt="Hasil photobooth" className="w-full h-full object-contain" />
          )}
        </motion.div>
      </div>

      {/* Individual thumbnails — tap to retake one */}
      {session.photos.length > 0 && (
        <div className="mt-4">
          <p className="font-body text-[11px] text-ink-muted mb-2 font-medium">
            Tap foto untuk mengambil ulang:
          </p>
          <div className="flex gap-2 overflow-x-auto">
            {session.photos.map((photo, i) => (
              <motion.button
                key={i}
                onClick={() => handleRetakeOne(i)}
                className="relative flex-shrink-0 group rounded-lg overflow-hidden"
                whileTap={{ scale: 0.95 }}
                title={`Ambil ulang foto ${i + 1}`}
              >
                <img src={photo} className="h-16 w-auto object-cover border border-border-light rounded-lg" />
                {/* Hover overlay — retake icon */}
                <div className="absolute inset-0 rounded-lg bg-ink/0 group-hover:bg-ink/50 transition-colors flex flex-col items-center justify-center gap-1">
                  <Camera size={14} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="font-body text-[9px] font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    Ulang
                  </span>
                </div>
                {/* Photo number badge */}
                <span className="absolute top-1 left-1 w-4 h-4 rounded-full bg-ink/60 flex items-center justify-center">
                  <span className="font-body text-[8px] font-medium text-white">{i + 1}</span>
                </span>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2.5 mt-5">
        {/* Reset all */}
        <button
          onClick={() => { resetPhotos(); setStep('camera'); }}
          className={cn(
            'flex items-center justify-center gap-1.5',
            'bg-transparent text-ink font-body font-medium text-sm py-3 px-4 rounded-full border-2 border-ink',
            'transition-colors hover:bg-surface-alt',
          )}
        >
          <RotateCcw size={14} />
          Ulangi semua
        </button>

        {/* Edit frame */}
        <button
          onClick={() => setStep('edit-frame')}
          disabled={isLoading || !session.compositeImage}
          className={cn(
            'flex-1 flex items-center justify-center gap-1.5',
            'bg-surface-alt text-ink font-body font-medium text-sm py-3 rounded-full border border-border-light',
            'transition-colors hover:bg-border-light disabled:opacity-40',
          )}
        >
          <Pencil size={14} />
          Edit bingkai
        </button>

        {/* Proceed to download */}
        <motion.button
          id="download-proceed-btn"
          onClick={() => setStep('download')}
          disabled={isLoading || !session.compositeImage}
          className="flex-1 flex items-center justify-center gap-1.5 bg-ink text-surface font-body font-medium text-sm py-3 rounded-full transition-colors hover:bg-ink/90 disabled:opacity-40"
          whileTap={{ scale: 0.97 }}
        >
          <Download size={14} />
          Unduh
        </motion.button>
      </div>
    </div>
  );
}
