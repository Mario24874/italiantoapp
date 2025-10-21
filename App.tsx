import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import TranslatorScreen from './src/screens/TranslatorScreen';
import ConjugatorScreen from './src/screens/ConjugatorScreen';
import PronunciationScreen from './src/screens/PronunciationScreen';
import DictionaryScreen from './src/screens/DictionaryScreen';
import ProgressScreen from './src/screens/ProgressScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { ToastProvider } from './src/context/ToastContext';
import { SplashScreen } from './src/components/SplashScreen';
import { Onboarding } from './src/components/Onboarding';
import i18n from './src/i18n/i18n';

const Tab = createBottomTabNavigator();

function AppContent() {
  const { colors, theme } = useTheme();
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const onboardingCompleted = await AsyncStorage.getItem('onboarding_completed');
      setShowOnboarding(onboardingCompleted !== 'true');
      setIsLoading(false);
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setIsLoading(false);
    }
  };

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  if (isLoading) {
    return null;
  }

  if (showSplash) {
    return <SplashScreen onAnimationComplete={handleSplashComplete} />;
  }

  if (showOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <NavigationContainer>
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
              case 'Dictionary':
                iconName = focused ? 'search' : 'search-outline';
                break;
              case 'Progress':
                iconName = focused ? 'trophy' : 'trophy-outline';
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
            borderTopColor: colors.border,
            height: 60,
            paddingBottom: 8,
            paddingTop: 8,
          },
          headerShown: false,
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
          },
        })}
      >
        <Tab.Screen
          name="Translator"
          component={TranslatorScreen}
          options={{
            title: 'Traduci',
          }}
        />
        <Tab.Screen
          name="Dictionary"
          component={DictionaryScreen}
          options={{
            title: 'Dizionario',
          }}
        />
        <Tab.Screen
          name="Conjugator"
          component={ConjugatorScreen}
          options={{
            title: 'Coniuga',
          }}
        />
        <Tab.Screen
          name="Pronunciation"
          component={PronunciationScreen}
          options={{
            title: 'Pronuncia',
          }}
        />
        <Tab.Screen
          name="Progress"
          component={ProgressScreen}
          options={{
            title: 'Progresso',
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            title: 'Impost.',
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
