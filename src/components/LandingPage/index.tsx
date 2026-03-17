import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, AlertCircle, Shield, ArrowRight } from 'lucide-react';
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
    <div className="h-dvh bg-surface flex flex-col relative overflow-hidden selection:bg-brand-light/40">
      {/* Decorative grain overlay */}
      <div className="pointer-events-none fixed inset-0 opacity-[0.03] z-[1]"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`, backgroundRepeat: 'repeat', backgroundSize: '128px' }} />

      {/* Soft bg accents */}
      <div className="pointer-events-none absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-40 mix-blend-multiply"
        style={{ background: 'radial-gradient(circle, oklch(90% 0.08 355), transparent 70%)' }} />
      <div className="pointer-events-none absolute bottom-0 -left-24 w-72 h-72 rounded-full opacity-30 mix-blend-multiply"
        style={{ background: 'radial-gradient(circle, oklch(92% 0.18 95), transparent 70%)' }} />

      <div className="flex-1 flex flex-col items-center justify-center relative z-10 px-5 text-center">
        <motion.div className="flex flex-col items-center max-w-md w-full"
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.32, 0, 0.67, 0] }}>
          
          <motion.div className="mb-6 w-14 h-14 rounded-2xl bg-white border border-border-light shadow-sm flex items-center justify-center transform rotate-3"
            initial={{ scale: 0.8, opacity: 0, rotate: -10 }} animate={{ scale: 1, opacity: 1, rotate: 3 }} transition={{ delay: 0.15, duration: 0.4, type: 'spring' }}>
            <Camera size={24} className="text-ink" strokeWidth={1.5} />
          </motion.div>

          <h1 className="text-5xl md:text-6xl text-ink mb-1 tracking-tight leading-none" style={{ fontFamily: 'var(--font-display)' }}>
            Kedip
          </h1>
          <p className="text-xl md:text-2xl text-brand mb-6 leading-none transform -rotate-2 origin-left" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>
            digital photobooth
          </p>

          <p className="font-body text-sm md:text-base text-ink-muted leading-relaxed mb-6">
            Abadikan momen seru langsung di browser.<br />
            Tanpa daftar, tanpa server, 100% rahasia privasi terjaga.
          </p>

          {/* Inline compact features */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <span className="font-body text-[11px] text-ink-muted px-3 py-1.5 rounded-full bg-surface-alt border border-border-light flex items-center gap-1.5">
              <Shield size={12} className="text-brand" /> 100% diproses lokal
            </span>
            <span className="font-body text-[11px] text-ink-muted px-3 py-1.5 rounded-full bg-surface-alt border border-border-light">
              4 layout foto
            </span>
            <span className="font-body text-[11px] text-ink-muted px-3 py-1.5 rounded-full bg-surface-alt border border-border-light">
              8 filter kamera
            </span>
            <span className="font-body text-[11px] text-ink-muted px-3 py-1.5 rounded-full bg-surface-alt border border-border-light">
              Edit bingkai
            </span>
          </div>

          {/* CTA */}
          <div className="flex flex-col items-center w-full max-w-xs mb-4">
            <motion.button id="start-btn" onClick={handleStart} disabled={checking}
              className={cn(
                'group relative w-full bg-ink text-surface font-body font-medium text-sm px-6 py-3.5 rounded-full overflow-hidden shadow-lg',
                'transition-all hover:bg-ink-muted hover:shadow-xl active:scale-[0.98]',
                checking && 'opacity-60 cursor-not-allowed',
              )}>
              <div className="flex items-center justify-center gap-2">
                {checking ? (
                  <>
                    <motion.span className="inline-block w-3.5 h-3.5 border-2 border-surface/30 border-t-surface rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} />
                    <span>Mempersiapkan…</span>
                  </>
                ) : (
                  <>
                    <span>Mulai sesi foto</span>
                    <ArrowRight size={16} className="text-surface/70 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </div>
            </motion.button>
          </div>

          {/* Error */}
          <AnimatePresence>
            {permissionError && (
              <motion.div className="w-full max-w-xs rounded-2xl p-3 border border-brand-light bg-brand-light/30 text-left"
                initial={{ opacity: 0, height: 0, marginTop: 0 }} animate={{ opacity: 1, height: 'auto', marginTop: 12 }} exit={{ opacity: 0, height: 0, marginTop: 0 }} transition={{ duration: 0.2 }}>
                <div className="flex gap-2 items-start">
                  <AlertCircle size={14} className="text-brand-dark mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-body font-medium text-[11px] text-ink mb-0.5">Akses ditolak</p>
                    <p className="font-body text-[10px] text-ink-muted leading-tight">{permissionError}</p>
                    <button onClick={handleStart} className="mt-1.5 font-body font-medium text-[10px] text-brand-dark underline underline-offset-2">
                      Coba lagi
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </motion.div>
      </div>

      <footer className="relative z-10 py-5 text-center px-4 flex-shrink-0">
        <p className="font-body text-[10px] text-ink-muted/50">
          Dibuat dengan ❤️ • Foto diproses lokal di perambanmu.
        </p>
      </footer>
    </div>
  );
}
