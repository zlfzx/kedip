import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Download } from 'lucide-react';
import { useSessionStore } from '../../store/sessionStore';
import { useCompositor } from '../../hooks/useCompositor';
import { LAYOUTS } from '../../utils/layouts';

export default function PhotoStrip() {
  const { session, setStep, resetPhotos } = useSessionStore();
  const { isLoading, error, buildComposite } = useCompositor();

  const layout = LAYOUTS.find((l) => l.id === session.layout) ?? LAYOUTS[0];

  useEffect(() => {
    if (session.photos.length === layout.photoCount && !session.compositeImage) {
      buildComposite(session.photos, session.layout, session.filter);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRetakeAll = () => {
    resetPhotos();
    setStep('camera');
  };

  const aspectW = layout.canvasWidth;
  const aspectH = layout.canvasHeight;

  return (
    <div className="min-h-screen bg-surface flex flex-col px-5 py-8">
      {/* Header */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <h2 className="text-4xl text-ink" style={{ fontFamily: 'var(--font-display)' }}>
          Hasil foto
        </h2>
        <p className="font-body text-sm text-ink-muted mt-1">
          Cek hasilnya sebelum diunduh
        </p>
      </motion.div>

      {/* Composite preview */}
      <div className="flex flex-1 items-start justify-center">
        <motion.div
          className="relative rounded-2xl overflow-hidden bg-surface-alt border border-border-light shadow-sm"
          style={{
            width: '100%',
            maxWidth: Math.min(aspectW, 320),
            aspectRatio: `${aspectW}/${aspectH}`,
          }}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <motion.div
                className="w-8 h-8 rounded-full border-2 border-ink/10 border-t-ink"
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
              />
              <p className="font-body text-xs text-ink-muted">Menyusun foto…</p>
            </div>
          )}
          {error && !isLoading && (
            <div className="absolute inset-0 flex items-center justify-center p-4 text-center">
              <p className="font-body text-xs text-brand-dark">{error}</p>
            </div>
          )}
          {session.compositeImage && !isLoading && (
            <img
              src={session.compositeImage}
              alt="Hasil photobooth"
              className="w-full h-full object-contain"
            />
          )}
        </motion.div>
      </div>

      {/* Individual thumbnails */}
      {session.photos.length > 1 && (
        <div className="flex gap-2 mt-4 overflow-x-auto justify-center">
          {session.photos.map((photo, i) => (
            <button
              key={i}
              onClick={handleRetakeAll}
              className="relative flex-shrink-0 group"
            >
              <img
                src={photo}
                className="h-14 w-auto rounded-lg object-cover border border-border-light"
              />
              <div className="absolute inset-0 rounded-lg bg-ink/0 group-hover:bg-ink/20 transition-colors flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 font-body text-[9px] font-medium text-white">ulang</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 mt-6">
        <button
          onClick={handleRetakeAll}
          className="flex-1 flex items-center justify-center gap-2 bg-transparent text-ink font-body font-medium text-sm py-3 rounded-full border-2 border-ink transition-colors hover:bg-surface-alt"
        >
          <RotateCcw size={14} />
          Ulangi
        </button>

        <motion.button
          id="download-proceed-btn"
          onClick={() => setStep('download')}
          disabled={isLoading || !session.compositeImage}
          className="flex-[2] flex items-center justify-center gap-2 bg-ink text-surface font-body font-medium text-sm py-3 rounded-full transition-colors hover:bg-ink/90 disabled:opacity-40"
          whileTap={{ scale: 0.97 }}
        >
          <Download size={14} />
          Unduh foto
        </motion.button>
      </div>
    </div>
  );
}
