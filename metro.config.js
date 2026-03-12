const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

/**
 * En web, los módulos nativos de Android/iOS no existen.
 * Usamos stubs reales (no {type:'empty'}) para evitar "Requiring unknown module XXXX".
 */
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web') {
    if (moduleName === '@vapi-ai/react-native') {
      return {
        filePath: path.resolve(__dirname, 'stubs/vapi-stub.js'),
        type: 'sourceFile',
      };
    }
    const emptyModules = [
      // @vapi-ai/web y @daily-co/daily-js se cargan desde CDN en TutorScreen.web.tsx
      // (sus bundles internos usan webpack numeric requires que Metro no puede resolver)
      '@vapi-ai/web',
      '@daily-co/daily-js',
      '@daily-co/react-native-daily-js',
      '@daily-co/react-native-webrtc',
      '@react-native-voice/voice',
      'react-native-background-timer',
    ];
    if (emptyModules.includes(moduleName)) {
      return {
        filePath: path.resolve(__dirname, 'stubs/empty-module.js'),
        type: 'sourceFile',
      };
    }
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
