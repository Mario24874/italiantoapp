import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { ConjugationService } from '../services/conjugationService';
import { useTheme } from '../context/ThemeContext';
import { ThemeToggle } from '../components/ThemeToggle';
import { useUserProgress } from '../hooks/useUserProgress';
import { VerbTense } from '../types';
import i18n from '../i18n/i18n';

export default function ConjugatorScreen() {
  const { colors } = useTheme();
  const { addConjugation } = useUserProgress();
  const [verb, setVerb] = useState('');
  const [selectedTense, setSelectedTense] = useState<VerbTense>('presente');
  const [conjugation, setConjugation] = useState<any>(null);
  const [error, setError] = useState('');

  const styles = getStyles(colors);

  const handleConjugate = async () => {
    if (!verb.trim()) return;

    setError('');
    
    try {
      const result = ConjugationService.conjugate(verb.toLowerCase().trim(), selectedTense);
      setConjugation(result);
      
      // Guardar estadística de conjugación
      await addConjugation();
    } catch (err) {
      setError('Verbo non valido. Inserisci un verbo che termina in -are, -ere o -ire');
      setConjugation(null);
    }
  };

  const pronouns = ['io', 'tu', 'lui/lei', 'noi', 'voi', 'loro'];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header con logo y toggle de tema */}
        <View style={styles.headerContainer}>
          <Image source={require('../../assets/Logo_ItaliAnto.png')} style={styles.logo} resizeMode="contain" />
          <ThemeToggle />
        </View>
        
        <Text style={styles.title}>{i18n.t('conjugator.title')}</Text>

        <TextInput
          style={styles.input}
          placeholder={i18n.t('conjugator.inputPlaceholder')}
          value={verb}
          onChangeText={setVerb}
          autoCapitalize="none"
        />

        <View style={styles.pickerContainer}>
          <Text style={styles.label}>{i18n.t('conjugator.selectTime')}:</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={selectedTense}
              onValueChange={setSelectedTense}
              style={styles.picker}
            >
              <Picker.Item label={i18n.t('conjugator.tenses.presente')} value="presente" />
              <Picker.Item label={i18n.t('conjugator.tenses.passatoProssimo')} value="passatoProssimo" />
              <Picker.Item label={i18n.t('conjugator.tenses.imperfetto')} value="imperfetto" />
              <Picker.Item label={i18n.t('conjugator.tenses.futuroSemplice')} value="futuroSemplice" />
              <Picker.Item label={i18n.t('conjugator.tenses.condizionale')} value="condizionale" />
              <Picker.Item label={i18n.t('conjugator.tenses.congiuntivo')} value="congiuntivo" />
            </Picker>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, !verb.trim() && styles.buttonDisabled]}
          onPress={handleConjugate}
          disabled={!verb.trim()}
        >
          <Text style={styles.buttonText}>{i18n.t('conjugator.conjugateButton')}</Text>
        </TouchableOpacity>

        {error ? (
          <Text style={styles.error}>{error}</Text>
        ) : null}

        {conjugation && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultTitle}>{conjugation.verb}</Text>
            <Text style={styles.tenseTitle}>{i18n.t(`conjugator.tenses.${conjugation.tense}`)}</Text>
            
            <View style={styles.conjugationGrid}>
              {pronouns.map((pronoun, index) => {
                const key = pronoun === 'lui/lei' ? 'lui_lei' : pronoun;
                return (
                  <View key={index} style={styles.conjugationRow}>
                    <Text style={styles.pronoun}>{pronoun}:</Text>
                    <Text style={styles.conjugatedForm}>
                      {conjugation.conjugations[key]}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 10,
  },
  logo: {
    width: 56,
    height: 56,
    opacity: colors.logoOpacity,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    backgroundColor: colors.inputBackground,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    padding: 15,
    fontSize: 16,
    marginBottom: 20,
    color: colors.text,
  },
  pickerContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 8,
    fontWeight: '600',
  },
  pickerWrapper: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    color: colors.text,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 25,
    padding: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: colors.buttonDisabled,
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  error: {
    color: colors.error,
    textAlign: 'center',
    marginBottom: 20,
  },
  resultContainer: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 10,
  },
  tenseTitle: {
    fontSize: 18,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  conjugationGrid: {
    marginTop: 10,
  },
  conjugationRow: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'center',
  },
  pronoun: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    width: 80,
  },
  conjugatedForm: {
    fontSize: 18,
    color: colors.primary,
    flex: 1,
  },
});