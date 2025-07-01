import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import Voice from '@react-native-voice/voice';
import { Ionicons } from '@expo/vector-icons';
import { PronunciationService } from '../services/pronunciationService';
import i18n from '../i18n/i18n';

export default function PronunciationScreen() {
  const [currentWord, setCurrentWord] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [score, setScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechError = onSpeechError;
    
    generateNewWord();

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const generateNewWord = () => {
    const word = PronunciationService.getRandomWord();
    setCurrentWord(word);
    setScore(null);
    setFeedback('');
    setResults([]);
  };

  const onSpeechResults = (e: any) => {
    if (e.value) {
      setResults(e.value);
      analyzePronunciation(e.value);
    }
  };

  const onSpeechError = (e: any) => {
    console.error('Speech error:', e);
    setIsListening(false);
    Alert.alert(
      i18n.t('common.error'),
      i18n.t('pronunciation.error')
    );
  };

  const analyzePronunciation = (spokenWords: string[]) => {
    setIsAnalyzing(true);
    
    setTimeout(() => {
      const result = PronunciationService.analyzePronunciation(currentWord, spokenWords);
      setScore(result.score);
      setFeedback(result.feedback);
      setIsAnalyzing(false);
    }, 1000);
  };

  const startListening = async () => {
    try {
      setIsListening(true);
      setScore(null);
      setFeedback('');
      await PronunciationService.startListening();
    } catch (error) {
      console.error('Error starting voice recognition:', error);
      setIsListening(false);
    }
  };

  const stopListening = async () => {
    try {
      setIsListening(false);
      await PronunciationService.stopListening();
    } catch (error) {
      console.error('Error stopping voice recognition:', error);
    }
  };

  const playWord = () => {
    PronunciationService.speakWord(currentWord);
  };

  const getFeedbackColor = () => {
    if (feedback === 'excellent') return '#4caf50';
    if (feedback === 'good') return '#ff9800';
    return '#f44336';
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>{i18n.t('pronunciation.title')}</Text>
      
      <Text style={styles.instructions}>{i18n.t('pronunciation.instructions')}</Text>

      <View style={styles.wordContainer}>
        <Text style={styles.wordLabel}>{i18n.t('pronunciation.currentWord')}:</Text>
        <View style={styles.wordDisplay}>
          <Text style={styles.word}>{currentWord}</Text>
          <TouchableOpacity onPress={playWord} style={styles.speakerButton}>
            <Ionicons name="volume-high" size={30} color="#2e7d32" />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.micButton,
          isListening && styles.micButtonActive
        ]}
        onPress={isListening ? stopListening : startListening}
        disabled={isAnalyzing}
      >
        <Ionicons 
          name={isListening ? "mic" : "mic-outline"} 
          size={50} 
          color="#fff" 
        />
        <Text style={styles.micButtonText}>
          {isListening 
            ? i18n.t('pronunciation.stopRecording')
            : i18n.t('pronunciation.startRecording')
          }
        </Text>
      </TouchableOpacity>

      {isListening && (
        <Text style={styles.listeningText}>{i18n.t('pronunciation.listening')}</Text>
      )}

      {isAnalyzing && (
        <View style={styles.analyzingContainer}>
          <ActivityIndicator size="large" color="#2e7d32" />
          <Text style={styles.analyzingText}>{i18n.t('pronunciation.analyzing')}</Text>
        </View>
      )}

      {score !== null && !isAnalyzing && (
        <View style={styles.resultContainer}>
          <Text style={styles.scoreLabel}>{i18n.t('pronunciation.score')}:</Text>
          <Text style={[styles.score, { color: getFeedbackColor() }]}>{score}%</Text>
          <Text style={[styles.feedback, { color: getFeedbackColor() }]}>
            {i18n.t(`pronunciation.${feedback}`)}
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.nextButton}
        onPress={generateNewWord}
      >
        <Text style={styles.nextButtonText}>{i18n.t('pronunciation.nextWord')}</Text>
        <Ionicons name="arrow-forward" size={20} color="#fff" />
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2e7d32',
    textAlign: 'center',
    marginBottom: 20,
  },
  instructions: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  wordContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  wordLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  wordDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 30,
    paddingVertical: 20,
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  word: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginRight: 20,
  },
  speakerButton: {
    padding: 10,
  },
  micButton: {
    backgroundColor: '#2e7d32',
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  micButtonActive: {
    backgroundColor: '#d32f2f',
  },
  micButtonText: {
    color: '#fff',
    fontSize: 14,
    marginTop: 5,
  },
  listeningText: {
    fontSize: 16,
    color: '#d32f2f',
    fontStyle: 'italic',
    marginBottom: 20,
  },
  analyzingContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  analyzingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
  resultContainer: {
    alignItems: 'center',
    marginBottom: 30,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  scoreLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  score: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  feedback: {
    fontSize: 20,
    fontWeight: '600',
  },
  nextButton: {
    flexDirection: 'row',
    backgroundColor: '#2e7d32',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 10,
  },
});