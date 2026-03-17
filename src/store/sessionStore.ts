import { create } from 'zustand';
import type { SessionState, AppStep, LayoutId, FilterId, TimerDuration } from '../types';

export const useSessionStore = create<SessionState>((set) => ({
  step: 'landing',
  session: {
    layout: 'strip-4',
    filter: 'none',
    timerDuration: 3,
    photos: [],
    compositeImage: null,
  },

  setStep: (step: AppStep) => set({ step }),

  setLayout: (layout: LayoutId) =>
    set((s) => ({ session: { ...s.session, layout } })),

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
      return { session: { ...s.session, photos } };
    }),

  resetPhotos: () =>
    set((s) => ({ session: { ...s.session, photos: [], compositeImage: null } })),

  setComposite: (dataUrl: string) =>
    set((s) => ({ session: { ...s.session, compositeImage: dataUrl } })),

  resetSession: () =>
    set({
      step: 'landing',
      session: {
        layout: 'strip-4',
        filter: 'none',
        timerDuration: 3,
        photos: [],
        compositeImage: null,
      },
    }),
}));
