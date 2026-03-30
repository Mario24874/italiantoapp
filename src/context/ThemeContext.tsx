import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  colors: typeof lightTheme;
}

const lightTheme = {
  primary: '#2e7d32',
  primaryLight: '#4caf50',
  primaryDark: '#1b5e20',
  background: '#f5f5f5',
  surface: '#ffffff',
  card: '#ffffff',
  text: '#212121',
  textSecondary: '#757575',
  textTertiary: '#9e9e9e',
  border: '#d0d0d0',
  error: '#d32f2f',
  success: '#4caf50',
  warning: '#ff9800',
  info: '#2196f3',
  shadow: '#000000',
  inputBackground: '#ffffff',
  inputBorder: '#b8b8b8',
  buttonDisabled: '#e0e0e0',
  logoOpacity: 1,
};

const darkTheme = {
  primary: '#4caf50',
  primaryLight: '#81c784',
  primaryDark: '#2e7d32',
  background: '#121212',
  surface: '#1e1e1e',
  card: '#2d2d2d',
  text: '#ffffff',
  textSecondary: '#b3b3b3',
  textTertiary: '#757575',
  border: '#404040',
  error: '#f44336',
  success: '#4caf50',
  warning: '#ff9800',
  info: '#2196f3',
  shadow: '#000000',
  inputBackground: '#2d2d2d',
  inputBorder: '#404040',
  buttonDisabled: '#404040',
  logoOpacity: 0.9,
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('app_theme');
      if (savedTheme === 'dark' || savedTheme === 'light') {
        setTheme(savedTheme);
      }
    } catch (error) {
      console.log('Error loading theme:', error);
    }
  };

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    try {
      await AsyncStorage.setItem('app_theme', newTheme);
    } catch (error) {
      console.log('Error saving theme:', error);
    }
  };

  const colors = theme === 'light' ? lightTheme : darkTheme;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};