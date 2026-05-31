export const USE_SERENIBASE =
  import.meta.env.VITE_USE_SERENIBASE === 'true' || import.meta.env.VITE_USE_SERENIBASE === '1';

/** Empty string uses Vite dev proxy to coworking-api (:3001). */
export const API_BASE_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');
