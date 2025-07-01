import Voice from '@react-native-voice/voice';
import * as Speech from 'expo-speech';
import { PronunciationResult } from '../types';

export class PronunciationService {
  private static italianWords = [
    'ciao', 'buongiorno', 'arrivederci', 'grazie', 'prego',
    'scusi', 'per favore', 'mi dispiace', 'come stai', 'bene',
    'amore', 'famiglia', 'amico', 'casa', 'lavoro',
    'mangiare', 'bere', 'dormire', 'parlare', 'studiare',
    'bellissimo', 'delizioso', 'fantastico', 'meraviglioso', 'perfetto'
  ];

  static getRandomWord(): string {
    const randomIndex = Math.floor(Math.random() * this.italianWords.length);
    return this.italianWords[randomIndex];
  }

  static async speakWord(word: string): Promise<void> {
    await Speech.speak(word, {
      language: 'it-IT',
      pitch: 1.0,
      rate: 0.8
    });
  }

  static async startListening(): Promise<void> {
    try {
      await Voice.start('it-IT');
    } catch (error) {
      console.error('Error starting voice recognition:', error);
      throw error;
    }
  }

  static async stopListening(): Promise<void> {
    try {
      await Voice.stop();
    } catch (error) {
      console.error('Error stopping voice recognition:', error);
      throw error;
    }
  }

  static calculateScore(targetWord: string, spokenWord: string): number {
    const target = targetWord.toLowerCase().trim();
    const spoken = spokenWord.toLowerCase().trim();

    if (target === spoken) {
      return 100;
    }

    // Calcular similitud básica
    const minLength = Math.min(target.length, spoken.length);
    const maxLength = Math.max(target.length, spoken.length);
    let matches = 0;

    for (let i = 0; i < minLength; i++) {
      if (target[i] === spoken[i]) {
        matches++;
      }
    }

    const similarity = (matches / maxLength) * 100;
    return Math.round(similarity);
  }

  static getFeedback(score: number): string {
    if (score >= 90) return 'excellent';
    if (score >= 70) return 'good';
    return 'tryAgain';
  }

  static analyzePronunciation(targetWord: string, spokenWords: string[]): PronunciationResult {
    let bestScore = 0;
    let bestMatch = '';

    for (const word of spokenWords) {
      const score = this.calculateScore(targetWord, word);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = word;
      }
    }

    return {
      word: targetWord,
      userPronunciation: bestMatch,
      score: bestScore,
      feedback: this.getFeedback(bestScore)
    };
  }
}