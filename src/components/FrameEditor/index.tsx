import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Check, MousePointerClick } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useSessionStore } from '../../store/sessionStore';
import { useCompositor } from '../../hooks/useCompositor';
import { LAYOUTS } from '../../utils/layouts';
import { THEMES, getThemeIcon } from '../../utils/themes';
import { preloadImages, drawComposite } from '../../utils/compositor';
import type { TextOverlay, FrameSettings, LayoutId } from '../../types';

// ─── Constants ────────────────────────────────────────────────────────────────

const FONT_OPTIONS = [
  { label: 'Serif Display', value: "'DM Serif Display', Georgia, serif" },
  { label: 'Sans',          value: "'DM Sans', sans-serif" },
  { label: 'Klasik',        value: "Georgia, 'Times New Roman', serif" },
  { label: 'Mesin Ketik',   value: "'Courier New', Courier, monospace" },
  { label: 'Impact',        value: "Impact, 'Arial Black', sans-serif" },
];

const COLOR_PRESETS = [
  '#ffffff', '#0D0D0D', '#FF6B8A', '#FFE566', '#3ECFB2',
  '#a78bfa', '#fb923c', '#94a3b8',
];

const BG_PRESETS = [
  { label: 'Putih',    value: '#ffffff' },
  { label: 'Krem',     value: '#FAFAF7' },
  { label: 'Hitam',    value: '#0D0D0D' },
  { label: 'Pink',     value: '#FFD6DF' },
  { label: 'Kuning',   value: '#FFF9C4' },
  { label: 'Lavender', value: '#EDE9FE' },
];

const BORDER_COLORS = ['#0D0D0D', '#ffffff', '#FF6B8A', '#FFE566', '#3ECFB2', '#a78bfa'];

function uid() { return Math.random().toString(36).slice(2, 9); }

// ─── Mini SVG layout thumbnail ────────────────────────────────────────────────
function MiniThumb({ slots, canvasW, canvasH }: {
  slots: { x: number; y: number; width: number; height: number }[];
  canvasW: number; canvasH: number;
}) {
  const vw = 100;
  const vh = (canvasH / canvasW) * 100;
  return (
    <svg viewBox={`0 0 ${vw} ${vh}`} className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <rect width={vw} height={vh} fill="oklch(88% 0.008 90)" />
      {slots.map((s, i) => (
        <rect key={i}
          x={(s.x / canvasW) * vw} y={(s.y / canvasH) * vh}
          width={(s.width / canvasW) * vw} height={(s.height / canvasH) * vh}
          fill="oklch(74% 0.008 90)" />
      ))}
    </svg>
  );
}

// ─── Slider control ───────────────────────────────────────────────────────────
function Slider({ label, value, min, max, step = 1, unit = '', onChange }: {
  label: string; value: number; min: number; max: number; step?: number; unit?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="font-body text-xs text-ink-muted w-24 flex-shrink-0">{label}</span>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 h-1.5 rounded-full accent-ink cursor-pointer" />
      <span className="font-body text-xs text-ink w-10 text-right flex-shrink-0">{value}{unit}</span>
    </div>
  );
}

