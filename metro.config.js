const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

/**
 * En web, los módulos nativos de Android/iOS no existen.
 * Los stubamos como módulos vacíos para que el bundle web compile sin errores.
 * Las implementaciones web reales van en archivos .web.ts (platform-specific).
 */
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web') {
    const nativeOnlyModules = [
      '@vapi-ai/react-native',
      '@daily-co/react-native-daily-js',
      '@daily-co/react-native-webrtc',
      '@react-native-voice/voice',
      'react-native-background-timer',
    ];
    if (nativeOnlyModules.includes(moduleName)) {
      return { type: 'empty' };
    }
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
