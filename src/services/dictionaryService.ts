import { Language } from '../types';

export interface DictionaryEntry {
  word: string;
  translations: {
    es: string[];
    en: string[];
  };
  definition?: string;
  examples?: string[];
  category?: string;
  pronunciation?: string;
}

export class DictionaryService {
  // Diccionario Italiano → Español/Inglés
  private static italianDictionary: Record<string, DictionaryEntry> = {
    // Saludos y cortesía
    'ciao': {
      word: 'ciao',
      translations: { es: ['hola', 'adiós', 'chao'], en: ['hello', 'hi', 'bye'] },
      category: 'greetings',
      examples: ['Ciao, come stai?', 'Ciao a tutti!']
    },
    'buongiorno': {
      word: 'buongiorno',
      translations: { es: ['buenos días'], en: ['good morning'] },
      category: 'greetings',
      examples: ['Buongiorno signora!']
    },
    'buonasera': {
      word: 'buonasera',
      translations: { es: ['buenas tardes', 'buenas noches'], en: ['good evening'] },
      category: 'greetings'
    },
    'buonanotte': {
      word: 'buonanotte',
      translations: { es: ['buenas noches'], en: ['good night'] },
      category: 'greetings'
    },
    'arrivederci': {
      word: 'arrivederci',
      translations: { es: ['adiós', 'hasta luego'], en: ['goodbye', 'see you later'] },
      category: 'greetings'
    },
    'grazie': {
      word: 'grazie',
      translations: { es: ['gracias'], en: ['thank you', 'thanks'] },
      category: 'courtesy',
      examples: ['Grazie mille!', 'Grazie di cuore']
    },
    'prego': {
      word: 'prego',
      translations: { es: ['de nada', 'por favor'], en: ['you\'re welcome', 'please'] },
      category: 'courtesy'
    },
    'scusa': {
      word: 'scusa',
      translations: { es: ['disculpa', 'perdón'], en: ['sorry', 'excuse me'] },
      category: 'courtesy'
    },
    'scusi': {
      word: 'scusi',
      translations: { es: ['disculpe', 'perdone'], en: ['excuse me'] },
      category: 'courtesy'
    },
    'per favore': {
      word: 'per favore',
      translations: { es: ['por favor'], en: ['please'] },
      category: 'courtesy'
    },

    // Verbos comunes
    'essere': {
      word: 'essere',
      translations: { es: ['ser', 'estar'], en: ['to be'] },
      category: 'verbs',
      examples: ['Io sono italiano', 'Lei è bella']
    },
    'avere': {
      word: 'avere',
      translations: { es: ['tener', 'haber'], en: ['to have'] },
      category: 'verbs',
      examples: ['Ho fame', 'Abbiamo una casa']
    },
    'fare': {
      word: 'fare',
      translations: { es: ['hacer'], en: ['to do', 'to make'] },
      category: 'verbs'
    },
    'andare': {
      word: 'andare',
      translations: { es: ['ir'], en: ['to go'] },
      category: 'verbs'
    },
    'venire': {
      word: 'venire',
      translations: { es: ['venir'], en: ['to come'] },
      category: 'verbs'
    },
    'dire': {
      word: 'dire',
      translations: { es: ['decir'], en: ['to say', 'to tell'] },
      category: 'verbs'
    },
    'parlare': {
      word: 'parlare',
      translations: { es: ['hablar'], en: ['to speak', 'to talk'] },
      category: 'verbs'
    },
    'mangiare': {
      word: 'mangiare',
      translations: { es: ['comer'], en: ['to eat'] },
      category: 'verbs',
      examples: ['Mi piace mangiare la pizza']
    },
    'bere': {
      word: 'bere',
      translations: { es: ['beber'], en: ['to drink'] },
      category: 'verbs'
    },
    'dormire': {
      word: 'dormire',
      translations: { es: ['dormir'], en: ['to sleep'] },
      category: 'verbs'
    },
    'studiare': {
      word: 'studiare',
      translations: { es: ['estudiar'], en: ['to study'] },
      category: 'verbs'
    },
    'lavorare': {
      word: 'lavorare',
      translations: { es: ['trabajar'], en: ['to work'] },
      category: 'verbs'
    },
    'vivere': {
      word: 'vivere',
      translations: { es: ['vivir'], en: ['to live'] },
      category: 'verbs'
    },
    'amare': {
      word: 'amare',
      translations: { es: ['amar'], en: ['to love'] },
      category: 'verbs'
    },
    'capire': {
      word: 'capire',
      translations: { es: ['entender', 'comprender'], en: ['to understand'] },
      category: 'verbs'
    },
    'vedere': {
      word: 'vedere',
      translations: { es: ['ver'], en: ['to see'] },
      category: 'verbs'
    },
    'sapere': {
      word: 'sapere',
      translations: { es: ['saber'], en: ['to know'] },
      category: 'verbs'
    },
    'volere': {
      word: 'volere',
      translations: { es: ['querer'], en: ['to want'] },
      category: 'verbs'
    },
    'potere': {
      word: 'potere',
      translations: { es: ['poder'], en: ['can', 'to be able to'] },
      category: 'verbs'
    },
    'dovere': {
      word: 'dovere',
      translations: { es: ['deber'], en: ['must', 'to have to'] },
      category: 'verbs'
    },

    // Familia
    'famiglia': {
      word: 'famiglia',
      translations: { es: ['familia'], en: ['family'] },
      category: 'family'
    },
    'madre': {
      word: 'madre',
      translations: { es: ['madre'], en: ['mother'] },
      category: 'family'
    },
    'mamma': {
      word: 'mamma',
      translations: { es: ['mamá'], en: ['mom', 'mum'] },
      category: 'family'
    },
    'padre': {
      word: 'padre',
      translations: { es: ['padre'], en: ['father'] },
      category: 'family'
    },
    'papà': {
      word: 'papà',
      translations: { es: ['papá'], en: ['dad'] },
      category: 'family'
    },
    'figlio': {
      word: 'figlio',
      translations: { es: ['hijo'], en: ['son'] },
      category: 'family'
    },
    'figlia': {
      word: 'figlia',
      translations: { es: ['hija'], en: ['daughter'] },
      category: 'family'
    },
    'fratello': {
      word: 'fratello',
      translations: { es: ['hermano'], en: ['brother'] },
      category: 'family'
    },
    'sorella': {
      word: 'sorella',
      translations: { es: ['hermana'], en: ['sister'] },
      category: 'family'
    },
    'nonno': {
      word: 'nonno',
      translations: { es: ['abuelo'], en: ['grandfather'] },
      category: 'family'
    },
    'nonna': {
      word: 'nonna',
      translations: { es: ['abuela'], en: ['grandmother'] },
      category: 'family'
    },
    'zio': {
      word: 'zio',
      translations: { es: ['tío'], en: ['uncle'] },
      category: 'family'
    },
    'zia': {
      word: 'zia',
      translations: { es: ['tía'], en: ['aunt'] },
      category: 'family'
    },

    // Comida
    'cibo': {
      word: 'cibo',
      translations: { es: ['comida', 'alimento'], en: ['food'] },
      category: 'food'
    },
    'pizza': {
      word: 'pizza',
      translations: { es: ['pizza'], en: ['pizza'] },
      category: 'food'
    },
    'pasta': {
      word: 'pasta',
      translations: { es: ['pasta'], en: ['pasta'] },
      category: 'food'
    },
    'pane': {
      word: 'pane',
      translations: { es: ['pan'], en: ['bread'] },
      category: 'food'
    },
    'acqua': {
      word: 'acqua',
      translations: { es: ['agua'], en: ['water'] },
      category: 'food'
    },
    'vino': {
      word: 'vino',
      translations: { es: ['vino'], en: ['wine'] },
      category: 'food'
    },
    'caffè': {
      word: 'caffè',
      translations: { es: ['café'], en: ['coffee'] },
      category: 'food'
    },
    'latte': {
      word: 'latte',
      translations: { es: ['leche'], en: ['milk'] },
      category: 'food'
    },
    'gelato': {
      word: 'gelato',
      translations: { es: ['helado'], en: ['ice cream'] },
      category: 'food'
    },
    'formaggio': {
      word: 'formaggio',
      translations: { es: ['queso'], en: ['cheese'] },
      category: 'food'
    },
    'carne': {
      word: 'carne',
      translations: { es: ['carne'], en: ['meat'] },
      category: 'food'
    },
    'pesce': {
      word: 'pesce',
      translations: { es: ['pescado', 'pez'], en: ['fish'] },
      category: 'food'
    },
    'verdure': {
      word: 'verdure',
      translations: { es: ['verduras', 'vegetales'], en: ['vegetables'] },
      category: 'food'
    },
    'frutta': {
      word: 'frutta',
      translations: { es: ['fruta'], en: ['fruit'] },
      category: 'food'
    },

    // Adjetivos comunes
    'bello': {
      word: 'bello',
      translations: { es: ['hermoso', 'bonito', 'bello'], en: ['beautiful', 'nice'] },
      category: 'adjectives'
    },
    'brutto': {
      word: 'brutto',
      translations: { es: ['feo'], en: ['ugly'] },
      category: 'adjectives'
    },
    'grande': {
      word: 'grande',
      translations: { es: ['grande'], en: ['big', 'large', 'great'] },
      category: 'adjectives'
    },
    'piccolo': {
      word: 'piccolo',
      translations: { es: ['pequeño'], en: ['small', 'little'] },
      category: 'adjectives'
    },
    'buono': {
      word: 'buono',
      translations: { es: ['bueno'], en: ['good'] },
      category: 'adjectives'
    },
    'cattivo': {
      word: 'cattivo',
      translations: { es: ['malo'], en: ['bad'] },
      category: 'adjectives'
    },
    'felice': {
      word: 'felice',
      translations: { es: ['feliz'], en: ['happy'] },
      category: 'adjectives'
    },
    'triste': {
      word: 'triste',
      translations: { es: ['triste'], en: ['sad'] },
      category: 'adjectives'
    },
    'forte': {
      word: 'forte',
      translations: { es: ['fuerte'], en: ['strong'] },
      category: 'adjectives'
    },
    'debole': {
      word: 'debole',
      translations: { es: ['débil'], en: ['weak'] },
      category: 'adjectives'
    },

    // Colores
    'rosso': {
      word: 'rosso',
      translations: { es: ['rojo'], en: ['red'] },
      category: 'colors'
    },
    'blu': {
      word: 'blu',
      translations: { es: ['azul'], en: ['blue'] },
      category: 'colors'
    },
    'verde': {
      word: 'verde',
      translations: { es: ['verde'], en: ['green'] },
      category: 'colors'
    },
    'giallo': {
      word: 'giallo',
      translations: { es: ['amarillo'], en: ['yellow'] },
      category: 'colors'
    },
    'nero': {
      word: 'nero',
      translations: { es: ['negro'], en: ['black'] },
      category: 'colors'
    },
    'bianco': {
      word: 'bianco',
      translations: { es: ['blanco'], en: ['white'] },
      category: 'colors'
    },

    // Números
    'uno': {
      word: 'uno',
      translations: { es: ['uno'], en: ['one'] },
      category: 'numbers'
    },
    'due': {
      word: 'due',
      translations: { es: ['dos'], en: ['two'] },
      category: 'numbers'
    },
    'tre': {
      word: 'tre',
      translations: { es: ['tres'], en: ['three'] },
      category: 'numbers'
    },
    'quattro': {
      word: 'quattro',
      translations: { es: ['cuatro'], en: ['four'] },
      category: 'numbers'
    },
    'cinque': {
      word: 'cinque',
      translations: { es: ['cinco'], en: ['five'] },
      category: 'numbers'
    },
    'dieci': {
      word: 'dieci',
      translations: { es: ['diez'], en: ['ten'] },
      category: 'numbers'
    },

    // Tiempo
    'oggi': {
      word: 'oggi',
      translations: { es: ['hoy'], en: ['today'] },
      category: 'time'
    },
    'ieri': {
      word: 'ieri',
      translations: { es: ['ayer'], en: ['yesterday'] },
      category: 'time'
    },
    'domani': {
      word: 'domani',
      translations: { es: ['mañana'], en: ['tomorrow'] },
      category: 'time'
    },
    'ora': {
      word: 'ora',
      translations: { es: ['ahora', 'hora'], en: ['now', 'hour'] },
      category: 'time'
    },
    'tempo': {
      word: 'tempo',
      translations: { es: ['tiempo'], en: ['time', 'weather'] },
      category: 'time'
    },

    // Casa
    'casa': {
      word: 'casa',
      translations: { es: ['casa'], en: ['house', 'home'] },
      category: 'house'
    },
    'camera': {
      word: 'camera',
      translations: { es: ['habitación', 'cuarto'], en: ['room', 'bedroom'] },
      category: 'house'
    },
    'cucina': {
      word: 'cucina',
      translations: { es: ['cocina'], en: ['kitchen'] },
      category: 'house'
    },
    'bagno': {
      word: 'bagno',
      translations: { es: ['baño'], en: ['bathroom'] },
      category: 'house'
    },

    // Otros comunes
    'amore': {
      word: 'amore',
      translations: { es: ['amor'], en: ['love'] },
      category: 'emotions',
      examples: ['Ti amo', 'L\'amore è bello']
    },
    'amico': {
      word: 'amico',
      translations: { es: ['amigo'], en: ['friend'] },
      category: 'relationships'
    },
    'libro': {
      word: 'libro',
      translations: { es: ['libro'], en: ['book'] },
      category: 'objects'
    },
    'scuola': {
      word: 'scuola',
      translations: { es: ['escuela'], en: ['school'] },
      category: 'places'
    },
    'città': {
      word: 'città',
      translations: { es: ['ciudad'], en: ['city'] },
      category: 'places'
    },
    'paese': {
      word: 'paese',
      translations: { es: ['país', 'pueblo'], en: ['country', 'town'] },
      category: 'places'
    },
    'mondo': {
      word: 'mondo',
      translations: { es: ['mundo'], en: ['world'] },
      category: 'general'
    },
    'vita': {
      word: 'vita',
      translations: { es: ['vida'], en: ['life'] },
      category: 'general'
    },
    'morte': {
      word: 'morte',
      translations: { es: ['muerte'], en: ['death'] },
      category: 'general'
    },
    'donna': {
      word: 'donna',
      translations: { es: ['mujer'], en: ['woman'] },
      category: 'people'
    },
    'uomo': {
      word: 'uomo',
      translations: { es: ['hombre'], en: ['man'] },
      category: 'people'
    },
    'bambino': {
      word: 'bambino',
      translations: { es: ['niño', 'bebé'], en: ['child', 'baby'] },
      category: 'people'
    },
  };

