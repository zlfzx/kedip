// Layout options
export type LayoutId = 'strip-4' | 'strip-2' | 'grid-4' | 'single';

// Filter options
export type FilterId = 'none' | 'grayscale' | 'sepia' | 'vintage' | 'vivid' | 'cool' | 'warm' | 'fade';

// Timer options (seconds; 0 = instant)
export type TimerDuration = 0 | 3 | 5 | 10;

// App steps — pick-filter removed, filter is now within camera view
export type AppStep = 'landing' | 'pick-layout' | 'camera' | 'review' | 'download';

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

// One photobooth session
export interface BoothSession {
  layout: LayoutId;
  filter: FilterId;
  timerDuration: TimerDuration;
  photos: string[];           // array of data URLs
  compositeImage: string | null;
}

// Global state shape (Zustand)
export interface SessionState {
  step: AppStep;
  session: BoothSession;
  setStep: (step: AppStep) => void;
  setLayout: (layout: LayoutId) => void;
  setFilter: (filter: FilterId) => void;
  setTimerDuration: (duration: TimerDuration) => void;
  addPhoto: (dataUrl: string) => void;
  replacePhoto: (index: number, dataUrl: string) => void;
  resetPhotos: () => void;
  setComposite: (dataUrl: string) => void;
  resetSession: () => void;
}
