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
  Image,
  Clipboard,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { TranslationService } from '../services/translationService';
import { useTheme } from '../context/ThemeContext';
import { ThemeToggle } from '../components/ThemeToggle';
import { useUserProgress } from '../hooks/useUserProgress';
import { Language } from '../types';
import { useToast } from '../context/ToastContext';

export default function TranslatorScreen() {
  const { colors } = useTheme();
  const { addTranslation } = useUserProgress();
  const { showError, showSuccess } = useToast();
  const [sourceLanguage, setSourceLanguage] = useState<Language>('es');
  const [targetLanguage, setTargetLanguage] = useState<Language>('it');
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const styles = getStyles(colors);

  const handleTranslate = async () => {
    if (!inputText.trim()) return;

    if (sourceLanguage === targetLanguage) {
      showError('I linguaggi di origine e destinazione devono essere diversi');
      return;
    }

    setIsLoading(true);

    try {
      const result = await TranslationService.translateBidirectional(
        inputText,
        sourceLanguage,
        targetLanguage
      );
      setTranslatedText(result);

      // Guardar en historial si la traducción fue exitosa y el destino es italiano
      if (result && !result.includes('non trovato') && !result.includes('not found')) {
        // Solo guardar si estamos traduciendo HACIA italiano (es o en como fuente)
        if (targetLanguage === 'it' && (sourceLanguage === 'es' || sourceLanguage === 'en')) {
          await addTranslation(inputText.trim(), result, sourceLanguage as 'es' | 'en');
        }
        showSuccess('Traduzione completata!');
      }
    } catch (err) {
      showError('Errore durante la traduzione');
      setTranslatedText('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwapLanguages = () => {
    // Intercambia los idiomas
    const temp = sourceLanguage;
    setSourceLanguage(targetLanguage);
    setTargetLanguage(temp);

    // Intercambia los textos
    const tempText = inputText;
    setInputText(translatedText);
    setTranslatedText(tempText);
  };

  const getLanguageName = (lang: Language): string => {
    switch (lang) {
      case 'es': return 'Spagnolo';
      case 'en': return 'Inglese';
      case 'it': return 'Italiano';
      default: return '';
    }
  };

  const getLanguageFlag = (lang: Language): string => {
    switch (lang) {
      case 'es': return '🇪🇸';
      case 'en': return '🇬🇧';
      case 'it': return '🇮🇹';
      default: return '';
    }
  };

  const handleCopy = () => {
    if (!translatedText) return;
    if (Platform.OS === 'web') {
      (navigator as any).clipboard?.writeText(translatedText);
    } else {
      Clipboard.setString(translatedText);
    }
    showSuccess('Testo copiato!');
  };

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

        <Text style={styles.title}>Traduttore</Text>
        <Text style={styles.subtitle}>Traduci tra italiano, spagnolo e inglese</Text>

        {/* Language selectors with swap button */}
        <View style={styles.languageContainer}>
          {/* Source language */}
          <View style={styles.languageBox}>
            <Text style={styles.label}>
              {getLanguageFlag(sourceLanguage)} {getLanguageName(sourceLanguage)}
            </Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={sourceLanguage}
                onValueChange={(value) => {
                  if (value !== targetLanguage) {
                    setSourceLanguage(value);
                  } else {
                    showError('Seleziona un linguaggio diverso dalla destinazione');
                  }
                }}
                style={styles.picker}
              >
                <Picker.Item label="🇪🇸 Spagnolo" value="es" />
                <Picker.Item label="🇬🇧 Inglese" value="en" />
                <Picker.Item label="🇮🇹 Italiano" value="it" />
              </Picker>
            </View>
          </View>

          {/* Swap button */}
          <TouchableOpacity style={styles.swapButton} onPress={handleSwapLanguages} activeOpacity={0.8}>
            <Ionicons name="swap-horizontal" size={22} color="#fff" />
          </TouchableOpacity>

          {/* Target language */}
          <View style={styles.languageBox}>
            <Text style={styles.label}>
              {getLanguageFlag(targetLanguage)} {getLanguageName(targetLanguage)}
            </Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={targetLanguage}
                onValueChange={(value) => {
                  if (value !== sourceLanguage) {
                    setTargetLanguage(value);
                  } else {
                    showError('Seleziona un linguaggio diverso dall\'origine');
                  }
                }}
                style={styles.picker}
              >
                <Picker.Item label="🇪🇸 Spagnolo" value="es" />
                <Picker.Item label="🇬🇧 Inglese" value="en" />
                <Picker.Item label="🇮🇹 Italiano" value="it" />
              </Picker>
            </View>
          </View>
        </View>

        {/* Input text */}
        <View style={styles.inputContainer}>
          <View style={styles.inputHeader}>
            <Text style={styles.inputLabel}>{getLanguageName(sourceLanguage)}</Text>
            {inputText.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setInputText('');
                  setTranslatedText('');
                }}
              >
                <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
          <TextInput
            style={styles.input}
            placeholder={`Scrivi in ${getLanguageName(sourceLanguage).toLowerCase()}...`}
            placeholderTextColor={colors.textSecondary}
            value={inputText}
            onChangeText={setInputText}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Translate button */}
        <TouchableOpacity
          style={[styles.button, (!inputText.trim() || isLoading) && styles.buttonDisabled]}
          onPress={handleTranslate}
          disabled={!inputText.trim() || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="language" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.buttonText}>Traduci</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Result */}
        {translatedText ? (
          <View style={styles.resultContainer}>
            <View style={styles.resultHeader}>
              <Text style={styles.resultLabel}>{getLanguageName(targetLanguage)}</Text>
              <TouchableOpacity onPress={handleCopy}>
                <Ionicons name="copy-outline" size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.resultText}>{translatedText}</Text>
          </View>
        ) : null}

        {/* Quick actions hint */}
        <View style={styles.hintContainer}>
          <Ionicons name="information-circle-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.hintText}>
            Tocca 🔄 per scambiare le lingue
          </Text>
        </View>
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
    width: 72,
    height: 72,
    opacity: colors.logoOpacity,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 25,
  },
  languageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  languageBox: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 8,
    fontWeight: '600',
  },
  pickerContainer: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  picker: {
    height: 50,
    color: colors.text,
  },
  swapButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
    marginTop: 22,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  input: {
    backgroundColor: colors.inputBackground,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.inputBorder,
    padding: 15,
    fontSize: 16,
    minHeight: 110,
    textAlignVertical: 'top',
    color: colors.text,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    elevation: 5,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
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
  resultContainer: {
    backgroundColor: colors.surface,
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  resultText: {
    fontSize: 18,
    color: colors.primary,
    lineHeight: 26,
  },
  hintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    gap: 8,
  },
  hintText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
});
