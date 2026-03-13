import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

// Only renders on web
export default function PWAInstallBanner() {
  const { colors } = useTheme();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [visible, setVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const slideAnim = React.useRef(new Animated.Value(120)).current;

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    // Already running as installed PWA — no need to show
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(display-mode: standalone)').matches
    ) return;

    // Detect iOS (Safari doesn't support beforeinstallprompt)
    const ua = navigator.userAgent;
    const isIOSDevice = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    if (isIOSDevice) {
      setIsIOS(true);
      setVisible(true);
      return;
    }

    // Android / Desktop Chrome
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setVisible(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: false, tension: 80, friction: 12 }).start();
    }
  }, [visible]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') dismiss();
  };

  const dismiss = () => {
    Animated.timing(slideAnim, { toValue: 120, duration: 250, useNativeDriver: false }).start(() => setVisible(false));
  };

  if (!visible) return null;

  const styles = getStyles(colors);

  return (
    <Animated.View style={[styles.banner, { transform: [{ translateY: slideAnim }] }]}>
      <View style={styles.iconWrap}>
        <Ionicons name="phone-portrait-outline" size={28} color={colors.primary} />
      </View>
      <View style={styles.textWrap}>
        <Text style={styles.title}>Installa ItaliantoApp</Text>
        {isIOS ? (
          <Text style={styles.subtitle}>
            Tocca <Ionicons name="share-outline" size={12} color={colors.textSecondary} /> → "Aggiungi a schermata home"
          </Text>
        ) : (
          <Text style={styles.subtitle}>Accesso rapido senza browser</Text>
        )}
      </View>
      {!isIOS && (
        <TouchableOpacity style={styles.installBtn} onPress={handleInstall} activeOpacity={0.8}>
          <Text style={styles.installBtnText}>Installa</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity style={styles.closeBtn} onPress={dismiss} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Ionicons name="close" size={20} color={colors.textSecondary} />
      </TouchableOpacity>
    </Animated.View>
  );
}

const getStyles = (colors: any) =>
  StyleSheet.create({
    banner: {
      position: 'absolute' as any,
      bottom: 80, // above tab bar
      left: 12,
      right: 12,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 14,
      gap: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.18,
      shadowRadius: 12,
      elevation: 8,
      borderWidth: 1,
      borderColor: colors.border,
      zIndex: 999,
    },
    iconWrap: {
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: colors.primary + '20',
      justifyContent: 'center',
      alignItems: 'center',
    },
    textWrap: {
      flex: 1,
      gap: 3,
    },
    title: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
    },
    subtitle: {
      fontSize: 12,
      color: colors.textSecondary,
      lineHeight: 17,
    },
    installBtn: {
      backgroundColor: colors.primary,
      borderRadius: 10,
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    installBtnText: {
      color: '#fff',
      fontSize: 13,
      fontWeight: '700',
    },
    closeBtn: {
      padding: 2,
    },
  });
