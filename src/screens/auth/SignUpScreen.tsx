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
import { useSignUp, useSSO } from '@clerk/clerk-expo';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

WebBrowser.maybeCompleteAuthSession();
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

type Step = 'register' | 'verify';

export default function SignUpScreen() {
  const { signUp, setActive, isLoaded } = useSignUp();
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const { isSignedIn } = useAuth();

  // Si ya hay sesión activa, volver atrás
  useEffect(() => {
    if (isSignedIn) {
      navigation.goBack();
    }
  }, [isSignedIn]);

  const { startSSOFlow } = useSSO();

  const [step, setStep] = useState<Step>('register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const styles = getStyles(colors);

  const handleGoogleSignUp = async () => {
    try {
      await WebBrowser.warmUpAsync();
      const redirectUrl = Platform.OS === 'web'
        ? window.location.origin
        : 'italiantoapp://oauth-native-callback';

      const { createdSessionId, setActive: setActiveOAuth } = await startSSOFlow({
        strategy: 'oauth_google',
        redirectUrl,
      });

      if (createdSessionId && setActiveOAuth) {
        await setActiveOAuth({ session: createdSessionId });
        navigation.goBack();
      }
      // Android: OAuthNativeCallback handles completion via signIn.reload().
    } catch (err: any) {
      const msg = err?.errors?.[0]?.longMessage
        ?? err?.errors?.[0]?.message
        ?? err?.message
        ?? 'Error con Google Sign-In';
      setError(msg);
    } finally {
      await WebBrowser.coolDownAsync();
    }
  };

  const handleRegister = async () => {
    if (!isLoaded || !signUp) {
      setError('Autenticación no disponible. Reinicia la aplicación.');
      return;
    }
    if (!email.trim() || !password || !confirmPassword) {
      setError('Compila tutti i campi');
      return;
    }
    if (password !== confirmPassword) {
      setError('Le password non coincidono');
      return;
    }
    if (password.length < 8) {
      setError('La password deve avere almeno 8 caratteri');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await signUp.create({
        emailAddress: email.trim().toLowerCase(),
        password,
      });
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setStep('verify');
    } catch (err: any) {
      setError(err?.errors?.[0]?.message ?? 'Errore durante la registrazione');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!isLoaded || !signUp) return;
    if (!verificationCode.trim()) {
      setError('Inserisci il codice di verifica');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await signUp.attemptEmailAddressVerification({
        code: verificationCode.trim(),
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        navigation.goBack();
      }
    } catch (err: any) {
      setError(err?.errors?.[0]?.message ?? 'Codice non valido. Riprova.');
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
            <Ionicons name={step === 'register' ? 'school' : 'mail'} size={40} color="#fff" />
          </View>
          <Text style={styles.title}>
            {step === 'register' ? 'Crea Account' : 'Verifica Email'}
          </Text>
          <Text style={styles.subtitle}>
            {step === 'register'
              ? 'Inizia il tuo viaggio in italiano'
              : `Codice inviato a:\n${email}`}
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {step === 'register' ? (
            <>
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
                    placeholder="Minimo 8 caratteri"
                    placeholderTextColor={colors.textSecondary}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    returnKeyType="next"
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

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Conferma Password</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Ripeti la password"
                    placeholderTextColor={colors.textSecondary}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    returnKeyType="done"
                    onSubmitEditing={handleRegister}
                  />
                </View>
              </View>
            </>
          ) : (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Codice di Verifica</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="keypad-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, styles.codeInput]}
                  placeholder="123456"
                  placeholderTextColor={colors.textSecondary}
                  value={verificationCode}
                  onChangeText={setVerificationCode}
                  keyboardType="number-pad"
                  maxLength={6}
                  returnKeyType="done"
                  onSubmitEditing={handleVerify}
                  autoFocus
                />
              </View>
            </View>
          )}

          {error ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={16} color="#c62828" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {step === 'register' && (
            <>
              <TouchableOpacity
                style={styles.googleButton}
                onPress={handleGoogleSignUp}
                activeOpacity={0.8}
              >
                <Ionicons name="logo-google" size={20} color="#4285F4" style={styles.inputIcon} />
                <Text style={styles.googleButtonText}>Continua con Google</Text>
              </TouchableOpacity>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>oppure</Text>
                <View style={styles.dividerLine} />
              </View>
            </>
          )}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={step === 'register' ? handleRegister : handleVerify}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                {step === 'register' ? 'Registrati' : 'Verifica Email'}
              </Text>
            )}
          </TouchableOpacity>

          {step === 'verify' && (
            <TouchableOpacity style={styles.backButton} onPress={() => setStep('register')}>
              <Ionicons name="arrow-back" size={16} color="#2e7d32" />
              <Text style={styles.backText}>Torna indietro</Text>
            </TouchableOpacity>
          )}
        </View>

        {step === 'register' && (
          <View style={styles.footer}>
            <Text style={styles.footerText}>Hai già un account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
              <Text style={styles.footerLink}> Accedi</Text>
            </TouchableOpacity>
          </View>
        )}
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
      fontSize: 15,
      color: colors.textSecondary,
      marginTop: 6,
      textAlign: 'center',
      lineHeight: 22,
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
    codeInput: {
      fontSize: 22,
      letterSpacing: 6,
      fontWeight: '700',
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
    googleButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface,
      borderRadius: 14,
      height: 56,
      borderWidth: 1,
      borderColor: colors.border,
      marginTop: 8,
      gap: 10,
    },
    googleButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    divider: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 4,
      gap: 10,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: colors.border,
    },
    dividerText: {
      fontSize: 13,
      color: colors.textSecondary,
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
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      marginTop: 4,
    },
    backText: {
      color: '#2e7d32',
      fontSize: 15,
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
