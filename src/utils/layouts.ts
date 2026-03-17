import type { LayoutConfig } from '../types';

export const LAYOUTS: LayoutConfig[] = [
  {
    id: 'strip-4',
    label: 'Strip 4 Foto',
    photoCount: 4,
    canvasWidth: 400,
    canvasHeight: 1200,
    slots: [
      { x: 20, y: 20,   width: 360, height: 275 },
      { x: 20, y: 315,  width: 360, height: 275 },
      { x: 20, y: 610,  width: 360, height: 275 },
      { x: 20, y: 905,  width: 360, height: 275 },
    ],
  },
  {
    id: 'grid-4',
    label: 'Grid 2×2',
    photoCount: 4,
    canvasWidth: 800,
    canvasHeight: 800,
    slots: [
      { x: 10,  y: 10,  width: 380, height: 380 },
      { x: 410, y: 10,  width: 380, height: 380 },
      { x: 10,  y: 410, width: 380, height: 380 },
      { x: 410, y: 410, width: 380, height: 380 },
    ],
  },
  {
    id: 'strip-2',
    label: 'Diptych',
    photoCount: 2,
    canvasWidth: 400,
    canvasHeight: 620,
    slots: [
      { x: 20, y: 20,  width: 360, height: 275 },
      { x: 20, y: 325, width: 360, height: 275 },
    ],
  },
  {
    id: 'single',
    label: 'Foto Tunggal',
    photoCount: 1,
    canvasWidth: 800,
    canvasHeight: 600,
    slots: [
      { x: 20, y: 20, width: 760, height: 560 },
    ],
  },
];

export function getLayout(id: string): LayoutConfig {
  return LAYOUTS.find((l) => l.id === id) ?? LAYOUTS[0];
}
