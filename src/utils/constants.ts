// src/utils/constants.ts

import type { ToneOption, LengthOption } from '../types';

// Debug logging
console.log('[Constants] Environment check:');
console.log('[Constants] import.meta.env:', import.meta.env);
console.log('[Constants] VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
console.log('[Constants] MODE:', import.meta.env.MODE);
console.log('[Constants] PROD:', import.meta.env.PROD);
console.log('[Constants] DEV:', import.meta.env.DEV);

export const TONE_OPTIONS: ToneOption[] = [
  { key: 'whimsical', label: 'Whimsical & Playful' },
  { key: 'mystical', label: 'Mystical & Magical' },
  { key: 'adventurous', label: 'Adventurous & Bold' },
  { key: 'gentle', label: 'Gentle & Soothing' },
  { key: 'mysterious', label: 'Dark & Mysterious' },
  { key: 'comedy', label: 'Funny & Comedic' }
];

export const LENGTH_OPTIONS: LengthOption[] = [
  { key: 'short', label: 'Short' },
  { key: 'medium', label: 'Medium' },
  { key: 'long', label: 'Long' }
];

// TEMPORARY FIX - Hardcode the URL until env vars work
export const API_BASE_URL = 'https://dream-journal-backend-production.up.railway.app/api';

// ORIGINAL CODE - Uncomment this once env vars are working
// export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
//   (import.meta.env.DEV ? 'http://localhost:3001/api' : '/api');

console.log('[Constants] Final API_BASE_URL:', API_BASE_URL);

// Feature flags
export const FEATURES = {
  VOICE_RECORDING: import.meta.env.VITE_ENABLE_VOICE_RECORDING !== 'false',
  IMAGE_GENERATION: import.meta.env.VITE_ENABLE_IMAGE_GENERATION !== 'false',
  ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
};

// App metadata
export const APP_CONFIG = {
  name: 'DreamSprout',
  version: '2.1.0',
  support_email: 'support@dreamsprout.app',
};