const { withProjectBuildGradle } = require('@expo/config-plugins');

/**
 * Fuerza minSdkVersion 24 en android/build.gradle (root).
 * Necesario para @daily-co/react-native-webrtc (Vapi AI Tutor).
 *
 * NOTA: withAppBuildGradle NO funciona porque app/build.gradle usa
 * rootProject.ext.minSdkVersion (no un literal). El valor real vive
 * en el root build.gradle dentro del bloque ext {}.
 */
module.exports = function withMinSdkVersion(config) {
  return withProjectBuildGradle(config, (config) => {
    const contents = config.modResults.contents;
    // Reemplaza "minSdkVersion = 23" (o cualquier número) por 24
    config.modResults.contents = contents.replace(
      /minSdkVersion\s*=\s*\d+/,
      'minSdkVersion = 24'
    );
    return config;
  });
};
