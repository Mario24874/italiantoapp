import { Platform } from 'react-native';

/**
 * Registra el Service Worker.
 * Se llama desde App.tsx al iniciar la app.
 * Solo activo en web; en nativo no hace nada.
 */
export function registerServiceWorker() {
  if (Platform.OS !== 'web') return;
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        // Verificar actualizaciones cuando el usuario vuelve a la pestaña
        document.addEventListener('visibilitychange', () => {
          if (!document.hidden) reg.update();
        });
      })
      .catch(() => {
        // Fallo silencioso — la app funciona igual sin SW
      });
  });
}
