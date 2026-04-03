/**
 * Plugin que agrega la declaración del servicio en primer plano de Daily.co
 * al AndroidManifest.xml, requerido por @daily-co/react-native-daily-js
 * para que el audio de llamadas funcione cuando la app pasa a segundo plano.
 */

const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withDailyService(config) {
  return withAndroidManifest(config, (cfg) => {
    const manifest = cfg.modResults.manifest;

    if (!manifest.application) {
      manifest.application = [{}];
    }
    const app = manifest.application[0];

    if (!app.service) {
      app.service = [];
    }

    const serviceName = 'com.daily.reactlibrary.DailyOngoingMeetingForegroundService';
    const alreadyDeclared = app.service.some(
      (s) => s.$?.['android:name'] === serviceName
    );

    if (!alreadyDeclared) {
      app.service.push({
        $: {
          'android:name': serviceName,
          'android:foregroundServiceType': 'camera|microphone',
        },
      });
    }

    return cfg;
  });
};
