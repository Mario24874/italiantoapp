import 'react-native-url-polyfill/auto';
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, ActivityIndicator, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { ClerkProvider } from '@clerk/clerk-expo';

import TranslatorScreen from './src/screens/TranslatorScreen';
// TutorScreen carga lazy para evitar que Vapi/WebRTC inicialice al arrancar la app
const TutorScreen = React.lazy(() => import('./src/screens/TutorScreen'));
import ConjugatorScreen from './src/screens/ConjugatorScreen';
import PronunciationScreen from './src/screens/PronunciationScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import SignInScreen from './src/screens/auth/SignInScreen';
import SignUpScreen from './src/screens/auth/SignUpScreen';
import PaywallScreen from './src/screens/PaywallScreen';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { ToastProvider } from './src/context/ToastContext';
import { AuthProvider } from './src/context/AuthContext';
import { SplashScreen } from './src/components/SplashScreen';
import { Onboarding } from './src/components/Onboarding';

const Tab = createBottomTabNavigator();
const RootStack = createNativeStackNavigator();

// ─── Error boundary para TutorScreen (captura crash de Vapi/WebRTC) ──────────
class TutorErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: string }
> {
  state = { hasError: false, error: '' };
  static getDerivedStateFromError(e: any) {
    return { hasError: true, error: e?.message ?? 'Error desconocido' };
  }
  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>
            Tutor AI no disponible
          </Text>
          <Text style={{ textAlign: 'center', color: '#666' }}>
            {this.state.error}
          </Text>
        </View>
      );
    }
    return this.props.children;
  }
}

// Wrapper que carga TutorScreen de forma lazy con Suspense + ErrorBoundary
function TutorTab() {
  return (
    <TutorErrorBoundary>
      <React.Suspense fallback={
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" />
        </View>
      }>
        <TutorScreen />
      </React.Suspense>
    </TutorErrorBoundary>
  );
}

// Token cache para Clerk usando expo-secure-store
const tokenCache = {
  async getToken(key: string) {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch {}
  },
  async clearToken(key: string) {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch {}
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
            <NavigationContainer>
              <RootNavigator />
            </NavigationContainer>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );

  const content = CLERK_KEY ? (
    <ClerkProvider publishableKey={CLERK_KEY} tokenCache={tokenCache}>
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
