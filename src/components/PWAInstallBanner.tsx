/**
 * PWAInstallBanner
 *
 * Muestra un banner de instalación en la parte inferior de la pantalla
 * cuando la app puede ser instalada como PWA.
 *
 * Estrategia:
 * - El evento `beforeinstallprompt` se captura en web/index.html (ANTES de que React cargue)
 *   y se guarda en window.__pwaPrompt.
 * - Este componente solo lee ese valor y muestra la UI cuando está disponible.
 * - En iOS Safari: no hay beforeinstallprompt → muestra instrucciones de "Añadir a inicio".
 * - Si la app ya corre en modo standalone (instalada): no muestra nada.
 */
import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

type BannerMode = 'android' | 'ios' | null;

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in navigator && (navigator as any).standalone === true)
  );
}

function detectMobilePlatform(): BannerMode {
  if (typeof navigator === 'undefined') return null;
  const ua = navigator.userAgent.toLowerCase();
  if (/android/.test(ua)) return 'android';
  if (/iphone|ipad|ipod/.test(ua)) return 'ios';
  return null;  // Desktop — Chrome mostrará su propio botón en la barra de direcciones
}

export default function PWAInstallBanner() {
  const { colors } = useTheme();
  const [mode, setMode] = useState<BannerMode>(null);
  const [visible, setVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(120)).current;

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    if (isStandalone()) return;  // Ya instalada — no mostrar

    const platform = detectMobilePlatform();
    if (!platform) return;  // En desktop Chrome el botón aparece en la barra de URL

    // Verificar si el usuario ya descartó el banner en esta sesión
    if (sessionStorage.getItem('pwa_banner_dismissed')) return;

    const show = () => {
      setMode(platform);
      setVisible(true);
    };

    if (platform === 'android') {
      if ((window as any).__pwaPrompt) {
        // El evento ya disparó antes de que montáramos
        setTimeout(show, 1200);
      } else {
        // Escuchamos el evento — pero si Chrome no lo dispara en 4s,
        // mostramos instrucciones manuales de todas formas.
        let fired = false;
        const handler = () => {
          fired = true;
          setTimeout(show, 1200);
        };
        window.addEventListener('pwa-prompt-ready', handler);
        const fallback = setTimeout(() => {
          if (!fired) show();  // mostrar instrucciones manuales
        }, 4000);
        return () => {
          window.removeEventListener('pwa-prompt-ready', handler);
          clearTimeout(fallback);
        };
      }
    } else {
      // iOS: no hay beforeinstallprompt, mostrar instrucciones siempre
      setTimeout(show, 1500);
    }
  }, []);

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: false,
        tension: 80,
        friction: 12,
      }).start();
    }
  }, [visible]);

  const dismiss = () => {
    sessionStorage.setItem('pwa_banner_dismissed', '1');
    Animated.timing(slideAnim, {
      toValue: 120,
      duration: 250,
      useNativeDriver: false,
    }).start(() => setVisible(false));
  };

  const handleInstall = async () => {
    const prompt = (window as any).__pwaPrompt;
    if (!prompt) return;
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === 'accepted') {
      (window as any).__pwaPrompt = null;
      dismiss();
    }
  };

  if (!visible || !mode) return null;

  const styles = getStyles(colors);

  return (
    <Animated.View style={[styles.banner, { transform: [{ translateY: slideAnim }] }]}>
      {/* Franja tricolor italiana */}
      <View style={styles.italianStripe} />

      <View style={styles.content}>
        <View style={styles.iconWrap}>
          <Ionicons name="phone-portrait-outline" size={26} color={colors.primary} />
        </View>

        <View style={styles.textWrap}>
          <Text style={styles.title}>
            {mode === 'ios' ? 'Aggiungi alla schermata home' : 'Installa ItaliantoApp'}
          </Text>
          <Text style={styles.subtitle}>
            {mode === 'ios'
              ? 'Tocca condividi → "Aggiungi a schermata Home"'
              : (window as any).__pwaPrompt
                ? 'Accesso rapido senza browser'
                : 'Menu (⋮) → "Aggiungi a schermata Home"'}
          </Text>
        </View>

        {mode === 'android' && (window as any).__pwaPrompt && (
          <TouchableOpacity style={styles.installBtn} onPress={handleInstall} activeOpacity={0.8}>
            <Text style={styles.installBtnText}>Installa</Text>
          </TouchableOpacity>
        )}

        {(mode === 'ios' || (mode === 'android' && !(window as any).__pwaPrompt)) && (
          <View style={styles.iosHint}>
            <Ionicons name={mode === 'ios' ? 'share-outline' : 'ellipsis-vertical'} size={18} color={colors.primary} />
          </View>
        )}

        <TouchableOpacity
          style={styles.closeBtn}
          onPress={dismiss}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close" size={18} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const getStyles = (colors: any) =>
  StyleSheet.create({
    banner: {
      position: 'absolute' as any,
      bottom: 76,
      left: 8,
      right: 8,
      backgroundColor: colors.surface,
      borderRadius: 16,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 8,
      borderWidth: 1,
      borderColor: colors.border,
      zIndex: 999,
    },
    italianStripe: {
      height: 3,
      // Bandera italiana: verde | blanco | rojo
      background: 'linear-gradient(90deg, #009246 33.3%, #ffffff 33.3% 66.6%, #ce2b37 66.6%)' as any,
      backgroundColor: '#009246',  // fallback para RN (no aplica en web)
    },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      gap: 10,
    },
    iconWrap: {
      width: 40,
      height: 40,
      borderRadius: 10,
      backgroundColor: colors.primary + '18',
      justifyContent: 'center',
      alignItems: 'center',
    },
    textWrap: {
      flex: 1,
    },
    title: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.text,
    },
    subtitle: {
      fontSize: 11,
      color: colors.textSecondary,
      marginTop: 2,
      lineHeight: 15,
    },
    installBtn: {
      backgroundColor: colors.primary,
      borderRadius: 8,
      paddingHorizontal: 14,
      paddingVertical: 7,
    },
    installBtnText: {
      color: '#fff',
      fontSize: 13,
      fontWeight: '700',
    },
    iosHint: {
      width: 36,
      height: 36,
      borderRadius: 8,
      backgroundColor: colors.primary + '18',
      justifyContent: 'center',
      alignItems: 'center',
    },
    closeBtn: {
      padding: 2,
    },
  });
