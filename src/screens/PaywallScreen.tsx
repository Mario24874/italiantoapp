import React, { useState } from 'react';
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

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

type PlanId = 'mensile' | 'annuale';

const PLANS: {
  id: PlanId;
  name: string;
  price: string;
  period: string;
  priceId: string | undefined;
  popular: boolean;
  badge: string | null;
}[] = [
  {
    id: 'mensile',
    name: 'Piano Mensile',
    price: '$19.99',
    period: 'al mese',
    priceId: process.env.EXPO_PUBLIC_STRIPE_PRICE_MENSILE,
    popular: false,
    badge: null,
  },
  {
    id: 'annuale',
    name: 'Piano Annuale',
    price: '$159.99',
    period: "all'anno",
    priceId: process.env.EXPO_PUBLIC_STRIPE_PRICE_ANNUALE,
    popular: true,
    badge: 'Risparmia il 33%',
  },
];

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
  const { isSignedIn, userId, userEmail, isPremium, subscriptionPlan, refreshSubscription } = useAuth();
  const { showSuccess, showError } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<PlanId>('annuale');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const styles = getStyles(colors);

  const handleSubscribe = async () => {
    if (!isSignedIn) {
      navigation.navigate('SignIn');
      return;
    }

    const plan = PLANS.find(p => p.id === selectedPlan)!;
    if (!plan.priceId) {
      setError('Configurazione prezzi non trovata');
      return;
    }
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      setError('Configurazione backend non trovata');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/create-checkout-session`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            userId,
            userEmail,
            priceId: plan.priceId,
            planType: plan.id,
          }),
        }
      );

      const text = await response.text();
      let data: any = {};
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(`Risposta non valida dal server: ${text.slice(0, 120)}`);
      }

      if (!response.ok || data.error) {
        throw new Error(data.error ?? `Errore HTTP ${response.status}`);
      }

      // Open Stripe Checkout in the in-app browser
      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        'italiantoapp://'
      );

      if (result.type === 'success' && result.url.includes('status=success')) {
        await refreshSubscription();
        showSuccess('Abbonamento attivato! Benvenuto in Premium 🎉');
        navigation.goBack();
      } else if (result.type === 'cancel' || result.url?.includes('status=cancel')) {
        // User closed or cancelled — no error, just stay on screen
      }
    } catch (err: any) {
      const msg = err?.message ?? 'Errore imprevisto';
      setError(msg);
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

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

        {/* Plan selector */}
        {!isPremium && <Text style={styles.plansTitle}>Scegli il tuo piano</Text>}

        {!isPremium && PLANS.map(plan => {
          const isSelected = selectedPlan === plan.id;
          return (
            <TouchableOpacity
              key={plan.id}
              style={[
                styles.planCard,
                isSelected && styles.planCardSelected,
                plan.popular && styles.planCardPopular,
              ]}
              onPress={() => setSelectedPlan(plan.id)}
              activeOpacity={0.85}
            >
              {plan.popular && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularBadgeText}>Più Popolare</Text>
                </View>
              )}
              <View style={styles.planRow}>
                <View style={styles.radioWrap}>
                  <View style={[styles.radio, isSelected && styles.radioActive]} />
                </View>
                <View style={styles.planInfo}>
                  <Text style={[styles.planName, isSelected && styles.planNameSelected]}>
                    {plan.name}
                  </Text>
                  {plan.badge && (
                    <View style={styles.savingsPill}>
                      <Text style={styles.savingsPillText}>{plan.badge}</Text>
                    </View>
                  )}
                </View>
                <View style={styles.priceBlock}>
                  <Text style={[styles.price, isSelected && styles.priceSelected]}>
                    {plan.price}
                  </Text>
                  <Text style={styles.period}>{plan.period}</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

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
    plansTitle: {
      fontSize: 17,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 12,
    },
    planCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      borderWidth: 2,
      borderColor: colors.border,
      marginBottom: 12,
      overflow: 'hidden',
    },
    planCardSelected: {
      borderColor: '#667eea',
    },
    planCardPopular: {
      // extra style handled by popularBadge
    },
    popularBadge: {
      backgroundColor: '#667eea',
      paddingVertical: 4,
      paddingHorizontal: 14,
      alignItems: 'center',
    },
    popularBadgeText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: '700',
      letterSpacing: 0.5,
    },
    planRow: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      gap: 12,
    },
    radioWrap: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 2,
      borderColor: colors.border,
      justifyContent: 'center',
      alignItems: 'center',
    },
    radio: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: 'transparent',
    },
    radioActive: {
      backgroundColor: '#667eea',
    },
    planInfo: {
      flex: 1,
      gap: 4,
    },
    planName: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
    },
    planNameSelected: {
      color: '#667eea',
    },
    savingsPill: {
      backgroundColor: '#e8f5e9',
      borderRadius: 10,
      paddingHorizontal: 8,
      paddingVertical: 2,
      alignSelf: 'flex-start',
    },
    savingsPillText: {
      color: '#2e7d32',
      fontSize: 11,
      fontWeight: '700',
    },
    priceBlock: {
      alignItems: 'flex-end',
    },
    price: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
    },
    priceSelected: {
      color: '#667eea',
    },
    period: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
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
    legal: {
      textAlign: 'center',
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 16,
      marginBottom: 32,
      lineHeight: 18,
    },
  });
