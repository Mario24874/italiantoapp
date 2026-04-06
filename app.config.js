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
        NSMicrophoneUsageDescription: "Questa app richiede l'accesso al microfono per la pratica di pronuncia e per conversare con il Tutor AI.",
        NSCameraUsageDescription: "Questa app richiede l'accesso alla fotocamera per le chiamate con il Tutor AI."
      }
    },
    android: {
      package: "com.italiantoapp.app",
      versionCode: 6,
      minSdkVersion: 24,
      permissions: [
        "android.permission.RECORD_AUDIO",
        "android.permission.INTERNET",
        "android.permission.MODIFY_AUDIO_SETTINGS",
        "android.permission.CAMERA",
        "android.permission.ACCESS_NETWORK_STATE",
        "android.permission.WAKE_LOCK",
        "android.permission.FOREGROUND_SERVICE",
        "android.permission.FOREGROUND_SERVICE_CAMERA",
        "android.permission.FOREGROUND_SERVICE_MICROPHONE",
        "android.permission.POST_NOTIFICATIONS"
      ],
      adaptiveIcon: {
        foregroundImage: "./assets/Logo_ItaliAnto.png",
        backgroundColor: "#2e7d32"
      },
      intentFilters: [
        {
          action: "VIEW",
          autoVerify: true,
          data: [{ scheme: "italiantoapp" }],
          category: ["BROWSABLE", "DEFAULT"]
        }
      ]
    },
    web: {
      favicon: "./assets/Logo_ItaliAnto.png",
      bundler: "metro",
      name: "Italianto",
      shortName: "Italianto",
      description: "Aprende italiano: traduce, conjuga, practica pronunciación y habla con el Tutor AI",
      themeColor: "#2e7d32",
      backgroundColor: "#2e7d32",
      manifest: {
        orientation: "portrait"
      }
    },
    updates: {
      url: "https://u.expo.dev/76bffcff-51b7-465e-8239-d5cb8fce4413"
    },
    runtimeVersion: {
      policy: "appVersion"
    },
    plugins: [
      "expo-dev-client",
      "expo-secure-store",
      "@config-plugins/react-native-webrtc",
      "@daily-co/config-plugin-rn-daily-js",
      "@react-native-voice/voice",
      "./plugins/withMinSdkVersion",
    ],
    extra: {
      eas: {
        projectId: "76bffcff-51b7-465e-8239-d5cb8fce4413"
      },
      deeplApiKey: process.env.DEEPL_API_KEY || "",
    },
    owner: "mario24874"
  }
};