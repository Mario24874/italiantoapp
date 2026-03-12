/**
 * Plugin que fuerza minSdkVersion=24 en tres lugares para garantizar
 * compatibilidad con @daily-co/react-native-webrtc (Vapi AI Tutor).
 *
 * Estrategia triple:
 * 1. withProjectBuildGradle — parchea el valor en el bloque ext{} del root build.gradle
 * 2. withAppBuildGradle    — reemplaza la referencia al ext en app/build.gradle con literal 24
 * 3. withAndroidManifest   — agrega <uses-sdk android:minSdkVersion="24"> al manifest
 */

const {
  withProjectBuildGradle,
  withAppBuildGradle,
  withAndroidManifest,
} = require('@expo/config-plugins');

module.exports = function withMinSdkVersion(config) {
  // 1. Root build.gradle: reemplaza "minSdkVersion = <N>" → 24
  config = withProjectBuildGradle(config, (cfg) => {
    cfg.modResults.contents = cfg.modResults.contents.replace(
      /minSdkVersion\s*=\s*\d+/g,
      'minSdkVersion = 24'
    );
    return cfg;
  });

  // 2. app/build.gradle: reemplaza la referencia al ext por literal 24
  config = withAppBuildGradle(config, (cfg) => {
    let contents = cfg.modResults.contents;
    // Patrón: "minSdkVersion rootProject.ext.minSdkVersion" → literal
    contents = contents.replace(
      /minSdkVersion\s+rootProject\.ext\.minSdkVersion/g,
      'minSdkVersion 24'
    );
    // Fallback: cualquier "minSdkVersion <N>" en app/build.gradle
    contents = contents.replace(
      /minSdkVersion\s+(?!rootProject)\d+/g,
      'minSdkVersion 24'
    );
    cfg.modResults.contents = contents;
    return cfg;
  });

  // 3. AndroidManifest.xml: agrega/actualiza <uses-sdk android:minSdkVersion="24">
  config = withAndroidManifest(config, (cfg) => {
    const manifest = cfg.modResults.manifest;
    if (!manifest['uses-sdk']) {
      manifest['uses-sdk'] = [{ $: { 'android:minSdkVersion': '24' } }];
    } else {
      manifest['uses-sdk'][0].$['android:minSdkVersion'] = '24';
    }
    return cfg;
  });

  return config;
};
