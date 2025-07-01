import axios from 'axios';
import { Translation, Language } from '../types';

const GOOGLE_TRANSLATE_API_URL = 'https://translation.googleapis.com/language/translate/v2';
const API_KEY = 'YOUR_GOOGLE_API_KEY'; // Reemplazar con tu API key

export class TranslationService {
  static async translate(text: string, sourceLang: Language): Promise<string> {
    try {
      // Por ahora usamos una traducción simulada
      // En producción, descomentar el código de abajo y usar una API key válida
      
      /* 
      const response = await axios.post(GOOGLE_TRANSLATE_API_URL, {
        q: text,
        source: sourceLang,
        target: 'it',
        key: API_KEY
      });
      
      return response.data.data.translations[0].translatedText;
      */
      
      // Simulación temporal
      const translations: Record<string, Record<string, string>> = {
        es: {
          'hola': 'ciao',
          'adiós': 'arrivederci',
          'gracias': 'grazie',
          'por favor': 'per favore',
          'buenos días': 'buongiorno',
          'buenas noches': 'buonanotte',
          'amor': 'amore',
          'amigo': 'amico',
          'comida': 'cibo',
          'agua': 'acqua'
        },
        en: {
          'hello': 'ciao',
          'goodbye': 'arrivederci',
          'thanks': 'grazie',
          'please': 'per favore',
          'good morning': 'buongiorno',
          'good night': 'buonanotte',
          'love': 'amore',
          'friend': 'amico',
          'food': 'cibo',
          'water': 'acqua'
        }
      };
      
      const lowerText = text.toLowerCase();
      return translations[sourceLang]?.[lowerText] || `[${text}]`;
      
    } catch (error) {
      console.error('Translation error:', error);
      throw new Error('Error al traducir el texto');
    }
  }
}