import type { FilterId } from '../types';

export const FILTERS: Record<FilterId, string> = {
  none:      '',
  grayscale: 'grayscale(100%)',
  sepia:     'sepia(80%)',
  vintage:   'sepia(40%) contrast(90%) brightness(95%) saturate(80%)',
  vivid:     'saturate(180%) contrast(110%)',
  cool:      'hue-rotate(30deg) saturate(90%) brightness(105%)',
  warm:      'sepia(20%) saturate(130%) brightness(105%)',
  fade:      'contrast(85%) brightness(110%) saturate(75%)',
};

export const FILTER_LABELS: Record<FilterId, string> = {
  none:      'Normal',
  grayscale: 'B&W',
  sepia:     'Sepia',
  vintage:   'Vintage',
  vivid:     'Vivid',
  cool:      'Cool',
  warm:      'Warm',
  fade:      'Fade',
};

export const FILTER_IDS: FilterId[] = ['none', 'grayscale', 'sepia', 'vintage', 'vivid', 'cool', 'warm', 'fade'];
