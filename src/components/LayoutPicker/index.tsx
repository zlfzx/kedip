import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '../../utils/cn';
import { LAYOUTS } from '../../utils/layouts';
import { useSessionStore } from '../../store/sessionStore';
import type { LayoutId } from '../../types';

function LayoutThumbnail({
  slots,
  canvasW,
  canvasH,
}: {
  slots: { x: number; y: number; width: number; height: number }[];
  canvasW: number;
  canvasH: number;
}) {
  const vw = 100;
  const vh = (canvasH / canvasW) * 100;
  return (
    <svg viewBox={`0 0 ${vw} ${vh}`} className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <rect width={vw} height={vh} fill="oklch(88% 0.008 90)" />
      {slots.map((s, i) => (
        <rect
          key={i}
          x={(s.x / canvasW) * vw}
          y={(s.y / canvasH) * vh}
          width={(s.width / canvasW) * vw}
          height={(s.height / canvasH) * vh}
          fill="oklch(78% 0.008 90)"
        />
      ))}
    </svg>
  );
}

export default function LayoutPicker() {
  const { setLayout, setStep, session } = useSessionStore();
  const [selected, setSelected] = useState<LayoutId>(session.layout);

  const handleNext = () => {
    setLayout(selected);
    setStep('camera'); // skip pick-filter — filter is now in CameraView
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col px-5 py-8">
      {/* Step indicator — only 2 steps now visible before camera */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={cn(
                  'h-1 rounded-full transition-all duration-300',
                  i === 0 ? 'w-6 bg-ink' : 'w-2 bg-border-light',
                )}
              />
            ))}
          </div>
          <span className="font-body font-light text-xs text-ink-muted">Langkah 1 dari 2</span>
        </div>
        <h2 className="text-4xl text-ink leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
          Pilih layout
        </h2>
        <p className="font-body text-sm text-ink-muted mt-1">
          Tentukan susunan foto yang ingin kamu buat
        </p>
      </motion.div>

      {/* Layout grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 flex-1">
        {LAYOUTS.map((layout, i) => {
          const isSelected = selected === layout.id;
          return (
            <motion.button
              key={layout.id}
              id={`layout-${layout.id}`}
              onClick={() => setSelected(layout.id)}
              className={cn(
                'bg-surface-alt rounded-2xl p-4 cursor-pointer transition-all text-left',
                isSelected && 'ring-2 ring-brand ring-offset-2 ring-offset-surface',
              )}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.25 }}
              whileTap={{ scale: 0.97 }}
            >
              <div
                className="bg-border-light rounded-xl overflow-hidden mb-3"
                style={{
                  aspectRatio: `${layout.canvasWidth}/${Math.min(layout.canvasHeight, layout.canvasWidth * 1.4)}`,
                }}
              >
                <LayoutThumbnail slots={layout.slots} canvasW={layout.canvasWidth} canvasH={layout.canvasHeight} />
              </div>
              <div className="flex items-start justify-between gap-1">
                <div>
                  <p className="font-body font-medium text-sm text-ink">{layout.label}</p>
                  <p className="font-body text-xs text-ink-muted mt-0.5">{layout.photoCount} foto</p>
                </div>
                {isSelected && (
                  <span className="w-5 h-5 rounded-full bg-brand flex-shrink-0 flex items-center justify-center mt-0.5">
                    <Check size={10} className="text-white" strokeWidth={3} />
                  </span>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Navigation */}
      <motion.div
        className="flex justify-between items-center mt-8 gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <button
          onClick={() => setStep('landing')}
          className="bg-transparent text-ink font-body font-medium text-sm px-6 py-3 rounded-full border-2 border-ink transition-colors hover:bg-surface-alt"
        >
          Kembali
        </button>
        <button
          id="layout-next-btn"
          onClick={handleNext}
          className="bg-ink text-surface font-body font-medium text-sm px-8 py-3 rounded-full transition-colors hover:bg-ink/90 active:scale-95"
        >
          Mulai foto →
        </button>
      </motion.div>
    </div>
  );
}
