import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, AlertCircle } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useSessionStore } from '../../store/sessionStore';

export default function LandingPage() {
  const setStep = useSessionStore((s) => s.setStep);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  const handleStart = async () => {
    setChecking(true);
    setPermissionError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      stream.getTracks().forEach((t) => t.stop());
      setStep('pick-layout');
    } catch (err) {
      const e = err as DOMException;
      if (e.name === 'NotFoundError' || e.name === 'DevicesNotFoundError') {
        setPermissionError('Tidak ada kamera yang terdeteksi di perangkat ini.');
      } else {
        setPermissionError('Izinkan akses kamera di pengaturan browser, lalu coba lagi.');
      }
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-5 py-12 relative overflow-hidden">
      {/* Decorative grain overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '128px',
        }}
      />

      {/* Soft bg accent — top right */}
      <div
        className="pointer-events-none absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-40"
        style={{ background: 'radial-gradient(circle, oklch(90% 0.08 355), transparent 70%)' }}
      />
      {/* Soft bg accent — bottom left */}
      <div
        className="pointer-events-none absolute -bottom-24 -left-24 w-72 h-72 rounded-full opacity-30"
        style={{ background: 'radial-gradient(circle, oklch(92% 0.18 95), transparent 70%)' }}
      />

      <motion.div
        className="relative z-10 flex flex-col items-center text-center max-w-sm w-full"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.32, 0, 0.67, 0] }}
      >
        {/* Icon badge */}
        <motion.div
          className="mb-8 w-16 h-16 rounded-2xl bg-surface-alt border border-border-light flex items-center justify-center"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          <Camera size={28} className="text-ink" strokeWidth={1.5} />
        </motion.div>

        {/* App name */}
        <h1
          className="text-6xl text-ink mb-1 tracking-tight leading-none"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Kedip
        </h1>
        <p
          className="text-xl text-brand mb-8 leading-none"
          style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}
        >
          photobooth
        </p>

        <p className="font-body text-sm text-ink-muted mb-10 leading-relaxed">
          Buat kenangan bareng. Pilih layout, pilih filter,<br />
          foto langsung — unduh seketika.
        </p>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {['4 layout', '8 filter', 'unduh PNG', 'tanpa upload'].map((feat) => (
            <span
              key={feat}
              className="font-body text-xs text-ink-muted px-3 py-1 rounded-full bg-surface-alt border border-border-light"
            >
              {feat}
            </span>
          ))}
        </div>

        {/* CTA */}
        <motion.button
          id="start-btn"
          onClick={handleStart}
          disabled={checking}
          className={cn(
            'w-full max-w-xs bg-ink text-surface font-body font-medium text-sm px-6 py-3.5 rounded-full',
            'transition-colors hover:bg-ink/90 active:scale-95',
            checking && 'opacity-60 cursor-not-allowed',
          )}
          whileTap={checking ? {} : { scale: 0.97 }}
        >
          {checking ? (
            <span className="flex items-center justify-center gap-2">
              <motion.span
                className="inline-block w-4 h-4 border-2 border-surface/30 border-t-surface rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
              />
              Memeriksa kamera…
            </span>
          ) : (
            'Mulai sesi'
          )}
        </motion.button>

        {/* Error */}
        <AnimatePresence>
          {permissionError && (
            <motion.div
              className="mt-5 w-full max-w-xs rounded-2xl p-4 border border-brand-light bg-brand-light/30 text-left"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex gap-3 items-start">
                <AlertCircle size={16} className="text-brand-dark mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-body font-medium text-sm text-ink mb-0.5">Kamera tidak bisa diakses</p>
                  <p className="font-body text-xs text-ink-muted">{permissionError}</p>
                </div>
              </div>
              <button
                onClick={handleStart}
                className="mt-3 font-body font-medium text-xs text-brand-dark underline underline-offset-2"
              >
                Coba lagi
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="mt-8 font-body font-light text-xs text-ink-muted/60">
          Foto diproses langsung di browser · tidak ada server
        </p>
      </motion.div>
    </div>
  );
}
