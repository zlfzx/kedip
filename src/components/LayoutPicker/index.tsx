import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '../../utils/cn';
import { LAYOUTS } from '../../utils/layouts';
import { THEMES, getThemeIcon } from '../../utils/themes';
import { drawComposite, applyFrameToSlot } from '../../utils/compositor';
import { useSessionStore } from '../../store/sessionStore';
import type { LayoutId, ThemeId } from '../../types';

function LayoutThumbnail({
  slots,
  canvasW,
  canvasH,
  theme,
}: {
  slots: { x: number; y: number; width: number; height: number }[];
  canvasW: number;
  canvasH: number;
  theme: ThemeId;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Use a fixed thumb size (CSS will handle actual display width via w-full)
    const thumbW = 400;
    const thumbH = (canvasH / canvasW) * thumbW;
    canvas.width = thumbW;
    canvas.height = thumbH;

    // Scale context so we can draw using original canvasW/H coordinates
    const scale = thumbW / canvasW;
    ctx.scale(scale, scale);

    // Reconstruct the real layout so drawComposite uses true coordinates
    const realLayout = {
      id: 'thumb-preview',
      label: '',
      photoCount: slots.length,
      canvasWidth: canvasW,
      canvasHeight: canvasH,
      slots: slots, // use exact slots
    };

    // Frame settings - use real unscaled padding values
    const basePadding = 20;
    const baseGap = 8;
    
    const frame = {
      backgroundColor: '#FAFAF7', // slightly off-white to contrast
      theme,
      padding: basePadding,
      gap: baseGap,
      borderWidth: 0,
      borderColor: '#0D0D0D',
      borderRadius: 0,
    };

    // 1. Draw Background and Theme using actual sizes
    ctx.clearRect(0, 0, canvasW, canvasH);
    drawComposite(ctx, [], realLayout as any, [], frame);

    // 2. Draw grey rectangles for the slots since there are no images
    slots.forEach(rawSlot => {
      // Use the exact same math as the real compositor to handle scaling & padding
      const slot = applyFrameToSlot(rawSlot, frame, canvasW, canvasH);
      
      ctx.fillStyle = 'rgba(13, 13, 13, 0.1)'; // 'oklch(78% 0.008 90)' equivalent
      ctx.fillRect(slot.x, slot.y, slot.width, slot.height);
    });

    // reset transform for next render
    ctx.setTransform(1, 0, 0, 1, 0, 0);

  }, [slots, canvasW, canvasH, theme]);

  return (
    <canvas ref={canvasRef} className="w-full h-full object-contain bg-surface" />
  );
}

export default function LayoutPicker() {
  const { setLayout, setFrameSettings, setStep, session } = useSessionStore();
  const [selectedLayout, setSelectedLayout] = useState<LayoutId>(session.layout);
  const [selectedTheme, setSelectedTheme] = useState<ThemeId>(session.frameSettings.theme);

  const handleNext = () => {
    setLayout(selectedLayout);
    setFrameSettings({ ...session.frameSettings, theme: selectedTheme });
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {LAYOUTS.map((layout, i) => {
          const isSelected = selectedLayout === layout.id;
          return (
            <motion.button
              key={layout.id}
              id={`layout-${layout.id}`}
              onClick={() => setSelectedLayout(layout.id)}
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
                className="bg-border-light overflow-hidden mb-3"
                style={{
                  aspectRatio: `${layout.canvasWidth}/${Math.min(layout.canvasHeight, layout.canvasWidth * 1.4)}`,
                }}
              >
                <LayoutThumbnail slots={layout.slots} canvasW={layout.canvasWidth} canvasH={layout.canvasHeight} theme={selectedTheme} />
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

      {/* Theme selection */}
      <motion.div
        className="mt-8 flex-1"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.25 }}
      >
        <h3 className="font-body font-medium text-lg text-ink mb-1">Pilih tema dekorasi</h3>
        <p className="font-body text-xs text-ink-muted mb-4">Kamu masih bisa menggantinya lagi nanti</p>
        <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-3">
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTheme(t.id)}
              className={cn(
                'flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border-2 transition-all',
                selectedTheme === t.id ? 'border-brand bg-brand-light/10 text-brand' : 'border-border-light bg-surface-alt hover:border-ink-muted text-ink-muted hover:text-ink',
              )}
            >
              <div className="w-8 h-8 rounded-full bg-surface shadow-sm border border-border-light flex items-center justify-center font-body text-xs">
                {getThemeIcon(t.id)}
              </div>
              <span className="font-body text-[10px] font-medium text-center leading-tight">{t.label}</span>
            </button>
          ))}
        </div>
      </motion.div>

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
