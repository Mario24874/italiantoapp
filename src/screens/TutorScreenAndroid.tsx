import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

// Android-safe Tutor screen — @vapi-ai/react-native is not imported here.
// Shows the same auth/paywall guards as TutorScreen without crashing the process.
export default function TutorScreenAndroid() {
  const { colors } = useTheme();
  const { isSignedIn, isPremium, clerkConfigured } = useAuth();
  const navigation = useNavigation<any>();
  const styles = getStyles(colors);

  // Guard 1: not signed in
  if (!isSignedIn && clerkConfigured) {
    return (
      <View style={[styles.container, styles.center]}>
        <Ionicons name="lock-closed" size={60} color={colors.textSecondary} />
        <Text style={styles.lockTitle}>Accedi per usare il Tutor</Text>
        <Text style={styles.lockSubtitle}>
          Il Tutor AI è una funzionalità esclusiva per gli utenti registrati.
        </Text>
        <TouchableOpacity
          style={styles.lockButton}
          onPress={() => navigation.navigate('SignIn')}
          activeOpacity={0.8}
        >
          <Text style={styles.lockButtonText}>Accedi</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Guard 2: signed in but not premium
  if (!isPremium) {
    return (
      <View style={[styles.container, styles.center]}>
        <Ionicons name="sparkles" size={60} color="#ffd700" />
        <Text style={styles.lockTitle}>Funzionalità Premium</Text>
        <Text style={styles.lockSubtitle}>
          Il Tutor AI è disponibile per gli abbonati Premium. Sblocca conversazioni
          illimitate in italiano con un tutor personalizzato.
        </Text>
        <TouchableOpacity
          style={styles.lockButton}
          onPress={() => navigation.navigate('Paywall')}
          activeOpacity={0.8}
        >
          <Text style={styles.lockButtonText}>Scopri Premium</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Premium user: native voice tutor coming soon for Android
  return (
    <View style={[styles.container, styles.center]}>
      <View style={styles.iconCircle}>
        <Ionicons name="chatbubbles" size={48} color="#fff" />
      </View>
      <Text style={styles.lockTitle}>Tutor AI</Text>
      <Text style={styles.lockSubtitle}>
        Il Tutor AI vocale è in fase di ottimizzazione per Android.{'\n'}
        Sarà disponibile nativamente nelle prossime settimane.
      </Text>
      <View style={[styles.infoBadge, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Ionicons name="checkmark-circle" size={18} color="#2e7d32" />
        <Text style={[styles.infoBadgeText, { color: colors.textSecondary }]}>
          Piano Premium attivo
        </Text>
      </View>
    </View>
  );
}

const getStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    center: {
      justifyContent: 'center',
      alignItems: 'center',
      padding: 32,
    },
    lockTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
      marginTop: 20,
      marginBottom: 12,
      textAlign: 'center',
    },
    lockSubtitle: {
      fontSize: 15,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
      marginBottom: 32,
    },
    lockButton: {
      backgroundColor: '#2e7d32',
      paddingHorizontal: 32,
      paddingVertical: 14,
      borderRadius: 14,
      shadowColor: '#2e7d32',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    lockButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '700',
    },
    iconCircle: {
      width: 96,
      height: 96,
      borderRadius: 48,
      backgroundColor: '#2e7d32',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 8,
    },
    infoBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      borderWidth: 1,
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    infoBadgeText: {
      fontSize: 14,
      fontWeight: '600',
    },
  });