  static search(query: string, targetLang: Language): DictionaryEntry[] {
    const normalizedQuery = query.toLowerCase().trim();

    if (!normalizedQuery) return [];

    const results: DictionaryEntry[] = [];

    // Búsqueda exacta primero
    if (this.italianDictionary[normalizedQuery]) {
      results.push(this.italianDictionary[normalizedQuery]);
    }

    // Búsqueda por coincidencia parcial
    for (const [key, entry] of Object.entries(this.italianDictionary)) {
      if (key.includes(normalizedQuery) && !results.includes(entry)) {
        results.push(entry);
      }
    }

    // Limitar a 20 resultados
    return results.slice(0, 20);
  }

  static getByCategory(category: string): DictionaryEntry[] {
    return Object.values(this.italianDictionary).filter(
      entry => entry.category === category
    );
  }

  static getAllCategories(): string[] {
    const categories = new Set(
      Object.values(this.italianDictionary)
        .map(entry => entry.category)
        .filter(cat => cat !== undefined)
    );
    return Array.from(categories) as string[];
  }

  static getRandomWords(count: number = 10): DictionaryEntry[] {
    const entries = Object.values(this.italianDictionary);
    const shuffled = entries.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  static getSuggestions(query: string): string[] {
    const normalizedQuery = query.toLowerCase().trim();

    if (normalizedQuery.length < 2) return [];

    const suggestions: string[] = [];

    for (const key of Object.keys(this.italianDictionary)) {
      if (key.startsWith(normalizedQuery)) {
        suggestions.push(key);
      }
    }

    return suggestions.slice(0, 10);
  }
}
