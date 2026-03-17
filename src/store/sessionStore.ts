import { create } from 'zustand';
import type {
  SessionState, AppStep, LayoutId, FilterId, TimerDuration,
  TextOverlay, FrameSettings,
} from '../types';

export const DEFAULT_FRAME_SETTINGS: FrameSettings = {
  backgroundColor: '#ffffff',
  padding: 0,
  gap: 0,
  borderWidth: 0,
  borderColor: '#0D0D0D',
  borderRadius: 0,
};

const DEFAULT_SESSION = {
  layout: 'strip-4' as LayoutId,
  filter: 'none' as FilterId,
  timerDuration: 3 as TimerDuration,
  photos: [] as string[],
  frameSettings: { ...DEFAULT_FRAME_SETTINGS },
  textOverlays: [] as TextOverlay[],
  compositeImage: null as string | null,
};

export const useSessionStore = create<SessionState>((set) => ({
  step: 'landing',
  session: { ...DEFAULT_SESSION },
  retakeIndex: null,

  setStep: (step: AppStep) => set({ step }),

  setLayout: (layout: LayoutId) =>
    set((s) => ({ session: { ...s.session, layout, compositeImage: null } })),

  setFilter: (filter: FilterId) =>
    set((s) => ({ session: { ...s.session, filter } })),

  setTimerDuration: (timerDuration: TimerDuration) =>
    set((s) => ({ session: { ...s.session, timerDuration } })),

  addPhoto: (dataUrl: string) =>
    set((s) => ({
      session: { ...s.session, photos: [...s.session.photos, dataUrl] },
    })),

  replacePhoto: (index: number, dataUrl: string) =>
    set((s) => {
      const photos = [...s.session.photos];
      photos[index] = dataUrl;
      return { session: { ...s.session, photos, compositeImage: null } };
    }),

  resetPhotos: () =>
    set((s) => ({
      session: { ...s.session, photos: [], compositeImage: null },
      retakeIndex: null,
    })),

  setComposite: (dataUrl: string) =>
    set((s) => ({ session: { ...s.session, compositeImage: dataUrl } })),

  setFrameSettings: (frameSettings: FrameSettings) =>
    set((s) => ({ session: { ...s.session, frameSettings, compositeImage: null } })),

  setTextOverlays: (textOverlays: TextOverlay[]) =>
    set((s) => ({ session: { ...s.session, textOverlays } })),

  setRetakeIndex: (retakeIndex: number | null) => set({ retakeIndex }),

  resetSession: () =>
    set({
      step: 'landing',
      session: { ...DEFAULT_SESSION, frameSettings: { ...DEFAULT_FRAME_SETTINGS } },
      retakeIndex: null,
    }),
}));
