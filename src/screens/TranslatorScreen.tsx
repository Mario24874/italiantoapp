import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { TranslationService } from '../services/translationService';
import { useTheme } from '../context/ThemeContext';
import { ThemeToggle } from '../components/ThemeToggle';
import { useUserProgress } from '../hooks/useUserProgress';
import { Language } from '../types';
import i18n from '../i18n/i18n';

export default function TranslatorScreen() {
  const { colors } = useTheme();
  const { addTranslation } = useUserProgress();
  const [sourceLanguage, setSourceLanguage] = useState<Language>('es');
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const styles = getStyles(colors);

  const handleTranslate = async () => {
    if (!inputText.trim()) return;

    setIsLoading(true);
    setError('');
    
    try {
      const result = await TranslationService.translate(inputText, sourceLanguage);
      setTranslatedText(result);
      
      // Guardar en historial si la traducción fue exitosa
      if (result && !result.includes('non trovato') && !result.includes('not found')) {
        await addTranslation(inputText.trim(), result, sourceLanguage);
      }
    } catch (err) {
      setError(i18n.t('translator.error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header con logo y toggle de tema */}
        <View style={styles.headerContainer}>
          <Image source={require('../../assets/Logo_ItaliAnto.png')} style={styles.logo} />
          <ThemeToggle />
        </View>
        
        <Text style={styles.title}>{i18n.t('translator.title')}</Text>

        <View style={styles.languageSelector}>
          <Text style={styles.label}>{i18n.t('translator.sourceLang')}:</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={sourceLanguage}
              onValueChange={setSourceLanguage}
              style={styles.picker}
            >
              <Picker.Item label={i18n.t('translator.spanish')} value="es" />
              <Picker.Item label={i18n.t('translator.english')} value="en" />
            </Picker>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder={i18n.t('translator.inputPlaceholder')}
            value={inputText}
            onChangeText={setInputText}
            multiline
            numberOfLines={4}
          />
          {inputText.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => {
                setInputText('');
                setTranslatedText('');
                setError('');
              }}
            >
              <Ionicons name="close-circle" size={24} color="#999" />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleTranslate}
          disabled={isLoading || !inputText.trim()}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>{i18n.t('translator.translateButton')}</Text>
          )}
        </TouchableOpacity>

        {error ? (
          <Text style={styles.error}>{error}</Text>
        ) : null}

        {translatedText ? (
          <View style={styles.resultContainer}>
            <Text style={styles.resultLabel}>{i18n.t('translator.translatedText')}:</Text>
            <Text style={styles.resultText}>{translatedText}</Text>
          </View>
        ) : null}
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
    width: 40,
    height: 40,
    opacity: colors.logoOpacity,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 30,
  },
  languageSelector: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 8,
    fontWeight: '600',
  },
  pickerContainer: {
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
  inputContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  input: {
    backgroundColor: colors.inputBackground,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    padding: 15,
    paddingRight: 50,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    color: colors.text,
  },
  clearButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    padding: 5,
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
  resultLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 10,
  },
  resultText: {
    fontSize: 18,
    color: colors.primary,
    fontStyle: 'italic',
  },
});