// ─── Tab: Bingkai (frame settings + layout picker) ───────────────────────────
function BingkaiTab({
  frame, setFrame, selectedLayout, setSelectedLayout, photoCount,
}: {
  frame: FrameSettings;
  setFrame: (f: FrameSettings) => void;
  selectedLayout: LayoutId;
  setSelectedLayout: (id: LayoutId) => void;
  photoCount: number;
}) {
  const patch = (partial: Partial<FrameSettings>) => setFrame({ ...frame, ...partial });

  // Only show layouts the user has enough photos for
  const eligible = LAYOUTS.filter((l) => l.photoCount <= photoCount);

  return (
    <div className="flex flex-col gap-5">
      {/* Layout picker */}
      <div>
        <p className="font-body font-medium text-xs text-ink mb-2">Layout</p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {eligible.map((layout) => (
            <button
              key={layout.id}
              onClick={() => setSelectedLayout(layout.id)}
              className={cn(
                'flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all',
                selectedLayout === layout.id ? 'border-brand' : 'border-transparent',
              )}
              style={{ width: 60, height: 80 }}
            >
              <MiniThumb slots={layout.slots} canvasW={layout.canvasWidth} canvasH={layout.canvasHeight} />
            </button>
          ))}
        </div>
      </div>

      {/* Background color */}
      <div>
        <p className="font-body font-medium text-xs text-ink mb-2">Warna latar</p>
        <div className="flex gap-2 flex-wrap px-0.5">
          {BG_PRESETS.map(({ label, value }) => (
            <button key={value} onClick={() => patch({ backgroundColor: value })}
              title={label}
              style={{ background: value }}
              className={cn(
                'w-8 h-8 rounded-full border-2 transition-all',
                frame.backgroundColor === value ? 'border-brand scale-110' : 'border-border-light hover:border-ink-muted',
              )}
            />
          ))}
          {/* Custom hex input */}
          <label className="w-8 h-8 rounded-full border-2 border-dashed border-border-light flex items-center justify-center cursor-pointer overflow-hidden" title="Warna kustom">
            <input type="color" value={frame.backgroundColor}
              onChange={(e) => patch({ backgroundColor: e.target.value })}
              className="opacity-0 absolute w-8 h-8 cursor-pointer" />
            <span className="font-body text-[9px] text-ink-muted pointer-events-none">+</span>
          </label>
        </div>
      </div>

      {/* Padding & Gap */}
      <div className="flex flex-col gap-3">
        <Slider label="Padding luar" value={frame.padding} min={0} max={80} unit="px" onChange={(v) => patch({ padding: v })} />
        <Slider label="Jarak antar foto" value={frame.gap} min={0} max={40} unit="px" onChange={(v) => patch({ gap: v })} />
      </div>

      {/* Border */}
      <div>
        <p className="font-body font-medium text-xs text-ink mb-3">Border foto</p>
        <div className="flex flex-col gap-3">
          <Slider label="Ketebalan" value={frame.borderWidth} min={0} max={16} unit="px" onChange={(v) => patch({ borderWidth: v })} />
          <Slider label="Sudut rounded" value={frame.borderRadius} min={0} max={32} unit="px" onChange={(v) => patch({ borderRadius: v })} />
          {frame.borderWidth > 0 && (
            <div className="flex items-center gap-3">
              <span className="font-body text-xs text-ink-muted w-24 flex-shrink-0">Warna border</span>
              <div className="flex gap-1.5 flex-wrap">
                {BORDER_COLORS.map((c) => (
                  <button key={c} onClick={() => patch({ borderColor: c })}
                    style={{ background: c }}
                    className={cn(
                      'w-6 h-6 rounded-full border-2 transition-all',
                      frame.borderColor === c ? 'border-brand scale-110' : 'border-border-light',
                    )}
                  />
                ))}
                <label className="w-6 h-6 rounded-full border-2 border-dashed border-border-light flex items-center justify-center cursor-pointer overflow-hidden">
                  <input type="color" value={frame.borderColor}
                    onChange={(e) => patch({ borderColor: e.target.value })}
                    className="opacity-0 absolute w-6 h-6 cursor-pointer" />
                  <span className="font-body text-[9px] text-ink-muted pointer-events-none">+</span>
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Tema (decorative themes) ──────────────────────────────────────────
function TemaTab({
  frame, setFrame,
}: {
  frame: FrameSettings;
  setFrame: (f: FrameSettings) => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="font-body font-medium text-xs text-ink mb-3">Pilih Tema</p>
        <div className="grid grid-cols-3 gap-3">
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => setFrame({ ...frame, theme: t.id })}
              className={cn(
                'flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all',
                frame.theme === t.id ? 'border-brand bg-brand-light/10 text-brand' : 'border-border-light bg-surface-alt hover:border-ink-muted text-ink-muted hover:text-ink',
              )}
            >
              <div className="w-8 h-8 rounded-full bg-surface shadow-sm border border-border-light flex items-center justify-center font-body text-xs">
                {getThemeIcon(t.id)}
              </div>
              <span className="font-body text-[10px] font-medium">{t.label}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="bg-brand-light/20 p-3 rounded-xl border border-brand-light/40">
        <p className="font-body text-xs text-brand text-center">
          Warna tema (seperti garis atau border) akan menyesuaikan dengan <strong>Warna Latar</strong> yang kamu pilih di tab Bingkai.
        </p>
      </div>
    </div>
  );
}

// ─── Text overlay card ────────────────────────────────────────────────────────
function TextCard({
  overlay, isSelected, onSelect, onChange, onDelete,
}: {
  overlay: TextOverlay;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (updated: TextOverlay) => void;
  onDelete: () => void;
}) {
  const patch = (partial: Partial<TextOverlay>) => onChange({ ...overlay, ...partial });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'rounded-2xl border p-3 cursor-pointer transition-all',
        isSelected ? 'border-brand bg-brand-light/10' : 'border-border-light bg-surface-alt',
      )}
      onClick={onSelect}
    >
      {/* Header row */}
      <div className="flex items-center gap-2 mb-2">
        {isSelected && (
          <span className="font-body text-[9px] font-medium text-brand px-2 py-0.5 bg-brand-light rounded-full">
            Ketuk preview untuk memposisikan
          </span>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="ml-auto w-6 h-6 rounded-lg flex items-center justify-center text-ink-muted hover:text-brand transition-colors"
        >
          <Trash2 size={12} />
        </button>
      </div>

      {/* Text input */}
      <input
        type="text"
        value={overlay.text}
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => patch({ text: e.target.value })}
        placeholder="Tulis teks di sini…"
        maxLength={80}
        className="w-full bg-white border border-border-light rounded-lg px-3 py-2 font-body text-sm text-ink placeholder:text-ink-muted/50 outline-none focus:border-brand transition-colors"
      />

      {/* Font picker */}
      <div className="mt-2 flex gap-1 overflow-x-auto pb-1">
        {FONT_OPTIONS.map((f) => (
          <button
            key={f.value}
            onClick={(e) => { e.stopPropagation(); patch({ fontFamily: f.value }); }}
            style={{ fontFamily: f.value }}
            className={cn(
              'flex-shrink-0 font-body text-xs px-2.5 py-1 rounded-lg border transition-all whitespace-nowrap',
              overlay.fontFamily === f.value ? 'bg-ink text-surface border-ink' : 'border-border-light text-ink-muted hover:border-ink-muted',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Size + align + color */}
      <div className="flex items-center gap-2 mt-2">
        {/* Size */}
        <div className="flex gap-0.5 bg-white border border-border-light rounded-lg p-0.5">
          {(['sm', 'md', 'lg'] as const).map((s) => (
            <button key={s} onClick={(e) => { e.stopPropagation(); patch({ fontSize: s }); }}
              className={cn('font-body text-xs px-2 py-0.5 rounded-md transition-all',
                overlay.fontSize === s ? 'bg-ink text-surface' : 'text-ink-muted hover:text-ink',
              )}>
              {s === 'sm' ? 'S' : s === 'md' ? 'M' : 'L'}
            </button>
          ))}
        </div>

        {/* Alignment */}
        <div className="flex gap-0.5 bg-white border border-border-light rounded-lg p-0.5">
          {(['left', 'center', 'right'] as const).map((a) => (
            <button key={a} onClick={(e) => { e.stopPropagation(); patch({ align: a }); }}
              className={cn('font-body text-xs px-2 py-0.5 rounded-md transition-all',
                overlay.align === a ? 'bg-ink text-surface' : 'text-ink-muted hover:text-ink',
              )}>
              {a === 'left' ? '←' : a === 'center' ? '↔' : '→'}
            </button>
          ))}
        </div>

        {/* Color swatches */}
        <div className="flex gap-1 ml-auto">
          {COLOR_PRESETS.slice(0, 5).map((c) => (
            <button key={c} onClick={(e) => { e.stopPropagation(); patch({ color: c }); }}
              style={{ background: c }}
              className={cn('w-5 h-5 rounded-full border-2 transition-all',
                overlay.color === c ? 'border-brand scale-110' : 'border-border-light',
              )}
            />
          ))}
          <label className="w-5 h-5 rounded-full border-2 border-dashed border-border-light flex items-center justify-center cursor-pointer overflow-hidden">
            <input type="color" value={overlay.color}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => patch({ color: e.target.value })}
              className="opacity-0 absolute w-5 h-5 cursor-pointer" />
          </label>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main FrameEditor ─────────────────────────────────────────────────────────
export default function FrameEditor() {
  const { session, setStep, setLayout, setFrameSettings, setTextOverlays, setComposite } =
    useSessionStore();
  const { isLoading, buildComposite } = useCompositor();

  const [activeTab, setActiveTab] = useState<'frame' | 'theme' | 'text'>('frame');
  const [frame, setFrameLocal] = useState<FrameSettings>({ ...session.frameSettings });
  const [selectedLayout, setSelectedLayoutLocal] = useState<LayoutId>(session.layout);
  const [overlays, setOverlays] = useState<TextOverlay[]>(session.textOverlays);
  const [selectedOverlayId, setSelectedOverlayId] = useState<string | null>(null);
  const [imagesReady, setImagesReady] = useState(false);

  const previewRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const dragInfo = useRef<{ id: string | null }>({ id: null });
  const rafRef = useRef<number>(0);

  const layout = LAYOUTS.find((l) => l.id === selectedLayout) ?? LAYOUTS[0];
  const aspectW = layout.canvasWidth;
  const aspectH = layout.canvasHeight;

  // Pre-load photo images once on mount
  useEffect(() => {
    let cancelled = false;
    preloadImages(session.photos).then((imgs) => {
      if (cancelled) return;
      imagesRef.current = imgs;
      setImagesReady(true);
    });
    return () => { cancelled = true; };
  }, [session.photos]);

  // Synchronous canvas repaint — called on every change
  const repaint = useCallback(
    (curOverlays: TextOverlay[], curFrame: FrameSettings, curLayoutId: LayoutId) => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const canvas = canvasRef.current;
        if (!canvas || imagesRef.current.length === 0) return;
        const curLayout = LAYOUTS.find((l) => l.id === curLayoutId) ?? LAYOUTS[0];
        canvas.width = curLayout.canvasWidth;
        canvas.height = curLayout.canvasHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        drawComposite(ctx, imagesRef.current, curLayout, curOverlays, curFrame);
      });
    },
    [],
  );

  // Initial paint once images are ready
  useEffect(() => {
    if (imagesReady) repaint(overlays, frame, selectedLayout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imagesReady]);

  const updateFrame = (f: FrameSettings) => {
    setFrameLocal(f);
    repaint(overlays, f, selectedLayout);
  };

  const updateLayout = (id: LayoutId) => {
    setSelectedLayoutLocal(id);
    repaint(overlays, frame, id);
  };

  const updateOverlays = (next: TextOverlay[]) => {
    setOverlays(next);
    repaint(next, frame, selectedLayout);
  };

  // Click-to-position text on preview
  const handlePreviewClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!selectedOverlayId || activeTab !== 'text') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    updateOverlays(overlays.map((o) => o.id === selectedOverlayId ? { ...o, x, y } : o));
  };

  // Drag-to-position text
  const handleDragStart = (e: React.PointerEvent<HTMLDivElement>, id: string) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragInfo.current.id = id;
    if (selectedOverlayId !== id) setSelectedOverlayId(id);
  };

  const handleDragMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragInfo.current.id) return;
    const rect = previewRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    updateOverlays(overlays.map((o) => o.id === dragInfo.current.id ? { ...o, x, y } : o));
  };

  const handleDragEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragInfo.current.id) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    dragInfo.current.id = null;
  };

  const addOverlay = () => {
    const next: TextOverlay = {
      id: uid(), text: '', x: 50, y: 88,
      color: '#ffffff', fontSize: 'md',
      fontFamily: "'DM Sans', sans-serif",
      align: 'center',
    };
    const updated = [...overlays, next];
    setOverlays(updated);
    setSelectedOverlayId(next.id);
    repaint(updated, frame, selectedLayout);
  };

  const handleDone = async () => {
    // Persist to store
    setLayout(selectedLayout);
    setFrameSettings(frame);
    setTextOverlays(overlays);
    // Build final composite as data URL for download
    const final = await buildComposite(session.photos, selectedLayout, overlays, frame);
    if (final) setComposite(final);
    setStep('download');
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col px-5 py-8">
      {/* Header */}
      <motion.div className="mb-4" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-4xl text-ink" style={{ fontFamily: 'var(--font-display)' }}>
          Edit bingkai
        </h2>
        <p className="font-body text-sm text-ink-muted mt-1">Atur layout, bingkai, dan tambahkan teks</p>
      </motion.div>

      {/* ── Preview ── */}
      <div className="flex justify-center mb-4">
        <div
          ref={previewRef}
          onClick={handlePreviewClick}
          className={cn(
            'relative overflow-hidden border border-border-light shadow-sm bg-surface-alt select-none',
            selectedOverlayId && activeTab === 'text' ? 'cursor-crosshair' : 'cursor-default',
          )}
          style={{ width: '100%', maxWidth: Math.min(aspectW, 260), aspectRatio: `${aspectW}/${aspectH}` }}
        >
          <canvas
            ref={canvasRef}
            className="w-full h-full pointer-events-none"
            style={{ display: imagesReady ? 'block' : 'none' }}
          />
          {!imagesReady && (
            <div className="absolute inset-0 bg-surface flex items-center justify-center">
              <motion.div className="w-5 h-5 rounded-full border-2 border-ink/20 border-t-ink"
                animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} />
            </div>
          )}

          {/* Drag position dots for text overlays (only in text tab) */}
          {activeTab === 'text' && overlays.map((o) => (
            <div key={o.id} className="absolute pointer-events-auto"
              style={{ left: `${o.x}%`, top: `${o.y}%`, transform: 'translate(-50%, -50%)', touchAction: 'none' }}>
              <div
                onPointerDown={(e) => handleDragStart(e, o.id)}
                onPointerMove={handleDragMove}
                onPointerUp={handleDragEnd}
                onPointerCancel={handleDragEnd}
                className={cn(
                  'w-5 h-5 -m-1 flex items-center justify-center cursor-grab active:cursor-grabbing transition-all',
                )}
              >
                <div className={cn(
                  'w-3 h-3 rounded-full border-2 border-white shadow-md transition-all pointer-events-none',
                  o.id === selectedOverlayId ? 'bg-brand scale-125' : 'bg-white/60',
                )} />
              </div>
            </div>
          ))}

          {/* Instruction hint */}
          {activeTab === 'text' && selectedOverlayId && (
            <div className="absolute bottom-2 left-0 right-0 flex justify-center pointer-events-none">
              <span
                className="font-body text-[10px] text-white px-2.5 py-1 rounded-full flex items-center gap-1"
                style={{ background: 'rgba(13,13,13,0.6)', backdropFilter: 'blur(4px)' }}
              >
                <MousePointerClick size={10} />
                Ketuk atau seret untuk memposisikan
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 bg-surface-alt rounded-full p-1 mb-4 self-start mx-auto w-full max-w-[280px]">
        {([
          { id: 'frame', label: 'Bingkai' },
          { id: 'theme', label: 'Tema' },
          { id: 'text',  label: 'Teks' },
        ] as const).map((t) => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={cn(
              'flex-1 font-body font-medium text-sm py-2 rounded-full transition-all text-center',
              activeTab === t.id ? 'bg-ink text-surface shadow-sm' : 'text-ink-muted hover:text-ink',
            )}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab content (scrollable) ── */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'frame' ? (
            <motion.div key="frame"
              initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }}
              transition={{ duration: 0.15 }}
            >
              <BingkaiTab
                frame={frame} setFrame={updateFrame}
                selectedLayout={selectedLayout} setSelectedLayout={updateLayout}
                photoCount={session.photos.length}
              />
            </motion.div>
          ) : activeTab === 'theme' ? (
            <motion.div key="theme"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              <TemaTab frame={frame} setFrame={updateFrame} />
            </motion.div>
          ) : (
            <motion.div key="text"
              initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col gap-3"
            >
              {overlays.length === 0 && (
                <div className="text-center py-6">
                  <p className="font-body text-sm text-ink-muted">Belum ada teks</p>
                  <p className="font-body text-xs text-ink-muted/60 mt-1">Tap "Tambah teks" untuk mulai</p>
                </div>
              )}
              <AnimatePresence>
                {overlays.map((overlay) => (
                  <TextCard key={overlay.id} overlay={overlay}
                    isSelected={overlay.id === selectedOverlayId}
                    onSelect={() => setSelectedOverlayId(overlay.id === selectedOverlayId ? null : overlay.id)}
                    onChange={(updated) => updateOverlays(overlays.map((o) => o.id === overlay.id ? updated : o))}
                    onDelete={() => {
                      if (selectedOverlayId === overlay.id) setSelectedOverlayId(null);
                      updateOverlays(overlays.filter((o) => o.id !== overlay.id));
                    }}
                  />
                ))}
              </AnimatePresence>
              {overlays.length < 4 && (
                <motion.button onClick={addOverlay}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl border-2 border-dashed border-border-light text-ink-muted font-body font-medium text-sm hover:border-ink-muted hover:text-ink transition-colors"
                  whileTap={{ scale: 0.98 }}>
                  <Plus size={15} /> Tambah teks
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Actions ── */}
      <div className="flex gap-3 mt-5 pt-3 border-t border-border-light">
        <button onClick={() => setStep('review')}
          className="bg-transparent text-ink font-body font-medium text-sm px-6 py-3 rounded-full border-2 border-ink transition-colors hover:bg-surface-alt">
          Kembali
        </button>
        <motion.button onClick={handleDone} disabled={isLoading}
          className="flex-1 flex items-center justify-center gap-2 bg-ink text-surface font-body font-medium text-sm py-3 rounded-full transition-colors hover:bg-ink/90 disabled:opacity-50"
          whileTap={{ scale: 0.97 }}>
          <Check size={15} />
          {isLoading ? 'Memproses…' : 'Selesai & Unduh'}
        </motion.button>
      </div>
    </div>
  );
}
