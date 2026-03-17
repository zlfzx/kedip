import { motion } from 'framer-motion';
import { Download, Share2, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { useSessionStore } from '../../store/sessionStore';
import { downloadComposite, shareComposite, canShare } from '../../utils/download';
import { cn } from '../../utils/cn';

export default function DownloadScreen() {
  const { session, resetSession } = useSessionStore();
  const [downloaded, setDownloaded] = useState(false);
  const [sharing, setSharing] = useState(false);

  const handleDownload = () => {
    if (!session.compositeImage) return;
    downloadComposite(session.compositeImage, `kedip-${Date.now()}.png`);
    setDownloaded(true);
  };

  const handleShare = async () => {
    if (!session.compositeImage) return;
    setSharing(true);
    await shareComposite(session.compositeImage);
    setSharing(false);
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col px-5 py-8">
      {/* Header */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        {/* Success toast */}
        <motion.div
          className="inline-flex items-center gap-2 bg-ink text-surface font-body font-medium text-sm rounded-full px-4 py-2 mb-5"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-teal flex-shrink-0" />
          Foto siap diunduh!
        </motion.div>

        <h2 className="text-4xl text-ink" style={{ fontFamily: 'var(--font-display)' }}>
          Selesai ✦
        </h2>
        <p className="font-body text-sm text-ink-muted mt-1">
          Bagikan atau simpan kenangan kamu
        </p>
      </motion.div>

      {/* Final composite */}
      <div className="flex flex-1 items-start justify-center">
        {session.compositeImage ? (
          <motion.div
            className="overflow-hidden border border-border-light shadow-sm"
            style={{ maxWidth: 320, width: '100%' }}
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <img
              src={session.compositeImage}
              alt="Hasil Photobooth"
              className="w-full h-auto"
            />
          </motion.div>
        ) : (
          <p className="font-body text-sm text-ink-muted">Gambar tidak tersedia</p>
        )}
      </div>

      {/* Actions */}
      <motion.div
        className="flex flex-col gap-2.5 mt-6 max-w-sm mx-auto w-full"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        {/* Pink download CTA */}
        <motion.button
          id="download-btn"
          onClick={handleDownload}
          className={cn(
            'flex items-center justify-center gap-2 font-body font-medium text-sm py-3.5 rounded-full transition-colors',
            downloaded
              ? 'bg-teal/10 text-ink border-2 border-teal/30'
              : 'bg-brand text-white hover:bg-brand-dark',
          )}
          whileTap={{ scale: 0.97 }}
        >
          <Download size={16} />
          {downloaded ? 'Terunduh! Unduh lagi?' : 'Unduh PNG'}
        </motion.button>

        {/* Share */}
        {canShare() && (
          <button
            id="share-btn"
            onClick={handleShare}
            disabled={sharing}
            className="flex items-center justify-center gap-2 font-body font-medium text-sm py-3.5 rounded-full bg-surface-alt border border-border-light text-ink hover:bg-border-light transition-colors"
          >
            <Share2 size={16} />
            {sharing ? 'Membagikan…' : 'Bagikan'}
          </button>
        )}

        {/* New session */}
        <button
          id="new-session-btn"
          onClick={resetSession}
          className="flex items-center justify-center gap-2 font-body font-light text-xs py-3 text-ink-muted hover:text-ink transition-colors"
        >
          <RefreshCw size={13} />
          Mulai sesi baru
        </button>
      </motion.div>
    </div>
  );
}
