import Voice from '@react-native-voice/voice';
import * as Speech from 'expo-speech';
import { PronunciationResult } from '../types';
import { ErrorHandler } from '../utils/errorHandler';

export class PronunciationService {
  private static italianWords = [
    // Saludos básicos
    'ciao', 'buongiorno', 'buonasera', 'buonanotte', 'arrivederci',
    // Cortesía
    'grazie', 'prego', 'scusi', 'per favore', 'mi dispiace',
    // Estados y sentimientos
    'bene', 'male', 'così così', 'felice', 'triste',
    // Familia
    'famiglia', 'madre', 'padre', 'fratello', 'sorella', 'figlio', 'figlia',
    // Casa
    'casa', 'camera', 'cucina', 'bagno', 'giardino',
    // Comida
    'mangiare', 'bere', 'pizza', 'pasta', 'gelato', 'caffè', 'acqua',
    // Acciones
    'parlare', 'studiare', 'lavorare', 'dormire', 'camminare',
    // Adjetivos
    'bello', 'brutto', 'grande', 'piccolo', 'buono', 'cattivo',
    // Números
    'uno', 'due', 'tre', 'quattro', 'cinque', 'sei', 'sette', 'otto', 'nove', 'dieci',
    // Colores
    'rosso', 'blu', 'verde', 'giallo', 'nero', 'bianco',
    // Días
    'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato', 'domenica',
    // Animales
    'cane', 'gatto', 'pesce', 'uccello',
    // Otros
    'amore', 'amico', 'lavoro', 'scuola', 'libro', 'macchina'
  ];

  static getAllWords(): string[] {
    return [...this.italianWords];
  }

  static getRandomWord(): string {
    const randomIndex = Math.floor(Math.random() * this.italianWords.length);
    return this.italianWords[randomIndex];
  }

  static async speakWord(word: string): Promise<void> {
    await Speech.speak(word, {
      language: 'it-IT',
      pitch: 1.0,
      rate: 0.7
    });
  }

  static async startListening(): Promise<void> {
    try {
      return await ErrorHandler.retryOperation(async () => {
        await Voice.start('it-IT');
      }, 2, 500);
    } catch (error) {
      ErrorHandler.logError(error as Error, 'PronunciationService.startListening');
      throw new Error(ErrorHandler.handleVoiceError(error));
    }
  }

  static async stopListening(): Promise<void> {
    try {
      await Voice.stop();
      await Voice.cancel();
    } catch (error) {
      ErrorHandler.logError(error as Error, 'PronunciationService.stopListening');
      throw new Error(ErrorHandler.handleVoiceError(error));
    }
  }

  static async cancelListening(): Promise<void> {
    try {
      await Voice.cancel();
    } catch (error) {
      ErrorHandler.logError(error as Error, 'PronunciationService.cancelListening');
    }
  }

  static calculateScore(targetWord: string, spokenWord: string): number {
    const target = targetWord.toLowerCase().trim();
    const spoken = spokenWord.toLowerCase().trim();

    // Coincidencia exacta
    if (target === spoken) {
      return 100;
    }

    // Verificar si el spoken contiene el target completamente
    if (spoken.includes(target) && spoken.length <= target.length + 2) {
      return 95;
    }

    // Análisis fonético mejorado para italiano
    const targetPhonetic = this.toPhoneticItalian(target);
    const spokenPhonetic = this.toPhoneticItalian(spoken);

    // Si la pronunciación fonética es muy similar
    if (targetPhonetic === spokenPhonetic) {
      return 90;
    }

    // Calcular similitud usando distancia de Levenshtein con ponderación
    const distance = this.levenshteinDistance(target, spoken);
    const phoneticDistance = this.levenshteinDistance(targetPhonetic, spokenPhonetic);
    
    const maxLength = Math.max(target.length, spoken.length);
    if (maxLength === 0) return 30; // Mínimo si intentó hablar
    
    // Combinar similitud literal y fonética
    const literalSimilarity = ((maxLength - distance) / maxLength) * 100;
    const phoneticSimilarity = ((maxLength - phoneticDistance) / maxLength) * 100;
    
    // Ponderar más la similitud fonética (60%) sobre la literal (40%)
    let baseScore = (literalSimilarity * 0.4) + (phoneticSimilarity * 0.6);
    
    // Bonus por características específicas del italiano
    let bonus = 0;
    
    // Bonus por acento correcto en las últimas sílabas
    if (this.checkItalianAccentPattern(target, spoken)) {
      bonus += 10;
    }
    
    // Bonus por consonantes dobles correctas
    if (this.checkDoubleConsonants(target, spoken)) {
      bonus += 5;
    }
    
    // Penalización por errores graves de pronunciación
    if (this.hasSevereErrors(target, spoken)) {
      baseScore *= 0.7;
    }
    
    const finalScore = Math.min(100, baseScore + bonus);
    
    // Asegurar un mínimo de 35% si el usuario hizo un intento genuino
    if (spoken.length >= target.length * 0.5 && finalScore < 35) {
      return 35;
    }
    
    return Math.max(20, Math.round(finalScore));
  }

