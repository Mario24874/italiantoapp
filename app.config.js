export default {
  expo: {
    name: "ItaliantoApp",
    slug: "italiantoapp",
    version: "1.2.0",
    scheme: "italiantoapp",
    orientation: "portrait",
    icon: "./assets/Logo_ItaliAnto.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/Logo_ItaliAnto.png",
      resizeMode: "contain",
      backgroundColor: "#2e7d32"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.italiantoapp.app",
      infoPlist: {
        NSMicrophoneUsageDescription: "Questa app richiede l'accesso al microfono per la pratica di pronuncia."
      }
    },
    android: {
      package: "com.italiantoapp.app",
      versionCode: 3,
      minSdkVersion: 24,
      permissions: [
        "android.permission.RECORD_AUDIO",
        "android.permission.INTERNET",
        "android.permission.MODIFY_AUDIO_SETTINGS"
      ],
      adaptiveIcon: {
        foregroundImage: "./assets/Logo_ItaliAnto.png",
        backgroundColor: "#2e7d32"
      }
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    plugins: [
      "expo-dev-client",
      "expo-secure-store",
      "@react-native-voice/voice",
      "./plugins/withMinSdkVersion"
    ],
    extra: {
      eas: {
        projectId: "76bffcff-51b7-465e-8239-d5cb8fce4413"
      },
      // Variables de entorno seguras
      deeplApiKey: process.env.DEEPL_API_KEY || "71ff8838-ffff-427b-812f-ebb76efe3e61:fx"
    },
    owner: "mario24874"
  }
};