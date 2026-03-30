import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  FlatList,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { PronunciationService } from '../services/pronunciationService';
import { VoiceService } from '../services/voiceService';
import { useTheme } from '../context/ThemeContext';
import { ThemeToggle } from '../components/ThemeToggle';
import { useUserProgress } from '../hooks/useUserProgress';
import { AnimatedButton } from '../components/AnimatedButton';
import { SuccessAnimation } from '../components/SuccessAnimation';
import { FadeInView } from '../components/FadeInView';
import i18n from '../i18n/i18n';

type PracticeMode = 'random' | 'selected';

export default function PronunciationScreen() {
  const { colors } = useTheme();
  const { updatePronunciation } = useUserProgress();
  const [currentWord, setCurrentWord] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [score, setScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [practiceMode, setPracticeMode] = useState<PracticeMode>('random');
  const [showWordSelector, setShowWordSelector] = useState(false);
  const [availableWords] = useState(PronunciationService.getAllWords());
  const [showSuccess, setShowSuccess] = useState(false);

  const styles = getStyles(colors);

  useEffect(() => {
    const initializeVoice = async () => {
      try {
        await VoiceService.initialize();
        console.log('Voice service initialized');
      } catch (error) {
        console.error('Error initializing voice:', error);
        Alert.alert(
          'Errore di inizializzazione',
          'Errore nell\'inizializzazione del riconoscimento vocale. Verifica i permessi del microfono.'
        );
      }
    };
    
    initializeVoice();
    generateNewWord();

    return () => {
      VoiceService.cleanup();
    };
  }, []);

  const generateNewWord = () => {
    if (practiceMode === 'random') {
      const word = PronunciationService.getRandomWord();
      setCurrentWord(word);
    }
    setScore(null);
    setFeedback('');
    setResults([]);
  };

  const selectWord = (word: string) => {
    setCurrentWord(word);
    setScore(null);
    setFeedback('');
    setResults([]);
    setShowWordSelector(false);
  };

  const onSpeechResults = (results: string[]) => {
    if (results && results.length > 0) {
      setResults(results);
      analyzePronunciation(results);
    }
  };

  const onSpeechError = (error: any) => {
    console.error('Speech error:', error);
    setIsListening(false);
    setIsAnalyzing(false);

    // ELIMINADO: Puntaje mínimo automático
    // Simplemente informar al usuario del error
    setTimeout(() => {
      if (results.length === 0) {
        Alert.alert(
          'Errore di riconoscimento',
          'Non ho rilevato alcuna parola. Prova a parlare più chiaramente e vicino al microfono.'
        );
      }
    }, 500);

    console.log('Voice error handled');
  };

  const analyzePronunciation = async (spokenWords: string[]) => {
    setIsAnalyzing(true);
    
    setTimeout(async () => {
      const result = PronunciationService.analyzePronunciation(currentWord, spokenWords);
      setScore(result.score);
      setFeedback(result.feedback);
      setIsAnalyzing(false);
      
      // Guardar estadísticas de pronunciación
      await updatePronunciation(currentWord, result.score);

      // Mostrar animación de éxito solo si la pronunciación es excelente (95+)
      if (result.score >= 95) {
        setShowSuccess(true);
      }
    }, 1000);
  };

  const startListening = async () => {
    try {
      // Resetear estados
      setScore(null);
      setFeedback('');
      setResults([]);
      setIsAnalyzing(false);
      
      await VoiceService.startListening({
        onResults: onSpeechResults,
        onError: onSpeechError,
        onStart: () => {
          console.log('Voice started');
          setIsListening(true);
        },
        onEnd: () => {
          console.log('Voice ended');
          setIsListening(false);
        }
      });
      
    } catch (error) {
      console.error('Error starting voice recognition:', error);
      setIsListening(false);
      Alert.alert(
        i18n.t('common.error'),
        'Error al iniciar el reconocimiento de voz'
      );
    }
  };

  const stopListening = async () => {
    try {
      await VoiceService.stopListening();

      // ELIMINADO: Puntaje mínimo automático
      // Si no hay resultados, simplemente informar
      setTimeout(() => {
        if (results.length === 0 && !isAnalyzing) {
          Alert.alert(
            'Nessuna parola rilevata',
            'Assicurati di pronunciare la parola chiaramente. Puoi ascoltare la pronuncia corretta toccando l\'icona dell\'altoparlante.'
          );
        }
      }, 1500);

    } catch (error) {
      console.error('Error stopping voice recognition:', error);
    }
  };

  const playWord = async () => {
    try {
      await PronunciationService.speakWord(currentWord);
    } catch (error) {
      console.error('Error playing word:', error);
      Alert.alert(
        'Errore audio',
        'Impossibile riprodurre l\'audio. Verifica le impostazioni audio del dispositivo.'
      );
    }
  };

  const getFeedbackColor = () => {
    if (feedback === 'excellent') return '#4caf50';
    if (feedback === 'good') return '#ff9800';
    return '#f44336';
  };

  const renderWordItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.wordItem}
      onPress={() => selectWord(item)}
    >
      <Text style={styles.wordItemText}>{item}</Text>
      <TouchableOpacity
        onPress={() => PronunciationService.speakWord(item)}
        style={styles.wordPlayButton}
      >
        <Ionicons name="play" size={16} color="#2e7d32" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <SuccessAnimation 
        visible={showSuccess} 
        onAnimationComplete={() => setShowSuccess(false)}
        color={colors.success} 
      />
      
      {/* Header con logo y toggle de tema */}
      <View style={styles.headerContainer}>
        <Image source={require('../../assets/Logo_ItaliAnto.png')} style={styles.logo} resizeMode="contain" />
        <ThemeToggle />
      </View>

      <Text style={styles.title}>{i18n.t('pronunciation.title')}</Text>
      
      <Text style={styles.instructions}>{i18n.t('pronunciation.instructions')}</Text>

      {/* Selector de modo */}
      <View style={styles.modeContainer}>
        <View style={styles.modeButtons}>
          <TouchableOpacity
            style={[styles.modeButton, practiceMode === 'random' && styles.modeButtonActive]}
            onPress={() => {
              setPracticeMode('random');
              generateNewWord();
            }}
          >
            <Ionicons name="shuffle" size={20} color={practiceMode === 'random' ? '#fff' : '#2e7d32'} />
            <Text style={[styles.modeButtonText, practiceMode === 'random' && styles.modeButtonTextActive]}>
              Casuale
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modeButton, practiceMode === 'selected' && styles.modeButtonActive]}
            onPress={() => {
              setPracticeMode('selected');
              setShowWordSelector(true);
            }}
          >
            <Ionicons name="list" size={20} color={practiceMode === 'selected' ? '#fff' : '#2e7d32'} />
            <Text style={[styles.modeButtonText, practiceMode === 'selected' && styles.modeButtonTextActive]}>
              Scegli
            </Text>
          </TouchableOpacity>
        </View>
      </View>

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
          size={60} 
          color="#fff" 
        />
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

      {practiceMode === 'random' && (
        <FadeInView delay={500}>
          <AnimatedButton
            title={i18n.t('pronunciation.nextWord')}
            onPress={generateNewWord}
            style={styles.nextButton}
            backgroundColor={colors.primaryLight}
          />
        </FadeInView>
      )}

      {/* Modal selector de palabras */}
      <Modal
        visible={showWordSelector}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Scegli una parola</Text>
            <TouchableOpacity
              onPress={() => setShowWordSelector(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={availableWords}
            renderItem={renderWordItem}
            keyExtractor={(item) => item}
            style={styles.wordList}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </Modal>
    </ScrollView>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: 20,
    alignItems: 'center',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
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
    marginBottom: 20,
  },
  instructions: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  modeContainer: {
    marginBottom: 20,
  },
  modeButtons: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 25,
    padding: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  modeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginHorizontal: 2,
  },
  modeButtonActive: {
    backgroundColor: '#2e7d32',
  },
  modeButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#2e7d32',
  },
  modeButtonTextActive: {
    color: '#fff',
  },
  wordContainer: {
    alignItems: 'center',
    marginBottom: 30,
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
  modalContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  closeButton: {
    padding: 5,
  },
  wordList: {
    flex: 1,
    padding: 10,
  },
  wordItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 5,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  wordItemText: {
    fontSize: 18,
    color: '#333',
    flex: 1,
  },
  wordPlayButton: {
    padding: 10,
    backgroundColor: '#f0f8f0',
    borderRadius: 20,
  },
});