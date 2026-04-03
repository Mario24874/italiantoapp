import 'react-native-url-polyfill/auto';
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { View, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { ClerkProvider } from '@clerk/clerk-expo';

import TranslatorScreen from './src/screens/TranslatorScreen';
import TutorTab from './src/components/TutorTab';
import ConjugatorScreen from './src/screens/ConjugatorScreen';
import PronunciationScreen from './src/screens/PronunciationScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import SignInScreen from './src/screens/auth/SignInScreen';
import SignUpScreen from './src/screens/auth/SignUpScreen';
import OAuthNativeCallback from './src/screens/auth/OAuthNativeCallback';
import PaywallScreen from './src/screens/PaywallScreen';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { ToastProvider } from './src/context/ToastContext';
import { AuthProvider } from './src/context/AuthContext';
import { SplashScreen } from './src/components/SplashScreen';
import { Onboarding } from './src/components/Onboarding';
import { registerServiceWorker } from './src/utils/registerServiceWorker';
import PWAInstallBanner from './src/components/PWAInstallBanner';

registerServiceWorker();

const Tab = createBottomTabNavigator();
const RootStack = createNativeStackNavigator();

// Deep link config: maps italiantoapp://oauth-native-callback → OAuthNativeCallback screen
// Required for WebBrowser.maybeCompleteAuthSession() to run on the OAuth redirect
const linking = {
  prefixes: ['italiantoapp://', 'italiantoapp:///'],
  config: {
    screens: {
      OAuthNativeCallback: 'oauth-native-callback',
    },
  },
};

// Token cache para Clerk:
// - Web: usa localStorage (expo-secure-store no funciona en browser)
// - Nativo: usa expo-secure-store (más seguro)
const tokenCache = Platform.OS === 'web'
  ? {
      async getToken(key: string) {
        try { return localStorage.getItem(key); } catch { return null; }
      },
      async saveToken(key: string, value: string) {
        try { localStorage.setItem(key, value); } catch {}
      },
      async clearToken(key: string) {
        try { localStorage.removeItem(key); } catch {}
      },
    }
  : {
      async getToken(key: string) {
        try { return await SecureStore.getItemAsync(key); } catch { return null; }
      },
      async saveToken(key: string, value: string) {
        try { await SecureStore.setItemAsync(key, value); } catch {}
      },
      async clearToken(key: string) {
        try { await SecureStore.deleteItemAsync(key); } catch {}
      },
    };

// ─── Tabs principales (sin cambios respecto a v1.2.0) ───────────────────────
function MainTabs() {
  const { colors, theme } = useTheme();

  return (
    <>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap;
            switch (route.name) {
              case 'Translator':
                iconName = focused ? 'language' : 'language-outline';
                break;
              case 'Conjugator':
                iconName = focused ? 'book' : 'book-outline';
                break;
              case 'Pronunciation':
                iconName = focused ? 'mic' : 'mic-outline';
                break;
              case 'Tutor':
                iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
                break;
              case 'Settings':
                iconName = focused ? 'settings' : 'settings-outline';
                break;
              default:
                iconName = 'ellipse';
            }
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopWidth: 0,
            height: 68,
            paddingBottom: 10,
            paddingTop: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -3 },
            shadowOpacity: 0.08,
            shadowRadius: 12,
            elevation: 16,
          },
          headerShown: false,
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
            marginTop: 2,
          },
          tabBarIconStyle: {
            marginTop: 2,
          },
        })}
      >
        <Tab.Screen name="Translator" component={TranslatorScreen} options={{ title: 'Traduttore' }} />
        <Tab.Screen name="Conjugator" component={ConjugatorScreen} options={{ title: 'Coniugatore' }} />
        <Tab.Screen name="Pronunciation" component={PronunciationScreen} options={{ title: 'Pronuncia' }} />
        <Tab.Screen name="Tutor" component={TutorTab} options={{ title: 'Tutor AI' }} />
        <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: 'Impostazioni' }} />
      </Tab.Navigator>
    </>
  );
}

// ─── Navegador raíz: maneja Splash → Onboarding → App + Auth modals ─────────
function RootNavigator() {
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem('onboarding_completed')
      .then(val => {
        setShowOnboarding(val !== 'true');
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  if (isLoading) return null;

  if (showSplash) {
    return (
      <SplashScreen
        onAnimationComplete={() => setShowSplash(false)}
      />
    );
  }

  if (showOnboarding) {
    return (
      <Onboarding onComplete={() => setShowOnboarding(false)} />
    );
  }

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {/* App principal */}
      <RootStack.Screen name="MainTabs" component={MainTabs} />
      {/* Pantallas de auth — se abren como modal desde SettingsScreen */}
      <RootStack.Screen
        name="SignIn"
        component={SignInScreen}
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
      <RootStack.Screen
        name="SignUp"
        component={SignUpScreen}
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
      <RootStack.Screen
        name="Paywall"
        component={PaywallScreen}
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
      {/* OAuth redirect target — never shown, only handles maybeCompleteAuthSession */}
      <RootStack.Screen
        name="OAuthNativeCallback"
        component={OAuthNativeCallback}
        options={{ headerShown: false }}
      />
    </RootStack.Navigator>
  );
}

// ─── App raíz ────────────────────────────────────────────────────────────────
const CLERK_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

export default function App() {
  const inner = (
    <SafeAreaProvider>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <NavigationContainer linking={linking}>
              <RootNavigator />
            </NavigationContainer>
            <PWAInstallBanner />
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );

  const content = CLERK_KEY ? (
    <ClerkProvider
      publishableKey={CLERK_KEY}
      tokenCache={tokenCache}
      allowedRedirectProtocols={['italiantoapp:']}
    >
      {inner}
    </ClerkProvider>
  ) : inner;

  // En web: centrar la app como un móvil dentro de la ventana del navegador
  if (Platform.OS === 'web') {
    return (
      <View style={{ flex: 1, backgroundColor: '#0f0f1a', alignItems: 'center', justifyContent: 'center' }}>
        <View style={{
          flex: 1,
          width: '100%',
          maxWidth: 430,
          overflow: 'hidden',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.5,
          shadowRadius: 40,
        }}>
          {content}
        </View>
      </View>
    );
  }

  return content;
}
