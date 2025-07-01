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
  Platform
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { TranslationService } from '../services/translationService';
import { Language } from '../types';
import i18n from '../i18n/i18n';

export default function TranslatorScreen() {
  const [sourceLanguage, setSourceLanguage] = useState<Language>('es');
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTranslate = async () => {
    if (!inputText.trim()) return;

    setIsLoading(true);
    setError('');
    
    try {
      const result = await TranslationService.translate(inputText, sourceLanguage);
      setTranslatedText(result);
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

        <TextInput
          style={styles.input}
          placeholder={i18n.t('translator.inputPlaceholder')}
          value={inputText}
          onChangeText={setInputText}
          multiline
          numberOfLines={4}
        />

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2e7d32',
    textAlign: 'center',
    marginBottom: 30,
  },
  languageSelector: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    fontWeight: '600',
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    fontSize: 16,
    marginBottom: 20,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#2e7d32',
    borderRadius: 25,
    padding: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  error: {
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 20,
  },
  resultContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  resultLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  resultText: {
    fontSize: 18,
    color: '#2e7d32',
    fontStyle: 'italic',
  },
});