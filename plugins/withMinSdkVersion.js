const { withAppBuildGradle } = require('@expo/config-plugins');

/**
 * Config plugin que fuerza minSdkVersion 24 en app/build.gradle.
 * Necesario para @daily-co/react-native-webrtc (Vapi AI Tutor).
 */
module.exports = function withMinSdkVersion(config) {
  return withAppBuildGradle(config, (config) => {
    config.modResults.contents = config.modResults.contents.replace(
      /minSdkVersion\s*=?\s*\d+/,
      'minSdkVersion = 24'
    );
    return config;
  });
};
