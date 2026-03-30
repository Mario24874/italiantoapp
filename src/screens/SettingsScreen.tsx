import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Image,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { ThemeToggle } from '../components/ThemeToggle';
import StorageService from '../services/storageService';
import { useToast } from '../context/ToastContext';
import { FadeInView } from '../components/FadeInView';
import { useAuth } from '../context/AuthContext';

export default function SettingsScreen() {
  const { colors, theme } = useTheme();
  const { showSuccess, showError, showInfo } = useToast();
  const { isSignedIn, userEmail, signOut, clerkConfigured, isPremium, subscriptionPlan } = useAuth();
  const navigation = useNavigation<any>();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const styles = getStyles(colors);

  const handleExportData = async () => {
    try {
      const data = await StorageService.exportUserData();
      // En una app real, aquí se compartiría el archivo
      console.log('Exported data:', data);
      showSuccess('Dati esportati con successo');
    } catch (error) {
      showError('Errore durante l\'esportazione');
    }
  };

  const handleClearData = () => {
    Alert.alert(
      'Elimina Tutti i Dati',
      'Sei sicuro di voler eliminare tutti i tuoi progressi? Questa azione non può essere annullata.',
      [
        {
          text: 'Annulla',
          style: 'cancel',
        },
        {
          text: 'Elimina',
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.clearAllData();
              showSuccess('Tutti i dati sono stati eliminati');
            } catch (error) {
              showError('Errore durante l\'eliminazione');
            }
          },
        },
      ]
    );
  };

  const handleSignOut = () => {
    Alert.alert(
      'Esci',
      'Sei sicuro di voler uscire dal tuo account?',
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Esci',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              showSuccess('Sei uscito correttamente');
            } catch {
              showError('Errore durante il logout');
            }
          },
        },
      ]
    );
  };

  const handleContactSupport = () => {
    Linking.openURL('mailto:support@italiantoapp.com');
  };

  const handlePrivacyPolicy = () => {
    // Link to privacy policy
    showInfo('Apri politica sulla privacy');
  };

  const handleTermsOfService = () => {
    // Link to terms of service
    showInfo('Apri termini di servizio');
  };

  const SettingRow = ({ icon, title, subtitle, onPress, showArrow = true, rightComponent }: any) => (
    <TouchableOpacity style={styles.settingRow} onPress={onPress} disabled={!onPress && !rightComponent}>
      <View style={styles.settingLeft}>
        <View style={styles.iconContainer}>
          <Ionicons name={icon} size={24} color={colors.primary} />
        </View>
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {rightComponent || (showArrow && <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />)}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <Image source={require('../../assets/Logo_ItaliAnto.png')} style={styles.logo} resizeMode="contain" />
        <ThemeToggle />
      </View>

      <ScrollView showsVerticalScrollIndicator={true} style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Impostazioni</Text>

        {/* App Settings */}
        <FadeInView delay={100}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Aspetto</Text>

            <SettingRow
              icon="moon"
              title="Tema Scuro"
              subtitle={theme === 'dark' ? 'Attivo' : 'Disattivo'}
              rightComponent={<ThemeToggle />}
            />
          </View>
        </FadeInView>

        {/* Notifications */}
        <FadeInView delay={200}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notifiche</Text>

            <SettingRow
              icon="notifications"
              title="Notifiche Push"
              subtitle="Ricevi promemoria quotidiani"
              rightComponent={
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  trackColor={{ false: colors.border, true: colors.primaryLight }}
                  thumbColor={notificationsEnabled ? colors.primary : colors.textSecondary}
                />
              }
            />
          </View>
        </FadeInView>

        {/* Data Management */}
        <FadeInView delay={300}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Gestione Dati</Text>

            <SettingRow
              icon="download"
              title="Esporta Dati"
              subtitle="Scarica tutti i tuoi dati"
              onPress={handleExportData}
            />

            <SettingRow
              icon="trash"
              title="Elimina Tutti i Dati"
              subtitle="Cancella progresso e impostazioni"
              onPress={handleClearData}
            />
          </View>
        </FadeInView>

        {/* Account / Auth */}
        {clerkConfigured && (
          <FadeInView delay={350}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Account</Text>
              {isSignedIn ? (
                <>
                  <View style={styles.accountRow}>
                    <View style={styles.iconContainer}>
                      <Ionicons name="person-circle" size={24} color={colors.primary} />
                    </View>
                    <View style={styles.settingText}>
                      <Text style={styles.settingTitle}>Connesso come</Text>
                      <Text style={styles.settingSubtitle}>{userEmail}</Text>
                    </View>
                  </View>
                  <SettingRow
                    icon="log-out"
                    title="Esci"
                    subtitle="Disconnetti il tuo account"
                    onPress={handleSignOut}
                    showArrow={false}
                  />
                </>
              ) : (
                <>
                  <SettingRow
                    icon="log-in"
                    title="Accedi"
                    subtitle="Entra nel tuo account"
                    onPress={() => navigation.navigate('SignIn')}
                  />
                  <SettingRow
                    icon="person-add"
                    title="Registrati"
                    subtitle="Crea un nuovo account"
                    onPress={() => navigation.navigate('SignUp')}
                  />
                </>
              )}
            </View>
          </FadeInView>
        )}

        {/* Premium */}
        <FadeInView delay={400}>
          <View style={styles.premiumSection}>
            <View style={styles.premiumHeader}>
              <Ionicons name="sparkles" size={30} color="#ffd700" />
              <Text style={styles.premiumTitle}>ItaliantoApp Premium</Text>
            </View>
            {isPremium ? (
              <>
                <View style={styles.premiumActiveBadge}>
                  <Ionicons name="checkmark-circle" size={18} color="#ffd700" />
                  <Text style={styles.premiumActiveText}>
                    Piano {subscriptionPlan} attivo
                  </Text>
                </View>
                <Text style={styles.premiumDescription}>
                  Hai accesso completo al Tutor AI e a tutte le funzionalità premium!
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.premiumDescription}>
                  Ottieni accesso al Tutor AI, pratica conversazioni in italiano in tempo reale e molto altro!
                </Text>
                <TouchableOpacity
                  style={styles.premiumButton}
                  onPress={() => navigation.navigate('Paywall')}
                >
                  <Text style={styles.premiumButtonText}>Abbonati Ora</Text>
                  <Ionicons name="arrow-forward" size={20} color="#fff" />
                </TouchableOpacity>
              </>
            )}
          </View>
        </FadeInView>

        {/* Support & Legal */}
        <FadeInView delay={500}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Supporto e Legale</Text>

            <SettingRow
              icon="mail"
              title="Contatta Supporto"
              subtitle="Inviaci un'email"
              onPress={handleContactSupport}
            />

            <SettingRow
              icon="document-text"
              title="Politica sulla Privacy"
              onPress={handlePrivacyPolicy}
            />

            <SettingRow
              icon="shield-checkmark"
              title="Termini di Servizio"
              onPress={handleTermsOfService}
            />
          </View>
        </FadeInView>

        {/* App Info */}
        <FadeInView delay={600}>
          <View style={styles.appInfo}>
            <Text style={styles.appName}>ItaliantoApp</Text>
            <Text style={styles.appVersion}>Versione 1.2.0</Text>
            <Text style={styles.appCopyright}>© 2024 ItaliantoApp. Tutti i diritti riservati.</Text>
          </View>
        </FadeInView>
      </ScrollView>
    </View>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  logo: {
    width: 72,
    height: 72,
    opacity: colors.logoOpacity,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 25,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: 15,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 10,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 45,
    height: 45,
    borderRadius: 10,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  settingSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  premiumSection: {
    backgroundColor: '#667eea',
    borderRadius: 20,
    padding: 25,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#ffd700',
  },
  premiumHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 10,
  },
  premiumActiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  premiumActiveText: {
    color: '#ffd700',
    fontSize: 15,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  premiumTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  premiumDescription: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 20,
    opacity: 0.95,
  },
  premiumButton: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 2,
    borderColor: '#fff',
  },
  premiumButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  appName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 5,
  },
  appVersion: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 10,
  },
  appCopyright: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
