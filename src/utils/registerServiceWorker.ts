import { Platform } from 'react-native';

export function registerServiceWorker() {
  if (Platform.OS !== 'web') return;
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .catch(() => {/* SW registration failed silently */});
  });
}