  private static levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  private static toPhoneticItalian(word: string): string {
    // Conversión fonética simplificada para italiano
    let phonetic = word.toLowerCase();
    
    // Reglas fonéticas del italiano
    phonetic = phonetic.replace(/gli/g, 'ʎi');
    phonetic = phonetic.replace(/gn/g, 'ɲ');
    phonetic = phonetic.replace(/sc[ei]/g, 'ʃ');
    phonetic = phonetic.replace(/c[ei]/g, 'tʃ');
    phonetic = phonetic.replace(/g[ei]/g, 'dʒ');
    phonetic = phonetic.replace(/ch/g, 'k');
    phonetic = phonetic.replace(/gh/g, 'g');
    phonetic = phonetic.replace(/qu/g, 'kw');
    phonetic = phonetic.replace(/z/g, 'ts');
    
    // Vocales acentuadas
    phonetic = phonetic.replace(/[àá]/g, 'a');
    phonetic = phonetic.replace(/[èé]/g, 'e');
    phonetic = phonetic.replace(/[ìí]/g, 'i');
    phonetic = phonetic.replace(/[òó]/g, 'o');
    phonetic = phonetic.replace(/[ùú]/g, 'u');
    
    return phonetic;
  }

  private static checkItalianAccentPattern(target: string, spoken: string): boolean {
    // Verificar si el patrón de acentuación es correcto (simplificado)
    const targetVowels = target.match(/[aeiouàèìòù]/gi) || [];
    const spokenVowels = spoken.match(/[aeiouàèìòù]/gi) || [];
    
    if (targetVowels.length === 0 || spokenVowels.length === 0) return false;
    
    // Comparar las últimas 2 vocales (donde suele estar el acento en italiano)
    const targetEnd = targetVowels.slice(-2).join('');
    const spokenEnd = spokenVowels.slice(-2).join('');
    
    return targetEnd.toLowerCase() === spokenEnd.toLowerCase();
  }

  private static checkDoubleConsonants(target: string, spoken: string): boolean {
    // Verificar consonantes dobles
    const targetDoubles = target.match(/([bcdfglmnprstvz])\1/g) || [];
    const spokenDoubles = spoken.match(/([bcdfglmnprstvz])\1/g) || [];
    
    if (targetDoubles.length === 0) return true; // No hay dobles que verificar
    
    // Verificar que al menos el 70% de las dobles estén correctas
    let correctDoubles = 0;
    for (const double of targetDoubles) {
      if (spoken.includes(double)) {
        correctDoubles++;
      }
    }
    
    return (correctDoubles / targetDoubles.length) >= 0.7;
  }

  private static hasSevereErrors(target: string, spoken: string): boolean {
    // Detectar errores graves de pronunciación
    const severeErrors = [
      // Confundir 'c' suave con 'c' dura
      { target: /c[ei]/, spoken: /k[ei]/ },
      { target: /ch/, spoken: /tʃ/ },
      // Confundir 'g' suave con 'g' dura
      { target: /g[ei]/, spoken: /g[ei]/ },
      { target: /gh/, spoken: /dʒ/ },
      // Omitir consonantes dobles completamente
      { target: /([bcdfglmnprstvz])\1/, spoken: /[^$1]/ }
    ];
    
    for (const error of severeErrors) {
      if (target.match(error.target) && !spoken.match(error.target)) {
        return true;
      }
    }
    
    return false;
  }

  private static hasSimilarSounds(target: string, spoken: string): boolean {
    // Sonidos similares en italiano
    const soundMap: Record<string, string[]> = {
      'c': ['k', 'ch'],
      'g': ['gh', 'j'],
      'gl': ['li'],
      'gn': ['ni', 'ny'],
      'sc': ['sh'],
      'z': ['ts', 'dz']
    };

    for (const [sound, alternatives] of Object.entries(soundMap)) {
      if (target.includes(sound) && alternatives.some(alt => spoken.includes(alt))) {
        return true;
      }
    }
    
    return false;
  }

  static getFeedback(score: number): string {
    if (score >= 85) return 'excellent';
    if (score >= 65) return 'good';
    return 'tryAgain';
  }

  static analyzePronunciation(targetWord: string, spokenWords: string[]): PronunciationResult {
    if (!spokenWords || spokenWords.length === 0) {
      return {
        word: targetWord,
        userPronunciation: '',
        score: 0,
        feedback: 'tryAgain'
      };
    }

    let bestScore = 0;
    let bestMatch = '';
    const scores: number[] = [];

    // Analizar todas las palabras detectadas
    for (const word of spokenWords) {
      const cleanWord = word.trim();
      if (cleanWord) {
        const score = this.calculateScore(targetWord, cleanWord);
        scores.push(score);
        
        if (score > bestScore) {
          bestScore = score;
          bestMatch = cleanWord;
        }
      }
    }

    // Si hay múltiples intentos, considerar el promedio para ser más justo
    if (scores.length > 1) {
      const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
      // Si el promedio es significativamente mejor que el mejor individual, ajustar
      if (avgScore > bestScore * 0.8) {
        bestScore = Math.min(100, bestScore + 5);
      }
    }

    // Ajustes basados en la longitud de la palabra
    const wordLength = targetWord.length;
    if (wordLength <= 3 && bestScore < 50 && bestMatch.length > 0) {
      // Palabras cortas son más difíciles de reconocer
      bestScore = Math.min(100, bestScore + 15);
    } else if (wordLength >= 8 && bestScore > 60) {
      // Palabras largas bien pronunciadas merecen bonus
      bestScore = Math.min(100, bestScore + 5);
    }

    // Si el usuario intentó pero el reconocimiento falló, dar crédito parcial
    if (bestScore < 30 && spokenWords.length > 0 && spokenWords.some(w => w.length > 0)) {
      bestScore = 35;
      if (!bestMatch) {
        bestMatch = spokenWords[0] || 'intento detectado';
      }
    }

    return {
      word: targetWord,
      userPronunciation: bestMatch,
      score: Math.round(bestScore),
      feedback: this.getFeedback(bestScore)
    };
  }
}