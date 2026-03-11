import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useSignIn } from '@clerk/clerk-expo';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const { isSignedIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Si ya hay sesión activa, volver atrás
  useEffect(() => {
    if (isSignedIn) {
      navigation.goBack();
    }
  }, [isSignedIn]);

  const styles = getStyles(colors);

  const handleSignIn = async () => {
    if (!isLoaded || !signIn) return;
    if (!email.trim() || !password) {
      setError('Inserisci email e password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await signIn.create({
        identifier: email.trim().toLowerCase(),
        password,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        navigation.goBack();
      }
    } catch (err: any) {
      const msg = err?.errors?.[0]?.message ?? 'Errore durante l\'accesso';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Close button */}
        <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={28} color={colors.text} />
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.logoContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="language" size={40} color="#fff" />
          </View>
          <Text style={styles.title}>Bentornato</Text>
          <Text style={styles.subtitle}>Accedi a ItaliantoApp</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="tua@email.com"
                placeholderTextColor={colors.textSecondary}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                returnKeyType="next"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={colors.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoComplete="password"
                returnKeyType="done"
                onSubmitEditing={handleSignIn}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={16} color="#e53935" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSignIn}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Accedi</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Non hai un account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
            <Text style={styles.footerLink}> Registrati</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const getStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scroll: {
      flexGrow: 1,
      padding: 24,
      paddingTop: 16,
    },
    closeButton: {
      alignSelf: 'flex-end',
      padding: 8,
      marginBottom: 8,
    },
    logoContainer: {
      alignItems: 'center',
      marginBottom: 40,
    },
    iconCircle: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: '#2e7d32',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.text,
    },
    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      marginTop: 6,
    },
    form: {
      gap: 16,
    },
    inputGroup: {
      gap: 6,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 14,
      height: 54,
    },
    inputIcon: {
      marginRight: 10,
    },
    input: {
      flex: 1,
      fontSize: 16,
      color: colors.text,
    },
    eyeButton: {
      padding: 4,
    },
    errorBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: '#ffebee',
      borderRadius: 10,
      padding: 12,
    },
    errorText: {
      color: '#c62828',
      fontSize: 13,
      flex: 1,
    },
    button: {
      backgroundColor: '#2e7d32',
      borderRadius: 14,
      height: 56,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 8,
      shadowColor: '#2e7d32',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    buttonText: {
      color: '#fff',
      fontSize: 17,
      fontWeight: '700',
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 40,
    },
    footerText: {
      color: colors.textSecondary,
      fontSize: 15,
    },
    footerLink: {
      color: '#2e7d32',
      fontSize: 15,
      fontWeight: '700',
    },
  });
