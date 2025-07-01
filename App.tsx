import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import TranslatorScreen from './src/screens/TranslatorScreen';
import ConjugatorScreen from './src/screens/ConjugatorScreen';
import PronunciationScreen from './src/screens/PronunciationScreen';
import i18n from './src/i18n/i18n';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName: keyof typeof Ionicons.glyphMap;

              if (route.name === 'Translator') {
                iconName = focused ? 'language' : 'language-outline';
              } else if (route.name === 'Conjugator') {
                iconName = focused ? 'book' : 'book-outline';
              } else {
                iconName = focused ? 'mic' : 'mic-outline';
              }

              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: '#2e7d32',
            tabBarInactiveTintColor: 'gray',
            headerStyle: {
              backgroundColor: '#2e7d32',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          })}
        >
          <Tab.Screen 
            name="Translator" 
            component={TranslatorScreen}
            options={{
              title: i18n.t('app.navigation.translator'),
              headerTitle: 'ItaliantoApp'
            }}
          />
          <Tab.Screen 
            name="Conjugator" 
            component={ConjugatorScreen}
            options={{
              title: i18n.t('app.navigation.conjugator'),
              headerTitle: 'ItaliantoApp'
            }}
          />
          <Tab.Screen 
            name="Pronunciation" 
            component={PronunciationScreen}
            options={{
              title: i18n.t('app.navigation.pronunciation'),
              headerTitle: 'ItaliantoApp'
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
