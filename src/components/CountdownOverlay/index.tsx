import { motion, AnimatePresence } from 'framer-motion';

interface CountdownOverlayProps {
  countdown: number | null;
  isFlashing: boolean;
}

export default function CountdownOverlay({ countdown, isFlashing }: CountdownOverlayProps) {
  return (
    <>
      {/* White flash on capture */}
      <AnimatePresence>
        {isFlashing && (
          <motion.div
            className="fixed inset-0 z-50 pointer-events-none bg-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.9, 0] }}
            transition={{ duration: 0.3, times: [0, 0.1, 1] }}
          />
        )}
      </AnimatePresence>

      {/* Countdown digit */}
      <AnimatePresence mode="wait">
        {countdown !== null && (
          <motion.div
            key="overlay"
            className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none"
            style={{ background: 'oklch(12% 0 0 / 0.45)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <motion.span
              key={countdown}
              className="text-white font-body select-none"
              style={{ fontSize: 'clamp(96px, 28vw, 180px)', fontWeight: 300, lineHeight: 1 }}
              initial={{ scale: 1.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {countdown}
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
