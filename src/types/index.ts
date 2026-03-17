// Layout options
export type LayoutId = 'strip-4' | 'strip-2' | 'grid-4' | 'single';

// Filter options
export type FilterId = 'none' | 'grayscale' | 'sepia' | 'vintage' | 'vivid' | 'cool' | 'warm' | 'fade';

// Frame Theme options
export type ThemeId = 'none' | 'polkadot' | 'grid' | 'hearts' | 'stars' | 'film' | 'y2k' | 'floral' | 'retro' | 'starry';

// Timer options (seconds; 0 = instant)
export type TimerDuration = 0 | 3 | 5 | 10;

// App steps
export type AppStep = 'landing' | 'pick-layout' | 'camera' | 'review' | 'edit-frame' | 'download';

// A single photo slot in a layout
export interface SlotConfig {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Layout configuration
export interface LayoutConfig {
  id: LayoutId;
  label: string;
  photoCount: number;
  canvasWidth: number;
  canvasHeight: number;
  slots: SlotConfig[];
}

// Frame / bingkai styling applied when compositing
export interface FrameSettings {
  backgroundColor: string; // canvas background & frame fill
  padding: number;          // outer padding (canvas px, 0–80)
  gap: number;              // gap between photos (canvas px, 0–40)
  borderWidth: number;      // border around each photo (0–16)
  borderColor: string;      // border color
  borderRadius: number;     // photo corner radius (0–32)
  theme: ThemeId;           // decorative theme for the frame
}

// A text overlay drawn freely on the final composite
export interface TextOverlay {
  id: string;
  text: string;
  /** horizontal position, % of canvas width (0–100) */
  x: number;
  /** vertical position, % of canvas height (0–100) */
  y: number;
  color: string;
  fontSize: 'sm' | 'md' | 'lg';
  fontFamily: string;        // CSS font-family string
  align: 'left' | 'center' | 'right';
}

// One photobooth session
export interface BoothSession {
  layout: LayoutId;
  filter: FilterId;
  timerDuration: TimerDuration;
  photos: string[];
  frameSettings: FrameSettings;
  textOverlays: TextOverlay[];
  compositeImage: string | null;
}

// Global state shape (Zustand)
export interface SessionState {
  step: AppStep;
  session: BoothSession;
  retakeIndex: number | null;

  setStep: (step: AppStep) => void;
  setLayout: (layout: LayoutId) => void;
  setFilter: (filter: FilterId) => void;
  setTimerDuration: (duration: TimerDuration) => void;
  addPhoto: (dataUrl: string) => void;
  replacePhoto: (index: number, dataUrl: string) => void;
  resetPhotos: () => void;
  setComposite: (dataUrl: string) => void;
  setFrameSettings: (settings: FrameSettings) => void;
  setTextOverlays: (overlays: TextOverlay[]) => void;
  setRetakeIndex: (index: number | null) => void;
  resetSession: () => void;
}
