import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

// Safe placeholder for Android — @vapi-ai/react-native crashes the process
// on Android due to WebRTC JNI initialization (open issue, no official fix).
// The full Tutor experience is available at app.italianto.com (PWA).
export default function TutorScreenAndroid() {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.iconCircle}>
        <Ionicons name="chatbubbles" size={48} color="#fff" />
      </View>

      <Text style={[styles.title, { color: colors.text }]}>Tutor AI</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Conversa in italiano con il tuo tutor personale
      </Text>

      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Ionicons name="information-circle-outline" size={20} color={colors.textSecondary} style={styles.infoIcon} />
        <Text style={[styles.cardText, { color: colors.textSecondary }]}>
          Il Tutor AI è disponibile nella versione web. Aprila dal tuo browser per accedere alla conversazione completa con il tuo tutor.
        </Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => Linking.openURL('https://app.italianto.com')}
        activeOpacity={0.8}
      >
        <Ionicons name="globe-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.buttonText}>Apri la versione web</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#2e7d32',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 32,
    gap: 10,
  },
  infoIcon: {
    marginTop: 1,
  },
  cardText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2e7d32',
    borderRadius: 14,
    height: 56,
    paddingHorizontal: 28,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
