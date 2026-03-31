import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

// Payments are handled centrally at italianto.com
const ITALIANTO_PRICING_URL = 'https://italianto.com/precios';


const FEATURES = [
  { icon: 'chatbubbles' as const, text: 'Tutor AI per conversare in italiano' },
  { icon: 'mic' as const, text: 'Correzione pronuncia in tempo reale' },
  { icon: 'infinite' as const, text: 'Traduzioni e coniugazioni illimitate' },
  { icon: 'analytics' as const, text: 'Statistiche avanzate del tuo apprendimento' },
  { icon: 'trophy' as const, text: 'Sfide settimanali e obiettivi esclusivi' },
];

export default function PaywallScreen() {
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const { isSignedIn, isPremium, subscriptionPlan, refreshSubscription } = useAuth();
  const { showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const styles = getStyles(colors);

  const handleSubscribe = async () => {
    if (!isSignedIn) {
      navigation.navigate('SignIn');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Payments are handled centrally at italianto.com
      const result = await WebBrowser.openAuthSessionAsync(
        ITALIANTO_PRICING_URL,
        'italiantoapp://'
      );

      // After browser closes, refresh subscription to detect if user subscribed
      await refreshSubscription();
      setLoading(false);

      if (isPremium) {
        setSuccess(true);
      }
    } catch (err: any) {
      const msg = err?.message ?? 'Errore imprevisto';
      setError(msg);
      showError(msg);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <View style={[styles.container, styles.successContainer]}>
        <View style={styles.successContent}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={80} color="#2e7d32" />
          </View>
          <Text style={styles.successTitle}>Benvenuto in Premium!</Text>
          <Text style={styles.successSubtitle}>
            Il tuo abbonamento è attivo. Goditi tutte le funzionalità di ItaliantoApp.
          </Text>
          <TouchableOpacity
            style={styles.successButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Text style={styles.successButtonText}>Inizia ad imparare</Text>
            <Ionicons name="arrow-forward" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Close button */}
      <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
        <Ionicons name="close" size={28} color={colors.text} />
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Ionicons name="sparkles" size={44} color="#ffd700" />
          </View>
          <Text style={styles.title}>ItaliantoApp Premium</Text>
          <Text style={styles.subtitle}>
            Sblocca tutto il potenziale del tuo italiano
          </Text>
        </View>

        {/* Features */}
        <View style={styles.featuresCard}>
          {FEATURES.map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <View style={styles.featureIconWrap}>
                <Ionicons name={f.icon} size={20} color="#667eea" />
              </View>
              <Text style={styles.featureText}>{f.text}</Text>
            </View>
          ))}
        </View>

        {/* Banner premium activo */}
        {isPremium && (
          <View style={styles.activeBanner}>
            <Ionicons name="checkmark-circle" size={24} color="#2e7d32" />
            <View style={{ flex: 1 }}>
              <Text style={styles.activeBannerTitle}>Sei già Premium!</Text>
              <Text style={styles.activeBannerSub}>
                Piano {subscriptionPlan} attivo
              </Text>
            </View>
          </View>
        )}


        {/* CTA si ya es Premium */}
        {isPremium && (
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Text style={styles.ctaText}>Torna all'app</Text>
            <Ionicons name="arrow-forward" size={22} color="#fff" />
          </TouchableOpacity>
        )}

        {/* Error */}
        {!isPremium && error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={16} color="#c62828" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* CTA suscribirse — solo si no es premium */}
        {!isPremium && (
          <>
            <TouchableOpacity
              style={[styles.ctaButton, loading && styles.ctaDisabled]}
              onPress={handleSubscribe}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.ctaText}>
                    {isSignedIn ? 'Inizia Ora' : 'Accedi per iniziare'}
                  </Text>
                  <Ionicons
                    name={isSignedIn ? 'arrow-forward' : 'log-in'}
                    size={22}
                    color="#fff"
                  />
                </>
              )}
            </TouchableOpacity>

            <Text style={styles.legal}>
              Rinnovo automatico. Annulla in qualsiasi momento dalle impostazioni del
              tuo account.
            </Text>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const getStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    closeButton: {
      position: 'absolute',
      top: 16,
      right: 16,
      zIndex: 10,
      padding: 8,
    },
    scroll: {
      padding: 24,
      paddingTop: 60,
    },
    header: {
      alignItems: 'center',
      marginBottom: 28,
    },
    iconCircle: {
      width: 90,
      height: 90,
      borderRadius: 45,
      backgroundColor: '#667eea',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
      shadowColor: '#667eea',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.35,
      shadowRadius: 10,
      elevation: 6,
    },
    title: {
      fontSize: 26,
      fontWeight: 'bold',
      color: colors.text,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 15,
      color: colors.textSecondary,
      marginTop: 6,
      textAlign: 'center',
    },
    activeBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: '#e8f5e9',
      borderRadius: 14,
      padding: 16,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: '#a5d6a7',
    },
    activeBannerTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: '#2e7d32',
    },
    activeBannerSub: {
      fontSize: 13,
      color: '#388e3c',
      marginTop: 2,
      textTransform: 'capitalize',
    },
    featuresCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 28,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 14,
    },
    featureRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    featureIconWrap: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: '#667eea20',
      justifyContent: 'center',
      alignItems: 'center',
    },
    featureText: {
      flex: 1,
      fontSize: 14,
      color: colors.text,
      fontWeight: '500',
    },
    errorBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: '#ffebee',
      borderRadius: 10,
      padding: 12,
      marginBottom: 12,
    },
    errorText: {
      color: '#c62828',
      fontSize: 13,
      flex: 1,
    },
    ctaButton: {
      flexDirection: 'row',
      backgroundColor: '#667eea',
      borderRadius: 16,
      height: 58,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 8,
      gap: 10,
      shadowColor: '#667eea',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 8,
      elevation: 5,
    },
    ctaDisabled: {
      opacity: 0.6,
    },
    ctaText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: '700',
    },
    successContainer: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    successContent: {
      padding: 32,
      alignItems: 'center',
      gap: 16,
    },
    successIcon: {
      marginBottom: 8,
    },
    successTitle: {
      fontSize: 26,
      fontWeight: 'bold',
      color: colors.text,
      textAlign: 'center',
    },
    successSubtitle: {
      fontSize: 15,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
    },
    successButton: {
      flexDirection: 'row',
      backgroundColor: '#2e7d32',
      borderRadius: 16,
      height: 58,
      paddingHorizontal: 32,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 8,
      gap: 10,
    },
    successButtonText: {
      color: '#fff',
      fontSize: 17,
      fontWeight: '700',
    },
    pollingOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: colors.background + 'ee',
      zIndex: 20,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 20,
      padding: 32,
    },
    pollingText: {
      fontSize: 15,
      color: colors.text,
      textAlign: 'center',
      lineHeight: 22,
    },
    legal: {
      textAlign: 'center',
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 16,
      marginBottom: 32,
      lineHeight: 18,
    },
  });
