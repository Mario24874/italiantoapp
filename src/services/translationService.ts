import axios from 'axios';
import Constants from 'expo-constants';
import { Translation, Language } from '../types';

export class TranslationService {
  private static spanishDictionary: Record<string, string[]> = {
    // Saludos y cortesía
    'hola': ['ciao', 'salve', 'buongiorno'],
    'adiós': ['arrivederci', 'addio', 'ciao'],
    'gracias': ['grazie', 'ti ringrazio', 'molte grazie'],
    'por favor': ['per favore', 'prego'],
    'de nada': ['prego', 'di niente'],
    'perdón': ['scusa', 'mi dispiace', 'perdono'],
    'disculpe': ['scusi', 'mi scusi'],
    'con permiso': ['permesso', 'con permesso'],
    'buenos días': ['buongiorno', 'buona giornata'],
    'buenas tardes': ['buon pomeriggio', 'buonasera'],
    'buenas noches': ['buonanotte', 'buona notte'],
    'hasta luego': ['a dopo', 'ci vediamo dopo', 'arrivederci'],
    'hasta mañana': ['a domani', 'ci vediamo domani'],
    'bienvenido': ['benvenuto', 'benvenuta'],
    'felicidades': ['congratulazioni', 'complimenti'],
    
    // Familia
    'familia': ['famiglia'],
    'madre': ['madre', 'mamma'],
    'padre': ['padre', 'papà'],
    'hijo': ['figlio'],
    'hija': ['figlia'],
    'hermano': ['fratello'],
    'hermana': ['sorella'],
    'abuelo': ['nonno'],
    'abuela': ['nonna'],
    'tío': ['zio'],
    'tía': ['zia'],
    'primo': ['cugino'],
    'prima': ['cugina'],
    'esposo': ['marito', 'sposo'],
    'esposa': ['moglie', 'sposa'],
    'novio': ['fidanzato', 'ragazzo'],
    'novia': ['fidanzata', 'ragazza'],
    'niño': ['bambino', 'ragazzo'],
    'niña': ['bambina', 'ragazza'],
    'bebé': ['bambino', 'neonato'],
    
    // Casa y hogar
    'casa': ['casa', 'abitazione', 'dimora'],
    'habitación': ['camera', 'stanza'],
    'cocina': ['cucina'],
    'baño': ['bagno'],
    'sala': ['soggiorno', 'salotto'],
    'comedor': ['sala da pranzo'],
    'jardín': ['giardino'],
    'puerta': ['porta'],
    'ventana': ['finestra'],
    'mesa': ['tavolo', 'tavola'],
    'silla': ['sedia'],
    'cama': ['letto'],
    'sofá': ['divano'],
    'televisión': ['televisione', 'tv'],
    'refrigerador': ['frigorifero', 'frigo'],
    'estufa': ['fornello', 'cucina'],
    'lavadora': ['lavatrice'],
    'espejo': ['specchio'],
    'armario': ['armadio'],
    'escalera': ['scala'],
    'techo': ['soffitto'],
    'piso': ['pavimento', 'piano'],
    'pared': ['parete', 'muro'],
    
    // Comida y bebida
    'comida': ['cibo', 'alimento', 'pranzo'],
    'desayuno': ['colazione'],
    'almuerzo': ['pranzo'],
    'cena': ['cena'],
    'agua': ['acqua'],
    'leche': ['latte'],
    'café': ['caffè'],
    'té': ['tè'],
    'jugo': ['succo'],
    'vino': ['vino'],
    'cerveza': ['birra'],
    'pan': ['pane'],
    'arroz': ['riso'],
    'pasta': ['pasta'],
    'pizza': ['pizza'],
    'carne': ['carne'],
    'pollo': ['pollo'],
    'pescado': ['pesce'],
    'verduras': ['verdure', 'vegetali'],
    'frutas': ['frutta'],
    'manzana': ['mela'],
    'naranja': ['arancia', 'arancione'],
    'plátano': ['banana'],
    'tomate': ['pomodoro'],
    'cebolla': ['cipolla'],
    'ajo': ['aglio'],
    'queso': ['formaggio'],
    'huevo': ['uovo'],
    'azúcar': ['zucchero'],
    'sal': ['sale'],
    'aceite': ['olio'],
    'mantequilla': ['burro'],
    'helado': ['gelato'],
    'chocolate': ['cioccolato'],
    
    // Cuerpo humano
    'cabeza': ['testa'],
    'pelo': ['capelli'],
    'cara': ['viso', 'faccia'],
    'ojo': ['occhio'],
    'nariz': ['naso'],
    'boca': ['bocca'],
    'diente': ['dente'],
    'oreja': ['orecchia'],
    'cuello': ['collo'],
    'brazo': ['braccio'],
    'mano': ['mano'],
    'dedo': ['dito'],
    'pecho': ['petto'],
    'espalda': ['schiena'],
    'pierna': ['gamba'],
    'pie': ['piede'],
    'corazón': ['cuore'],
    
    // Ropa
    'ropa': ['vestiti', 'abbigliamento'],
    'camisa': ['camicia'],
    'pantalón': ['pantaloni'],
    'vestido': ['vestito'],
    'falda': ['gonna'],
    'zapatos': ['scarpe'],
    'calcetines': ['calze', 'calzini'],
    'sombrero': ['cappello'],
    'abrigo': ['cappotto'],
    'chaqueta': ['giacca'],
    'corbata': ['cravatta'],
    
    // Transporte
    'coche': ['macchina', 'auto', 'automobile'],
    'autobús': ['autobus'],
    'tren': ['treno'],
    'avión': ['aereo'],
    'barco': ['nave', 'barca'],
    'bicicleta': ['bicicletta'],
    'moto': ['moto', 'motocicletta'],
    'taxi': ['taxi'],
    
    // Lugares
    'ciudad': ['città'],
    'país': ['paese', 'nazione'],
    'mundo': ['mondo'],
    'escuela': ['scuola'],
    'universidad': ['università'],
    'hospital': ['ospedale'],
    'farmacia': ['farmacia'],
    'banco': ['banca'],
    'restaurante': ['ristorante'],
    'hotel': ['hotel', 'albergo'],
    'tienda': ['negozio'],
    'supermercado': ['supermercato'],
    'mercado': ['mercato'],
    'iglesia': ['chiesa'],
    'museo': ['museo'],
    'teatro': ['teatro'],
    'cine': ['cinema'],
    'parque': ['parco'],
    'playa': ['spiaggia'],
    'montaña': ['montagna'],
    'río': ['fiume'],
    'mar': ['mare'],
    'lago': ['lago'],
    'aeropuerto': ['aeroporto'],
    'estación': ['stazione'],
    'calle': ['strada', 'via'],
    'plaza': ['piazza'],
    'oficina': ['ufficio'],
    
    // Trabajo y profesiones
    'trabajo': ['lavoro', 'impiego'],
    'médico': ['medico', 'dottore'],
    'enfermera': ['infermiera'],
    'profesor': ['professore', 'insegnante'],
    'estudiante': ['studente'],
    'ingeniero': ['ingegnere'],
    'abogado': ['avvocato'],
    'policía': ['poliziotto'],
    'bombero': ['pompiere'],
    'cocinero': ['cuoco'],
    'camarero': ['cameriere'],
    'vendedor': ['venditore'],
    'secretaria': ['segretaria'],
    'jefe': ['capo', 'direttore'],
    
    // Animales
    'perro': ['cane'],
    'gato': ['gatto'],
    'pájaro': ['uccello'],
    'pez': ['pesce'],
    'caballo': ['cavallo'],
    'vaca': ['mucca'],
    'cerdo': ['maiale'],
    'ratón': ['topo'],
    'elefante': ['elefante'],
    'león': ['leone'],
    'tigre': ['tigre'],
    
    // Emociones y sentimientos
    'amor': ['amore', 'affetto'],
    'feliz': ['felice', 'contento'],
    'triste': ['triste'],
    'enojado': ['arrabbiato'],
    'miedo': ['paura'],
    'sorpresa': ['sorpresa'],
    'cansado': ['stanco'],
    'hambre': ['fame'],
    'sed': ['sete'],
    'frío': ['freddo'],
    'calor': ['caldo'],
    
    // Tiempo
    'tiempo': ['tempo', 'ora'],
    'día': ['giorno', 'dì'],
    'noche': ['notte'],
    'mañana': ['mattina', 'mattino', 'domani'],
    'tarde': ['pomeriggio', 'sera'],
    'hora': ['ora'],
    'minuto': ['minuto'],
    'segundo': ['secondo'],
    'año': ['anno'],
    'mes': ['mese'],
    'semana': ['settimana'],
    'ayer': ['ieri'],
    'hoy': ['oggi'],
    'lunes': ['lunedì'],
    'martes': ['martedì'],
    'miércoles': ['mercoledì'],
    'jueves': ['giovedì'],
    'viernes': ['venerdì'],
    'sábado': ['sabato'],
    'domingo': ['domenica'],
    'enero': ['gennaio'],
    'febrero': ['febbraio'],
    'marzo': ['marzo'],
    'abril': ['aprile'],
    'mayo': ['maggio'],
    'junio': ['giugno'],
    'julio': ['luglio'],
    'agosto': ['agosto'],
    'septiembre': ['settembre'],
    'octubre': ['ottobre'],
    'noviembre': ['novembre'],
    'diciembre': ['dicembre'],
    
    // Números
    'cero': ['zero'],
    'uno': ['uno'],
    'dos': ['due'],
    'tres': ['tre'],
    'cuatro': ['quattro'],
    'cinco': ['cinque'],
    'seis': ['sei'],
    'siete': ['sette'],
    'ocho': ['otto'],
    'nueve': ['nove'],
    'diez': ['dieci'],
    'veinte': ['venti'],
    'treinta': ['trenta'],
    'cuarenta': ['quaranta'],
    'cincuenta': ['cinquanta'],
    'cien': ['cento'],
    'mil': ['mille'],
    
    // Colores
    'color': ['colore'],
    'rojo': ['rosso'],
    'azul': ['blu'],
    'verde': ['verde'],
    'amarillo': ['giallo'],
    'negro': ['nero'],
    'blanco': ['bianco'],
    'gris': ['grigio'],
    'rosa': ['rosa'],
    'violeta': ['viola'],
    'marrón': ['marrone'],
    
    // Adjetivos
    'grande': ['grande'],
    'pequeño': ['piccolo'],
    'alto': ['alto'],
    'bajo': ['basso', 'sotto'],
    'gordo': ['grasso'],
    'delgado': ['magro'],
    'fuerte': ['forte'],
    'débil': ['debole'],
    'rápido': ['veloce'],
    'lento': ['lento'],
    'nuevo': ['nuovo'],
    'viejo': ['vecchio'],
    'joven': ['giovane'],
    'bueno': ['buono'],
    'malo': ['cattivo'],
    'bonito': ['bello', 'carino'],
    'feo': ['brutto'],
    'fácil': ['facile'],
    'difícil': ['difficile'],
    'caro': ['caro', 'costoso'],
    'barato': ['economico', 'a buon mercato'],
    'rico': ['ricco'],
    'pobre': ['povero'],
    'limpio': ['pulito'],
    'sucio': ['sporco'],
    'caliente': ['caldo'],
    'dulce': ['dolce'],
    'amargo': ['amaro'],
    
    // Verbos comunes
    'ser': ['essere'],
    'estar': ['stare'],
    'tener': ['avere'],
    'hacer': ['fare'],
    'decir': ['dire'],
    'ir': ['andare'],
    'venir': ['venire'],
    'ver': ['vedere'],
    'saber': ['sapere'],
    'poder': ['potere'],
    'querer': ['volere'],
    'dar': ['dare'],
    'poner': ['mettere'],
    'salir': ['uscire'],
    'llegar': ['arrivare'],
    'pasar': ['passare'],
    'quedar': ['rimanere'],
    'seguir': ['seguire'],
    'llevar': ['portare'],
    'traer': ['portare'],
    'pensar': ['pensare'],
    'creer': ['credere'],
    'sentir': ['sentire'],
    'vivir': ['vivere'],
    'morir': ['morire'],
    'nacer': ['nascere'],
    'crecer': ['crescere'],
    'comer': ['mangiare'],
    'beber': ['bere'],
    'dormir': ['dormire'],
    'despertar': ['svegliarsi'],
    'levantarse': ['alzarsi'],
    'sentarse': ['sedersi'],
    'caminar': ['camminare'],
    'correr': ['correre'],
    'saltar': ['saltare'],
    'bailar': ['ballare'],
    'cantar': ['cantare'],
    'hablar': ['parlare'],
    'escuchar': ['ascoltare'],
    'mirar': ['guardare'],
    'leer': ['leggere'],
    'escribir': ['scrivere'],
    'estudiar': ['studiare'],
    'aprender': ['imparare'],
    'enseñar': ['insegnare'],
    'trabajar': ['lavorare'],
    'jugar': ['giocare'],
    'comprar': ['comprare'],
    'vender': ['vendere'],
    'pagar': ['pagare'],
    'gastar': ['spendere'],
    'ahorrar': ['risparmiare'],
    'ganar': ['guadagnare', 'vincere'],
    'perder': ['perdere'],
    'encontrar': ['trovare'],
    'buscar': ['cercare'],
    'abrir': ['aprire'],
    'cerrar': ['chiudere'],
    'empezar': ['iniziare', 'cominciare'],
    'terminar': ['finire', 'terminare'],
    'ayudar': ['aiutare'],
    'amar': ['amare'],
    'odiar': ['odiare'],
    'gustar': ['piacere'],
    'preferir': ['preferire'],
    'necesitar': ['aver bisogno'],
    'usar': ['usare'],
    'llamar': ['chiamare'],
    'preguntar': ['domandare'],
    'responder': ['rispondere'],
    'conocer': ['conoscere'],
    'recordar': ['ricordare'],
    'olvidar': ['dimenticare'],
    'esperar': ['aspettare'],
    'conseguir': ['ottenere'],
    'permitir': ['permettere'],
    'prohibir': ['proibire'],
    'mandar': ['comandare'],
    'obedecer': ['obbedire'],
    
    // Preposiciones y conectores
    'en': ['in', 'a'],
    'de': ['di', 'da'],
    'con': ['con'],
    'sin': ['senza'],
    'para': ['per'],
    'por': ['per', 'da'],
    'sobre': ['sopra', 'su'],
    'entre': ['tra', 'fra'],
    'durante': ['durante'],
    'después': ['dopo'],
    'antes': ['prima'],
    'hasta': ['fino a'],
    'desde': ['da', 'fin da'],
    'hacia': ['verso'],
    'contra': ['contro'],
    'según': ['secondo'],
    'excepto': ['eccetto'],
    'además': ['inoltre'],
    'también': ['anche'],
    'tampoco': ['nemmeno'],
    'pero': ['ma', 'però'],
    'sino': ['ma', 'bensì'],
    'aunque': ['anche se', 'benché'],
    'porque': ['perché'],
    'como': ['come'],
    'cuando': ['quando'],
    'donde': ['dove'],
    'mientras': ['mentre'],
    'si': ['se'],
    'que': ['che'],
    'quien': ['chi'],
    'cual': ['quale'],
    'cuanto': ['quanto'],
    
    // Palabras interrogativas
    'qué': ['che cosa', 'cosa'],
    'quién': ['chi'],
    'cuándo': ['quando'],
    'dónde': ['dove'],
    'cómo': ['come'],
    'por qué': ['perché'],
    'cuánto': ['quanto'],
    'cuál': ['quale'],
    
    // Frases útiles
    'muy bien': ['molto bene'],
    'no importa': ['non importa'],
    'no hay problema': ['non c\'è problema'],
    'lo siento': ['mi dispiace'],
    'no entiendo': ['non capisco'],
    'habla más despacio': ['parla più lentamente'],
    'repite por favor': ['ripeti per favore'],
    'cuánto cuesta': ['quanto costa'],
    'dónde está': ['dov\'è'],
    'me gusta': ['mi piace'],
    'no me gusta': ['non mi piace'],
    'tengo hambre': ['ho fame'],
    'tengo sed': ['ho sete'],
    'estoy cansado': ['sono stanco'],
    'estoy perdido': ['sono perso'],
    'necesito ayuda': ['ho bisogno di aiuto'],
    'llama a la policía': ['chiama la polizia'],
    'llama al médico': ['chiama il medico'],
    'feliz cumpleaños': ['buon compleanno'],
    'feliz año nuevo': ['buon anno'],
    'feliz navidad': ['buon natale'],
    'buen viaje': ['buon viaggio'],
    'buena suerte': ['buona fortuna'],
    'que tengas un buen día': ['che tu abbia una buona giornata'],
    'nos vemos mañana': ['ci vediamo domani'],
    'hasta la vista': ['arrivederci'],
    'encantado de conocerte': ['piacere di conoscerti'],
    'mucho gusto': ['molto piacere'],
    'de dónde eres': ['di dove sei'],
    'cómo te llamas': ['come ti chiami'],
    'me llamo': ['mi chiamo'],
    'cuántos años tienes': ['quanti anni hai'],
    'tengo años': ['ho anni'],
    'qué hora es': ['che ora è'],
    'son las': ['sono le'],
    'es la una': ['è l\'una'],
    'media hora': ['mezz\'ora'],
    'cuarto de hora': ['un quarto d\'ora'],
    'hace buen tiempo': ['fa bel tempo'],
    'hace mal tiempo': ['fa brutto tempo'],
    'llueve': ['piove'],
    'nieva': ['nevica'],
    'hace sol': ['c\'è il sole'],
    'hace viento': ['c\'è vento'],
    'hace frío': ['fa freddo'],
    'hace calor': ['fa caldo']
  };

  private static englishDictionary: Record<string, string[]> = {
    // Greetings and courtesy
    'hello': ['ciao', 'salve', 'buongiorno'],
    'hi': ['ciao', 'salve'],
    'goodbye': ['arrivederci', 'addio', 'ciao'],
    'bye': ['ciao', 'arrivederci'],
    'thanks': ['grazie', 'ti ringrazio'],
    'thank you': ['grazie', 'ti ringrazio', 'molte grazie'],
    'thank you very much': ['grazie mille', 'molte grazie'],
    'please': ['per favore', 'prego'],
    'you\'re welcome': ['prego', 'di niente'],
    'sorry': ['scusa', 'mi dispiace', 'perdono'],
    'excuse me': ['scusi', 'mi scusi', 'permesso'],
    'good morning': ['buongiorno', 'buona giornata'],
    'good afternoon': ['buon pomeriggio'],
    'good evening': ['buonasera'],
    'good night': ['buonanotte', 'buona notte'],
    'see you later': ['a dopo', 'ci vediamo dopo'],
    'see you tomorrow': ['a domani', 'ci vediamo domani'],
    'welcome': ['benvenuto', 'benvenuta'],
    'congratulations': ['congratulazioni', 'complimenti'],
    'happy birthday': ['buon compleanno'],
    'merry christmas': ['buon natale'],
    'happy new year': ['buon anno', 'felice anno nuovo'],
    
    // Family
    'family': ['famiglia'],
    'mother': ['madre', 'mamma'],
    'father': ['padre', 'papà'],
    'mom': ['mamma'],
    'dad': ['papà'],
    'son': ['figlio'],
    'daughter': ['figlia'],
    'brother': ['fratello'],
    'sister': ['sorella'],
    'grandfather': ['nonno'],
    'grandmother': ['nonna'],
    'grandpa': ['nonno'],
    'grandma': ['nonna'],
    'uncle': ['zio'],
    'aunt': ['zia'],
    'cousin': ['cugino', 'cugina'],
    'husband': ['marito', 'sposo'],
    'wife': ['moglie', 'sposa'],
    'boyfriend': ['fidanzato', 'ragazzo'],
    'girlfriend': ['fidanzata', 'ragazza'],
    'child': ['bambino', 'bambina'],
    'children': ['bambini'],
    'boy': ['ragazzo', 'bambino'],
    'girl': ['ragazza', 'bambina'],
    'baby': ['bambino', 'neonato'],
    'parents': ['genitori'],
    'relatives': ['parenti'],
    'nephew': ['nipote'],
    'niece': ['nipote'],
    
    // House and home
    'house': ['casa', 'abitazione'],
    'home': ['casa', 'dimora'],
    'room': ['camera', 'stanza'],
    'bedroom': ['camera da letto'],
    'kitchen': ['cucina'],
    'bathroom': ['bagno'],
    'living room': ['soggiorno', 'salotto'],
    'dining room': ['sala da pranzo'],
    'garden': ['giardino'],
    'door': ['porta'],
    'window': ['finestra'],
    'table': ['tavolo', 'tavola'],
    'chair': ['sedia'],
    'bed': ['letto'],
    'sofa': ['divano'],
    'couch': ['divano'],
    'television': ['televisione', 'tv'],
    'tv': ['tv', 'televisione'],
    'refrigerator': ['frigorifero', 'frigo'],
    'fridge': ['frigo', 'frigorifero'],
    'stove': ['fornello', 'cucina'],
    'oven': ['forno'],
    'washing machine': ['lavatrice'],
    'mirror': ['specchio'],
    'closet': ['armadio'],
    'wardrobe': ['armadio', 'guardaroba'],
    'stairs': ['scala', 'scale'],
    'ceiling': ['soffitto'],
    'floor': ['pavimento', 'piano'],
    'wall': ['parete', 'muro'],
    'garage': ['garage'],
    'balcony': ['balcone'],
    'roof': ['tetto'],
    'basement': ['cantina', 'seminterrato'],
    
    // Food and drink
    'food': ['cibo', 'alimento'],
    'meal': ['pasto'],
    'breakfast': ['colazione'],
    'lunch': ['pranzo'],
    'dinner': ['cena'],
    'water': ['acqua'],
    'milk': ['latte'],
    'coffee': ['caffè'],
    'tea': ['tè'],
    'juice': ['succo'],
    'wine': ['vino'],
    'beer': ['birra'],
    'bread': ['pane'],
    'rice': ['riso'],
    'pasta': ['pasta'],
    'pizza': ['pizza'],
    'meat': ['carne'],
    'chicken': ['pollo', 'gallina'],
    'fish': ['pesce'],
    'vegetables': ['verdure', 'vegetali'],
    'fruits': ['frutta'],
    'apple': ['mela'],
    'orange': ['arancia', 'arancione'],
    'banana': ['banana'],
    'tomato': ['pomodoro'],
    'onion': ['cipolla'],
    'garlic': ['aglio'],
    'cheese': ['formaggio'],
    'egg': ['uovo'],
    'eggs': ['uova'],
    'sugar': ['zucchero'],
    'salt': ['sale'],
    'oil': ['olio'],
    'butter': ['burro'],
    'ice cream': ['gelato'],
    'chocolate': ['cioccolato'],
    'cake': ['torta'],
    'soup': ['zuppa'],
    'salad': ['insalata'],
    'sandwich': ['panino', 'sandwich'],
    'hamburger': ['hamburger'],
    'french fries': ['patatine fritte'],
    'potato': ['patata'],
    'lemon': ['limone'],
    'strawberry': ['fragola'],
    'grape': ['uva'],
    
    // Human body
    'head': ['testa'],
    'hair': ['capelli'],
    'face': ['viso', 'faccia'],
    'eye': ['occhio'],
    'eyes': ['occhi'],
    'nose': ['naso'],
    'mouth': ['bocca'],
    'tooth': ['dente'],
    'teeth': ['denti'],
    'ear': ['orecchio'],
    'ears': ['orecchie'],
    'neck': ['collo'],
    'arm': ['braccio'],
    'arms': ['braccia'],
    'hand': ['mano'],
    'hands': ['mani'],
    'finger': ['dito'],
    'fingers': ['dita'],
    'chest': ['petto'],
    'back': ['schiena'],
    'leg': ['gamba'],
    'legs': ['gambe'],
    'foot': ['piede'],
    'feet': ['piedi'],
    'heart': ['cuore'],
    'stomach': ['stomaco'],
    'brain': ['cervello'],
    'blood': ['sangue'],
    'bone': ['osso'],
    'skin': ['pelle'],
    
    // Clothes
    'clothes': ['vestiti', 'abbigliamento'],
    'clothing': ['abbigliamento', 'vestiti'],
    'shirt': ['camicia'],
    'pants': ['pantaloni'],
    'trousers': ['pantaloni'],
    'dress': ['vestito'],
    'skirt': ['gonna'],
    'shoes': ['scarpe'],
    'socks': ['calze', 'calzini'],
    'hat': ['cappello'],
    'coat': ['cappotto'],
    'jacket': ['giacca'],
    'tie': ['cravatta'],
    'belt': ['cintura'],
    'gloves': ['guanti'],
    'scarf': ['sciarpa'],
    'sweater': ['maglione'],
    'jeans': ['jeans'],
    't-shirt': ['maglietta'],
    'underwear': ['biancheria intima'],
    'suit': ['completo', 'abito'],
    'boots': ['stivali'],
    'sandals': ['sandali'],
    
    // Transportation
    'car': ['macchina', 'auto', 'automobile'],
    'bus': ['autobus'],
    'train': ['treno'],
    'airplane': ['aereo'],
    'plane': ['aereo'],
    'boat': ['barca'],
    'ship': ['nave'],
    'bicycle': ['bicicletta'],
    'bike': ['bici', 'bicicletta'],
    'motorcycle': ['moto', 'motocicletta'],
    'taxi': ['taxi'],
    'subway': ['metropolitana', 'metro'],
    'metro': ['metro', 'metropolitana'],
    'tram': ['tram'],
    'helicopter': ['elicottero'],
    'truck': ['camion'],
    'van': ['furgone'],
    
    // Places
    'city': ['città'],
    'town': ['paese', 'cittadina'],
    'country': ['paese', 'nazione'],
    'world': ['mondo'],
    'school': ['scuola'],
    'university': ['università'],
    'hospital': ['ospedale'],
    'pharmacy': ['farmacia'],
    'bank': ['banca'],
    'restaurant': ['ristorante'],
    'hotel': ['hotel', 'albergo'],
    'store': ['negozio'],
    'shop': ['negozio'],
    'supermarket': ['supermercato'],
    'market': ['mercato'],
    'church': ['chiesa'],
    'museum': ['museo'],
    'theater': ['teatro'],
    'theatre': ['teatro'],
    'cinema': ['cinema'],
    'movie theater': ['cinema'],
    'park': ['parco'],
    'beach': ['spiaggia'],
    'mountain': ['montagna'],
    'river': ['fiume'],
    'sea': ['mare'],
    'ocean': ['oceano'],
    'lake': ['lago'],
    'airport': ['aeroporto'],
    'station': ['stazione'],
    'street': ['strada', 'via'],
    'road': ['strada'],
    'square': ['piazza'],
    'office': ['ufficio'],
    'library': ['biblioteca'],
    'post office': ['ufficio postale'],
    'police station': ['stazione di polizia'],
    'fire station': ['stazione dei pompieri'],
    'gym': ['palestra'],
    'stadium': ['stadio'],
    'bridge': ['ponte'],
    'building': ['edificio'],
    'castle': ['castello'],
    'palace': ['palazzo'],
    'factory': ['fabbrica'],
    'farm': ['fattoria'],
    
    // Work and professions
    'work': ['lavoro', 'impiego', 'lavorare'],
    'job': ['lavoro', 'impiego'],
    'doctor': ['medico', 'dottore'],
    'nurse': ['infermiera', 'infermiere'],
    'teacher': ['professore', 'insegnante'],
    'professor': ['professore'],
    'student': ['studente'],
    'engineer': ['ingegnere'],
    'lawyer': ['avvocato'],
    'police officer': ['poliziotto'],
    'policeman': ['poliziotto'],
    'firefighter': ['pompiere'],
    'cook': ['cuoco', 'cucinare'],
    'chef': ['chef', 'cuoco'],
    'waiter': ['cameriere'],
    'waitress': ['cameriera'],
    'salesperson': ['venditore', 'commesso'],
    'secretary': ['segretaria', 'segretario'],
    'boss': ['capo', 'direttore'],
    'manager': ['manager', 'direttore'],
    'employee': ['impiegato', 'dipendente'],
    'worker': ['lavoratore', 'operaio'],
    'artist': ['artista'],
    'musician': ['musicista'],
    'actor': ['attore'],
    'actress': ['attrice'],
    'writer': ['scrittore'],
    'journalist': ['giornalista'],
    'photographer': ['fotografo'],
    'pilot': ['pilota'],
    'driver': ['autista'],
    'mechanic': ['meccanico'],
    'electrician': ['elettricista'],
    'plumber': ['idraulico'],
    'carpenter': ['falegname'],
    'dentist': ['dentista'],
    'pharmacist': ['farmacista'],
    'architect': ['architetto'],
    'accountant': ['contabile', 'ragioniere'],
    
    // Animals
    'dog': ['cane'],
    'cat': ['gatto'],
    'bird': ['uccello'],
    'horse': ['cavallo'],
    'cow': ['mucca'],
    'pig': ['maiale'],
    'mouse': ['topo'],
    'rat': ['ratto'],
    'elephant': ['elefante'],
    'lion': ['leone'],
    'tiger': ['tigre'],
    'bear': ['orso'],
    'monkey': ['scimmia'],
    'rabbit': ['coniglio'],
    'duck': ['anatra'],
    'sheep': ['pecora'],
    'goat': ['capra'],
    'wolf': ['lupo'],
    'fox': ['volpe'],
    'deer': ['cervo'],
    'snake': ['serpente'],
    'turtle': ['tartaruga'],
    'frog': ['rana'],
    'butterfly': ['farfalla'],
    'bee': ['ape'],
    'ant': ['formica'],
    'spider': ['ragno'],
    'mosquito': ['zanzara'],
    'fly': ['mosca', 'volare'],
    
    // Emotions and feelings
    'love': ['amore', 'affetto', 'amare'],
    'happy': ['felice', 'contento'],
    'sad': ['triste'],
    'angry': ['arrabbiato'],
    'fear': ['paura'],
    'afraid': ['spaventato', 'impaurito'],
    'surprise': ['sorpresa'],
    'surprised': ['sorpreso'],
    'tired': ['stanco'],
    'hungry': ['affamato'],
    'thirsty': ['assetato'],
    'cold': ['freddo'],
    'hot': ['caldo'],
    'warm': ['caldo', 'tiepido'],
    'joy': ['gioia'],
    'happiness': ['felicità'],
    'sadness': ['tristezza'],
    'anger': ['rabbia'],
    'excited': ['eccitato', 'emozionato'],
    'bored': ['annoiato'],
    'worried': ['preoccupato'],
    'nervous': ['nervoso'],
    'calm': ['calmo'],
    'relaxed': ['rilassato'],
    'confused': ['confuso'],
    'proud': ['orgoglioso'],
    'ashamed': ['vergognoso'],
    'jealous': ['geloso'],
    'lonely': ['solo'],
    'sick': ['malato'],
    'healthy': ['sano'],
    'pain': ['dolore'],
    
    // Time
    'time': ['tempo', 'ora'],
    'day': ['giorno', 'dì'],
    'night': ['notte'],
    'morning': ['mattina', 'mattino'],
    'afternoon': ['pomeriggio'],
    'evening': ['sera'],
    'hour': ['ora'],
    'minute': ['minuto'],
    'second': ['secondo'],
    'year': ['anno'],
    'month': ['mese'],
    'week': ['settimana'],
    'yesterday': ['ieri'],
    'today': ['oggi'],
    'tomorrow': ['domani'],
    'monday': ['lunedì'],
    'tuesday': ['martedì'],
    'wednesday': ['mercoledì'],
    'thursday': ['giovedì'],
    'friday': ['venerdì'],
    'saturday': ['sabato'],
    'sunday': ['domenica'],
    'january': ['gennaio'],
    'february': ['febbraio'],
    'march': ['marzo'],
    'april': ['aprile'],
    'may': ['maggio'],
    'june': ['giugno'],
    'july': ['luglio'],
    'august': ['agosto'],
    'september': ['settembre'],
    'october': ['ottobre'],
    'november': ['novembre'],
    'december': ['dicembre'],
    'spring': ['primavera'],
    'summer': ['estate'],
    'autumn': ['autunno'],
    'fall': ['autunno', 'cadere'],
    'winter': ['inverno'],
    'now': ['ora', 'adesso'],
    'later': ['dopo', 'più tardi'],
    'before': ['prima'],
    'after': ['dopo'],
    'always': ['sempre'],
    'never': ['mai'],
    'sometimes': ['a volte', 'qualche volta'],
    'often': ['spesso'],
    'early': ['presto'],
    'late': ['tardi'],
    
    // Numbers
    'zero': ['zero'],
    'one': ['uno'],
    'two': ['due'],
    'three': ['tre'],
    'four': ['quattro'],
    'five': ['cinque'],
    'six': ['sei'],
    'seven': ['sette'],
    'eight': ['otto'],
    'nine': ['nove'],
    'ten': ['dieci'],
    'eleven': ['undici'],
    'twelve': ['dodici'],
    'thirteen': ['tredici'],
    'fourteen': ['quattordici'],
    'fifteen': ['quindici'],
    'sixteen': ['sedici'],
    'seventeen': ['diciassette'],
    'eighteen': ['diciotto'],
    'nineteen': ['diciannove'],
    'twenty': ['venti'],
    'thirty': ['trenta'],
    'forty': ['quaranta'],
    'fifty': ['cinquanta'],
    'sixty': ['sessanta'],
    'seventy': ['settanta'],
    'eighty': ['ottanta'],
    'ninety': ['novanta'],
    'hundred': ['cento'],
    'thousand': ['mille'],
    'million': ['milione'],
    'first': ['primo'],
    'third': ['terzo'],
    'last': ['ultimo'],
    
    // Colors
    'color': ['colore'],
    'red': ['rosso'],
    'blue': ['blu'],
    'green': ['verde'],
    'yellow': ['giallo'],
    'black': ['nero'],
    'white': ['bianco'],
    'gray': ['grigio'],
    'grey': ['grigio'],
    'pink': ['rosa'],
    'purple': ['viola'],
    'violet': ['viola'],
    'brown': ['marrone'],
    'gold': ['oro', 'dorato'],
    'silver': ['argento', 'argentato'],
    'light': ['chiaro', 'leggero'],
    'dark': ['scuro'],
    
    // Adjectives
    'big': ['grande'],
    'small': ['piccolo'],
    'tall': ['alto'],
    'short': ['basso', 'corto'],
    'fat': ['grasso'],
    'thin': ['magro'],
    'strong': ['forte'],
    'weak': ['debole'],
    'fast': ['veloce'],
    'slow': ['lento'],
    'new': ['nuovo'],
    'old': ['vecchio'],
    'young': ['giovane'],
    'good': ['buono'],
    'bad': ['cattivo'],
    'beautiful': ['bello', 'bellissimo'],
    'pretty': ['carino', 'grazioso'],
    'ugly': ['brutto'],
    'easy': ['facile'],
    'difficult': ['difficile'],
    'hard': ['duro', 'difficile'],
    'soft': ['morbido'],
    'expensive': ['caro', 'costoso'],
    'cheap': ['economico', 'a buon mercato'],
    'rich': ['ricco'],
    'poor': ['povero'],
    'clean': ['pulito', 'pulire'],
    'dirty': ['sporco'],
    'sweet': ['dolce'],
    'bitter': ['amaro'],
    'sour': ['acido', 'aspro'],
    'salty': ['salato'],
    'long': ['lungo'],
    'wide': ['largo'],
    'narrow': ['stretto'],
    'deep': ['profondo'],
    'shallow': ['superficiale'],
    'heavy': ['pesante'],
    'full': ['pieno'],
    'empty': ['vuoto'],
    'open': ['aperto', 'aprire'],
    'closed': ['chiuso'],
    'right': ['destro', 'giusto'],
    'left': ['sinistro'],
    'wrong': ['sbagliato'],
    'correct': ['corretto'],
    'true': ['vero'],
    'false': ['falso'],
    'same': ['stesso'],
    'different': ['diverso'],
    'similar': ['simile'],
    'important': ['importante'],
    'necessary': ['necessario'],
    'possible': ['possibile'],
    'impossible': ['impossibile'],
    'real': ['reale'],
    'fake': ['falso', 'finto'],
    
    // Common verbs
    'be': ['essere'],
    'have': ['avere'],
    'do': ['fare'],
    'say': ['dire'],
    'go': ['andare'],
    'come': ['venire'],
    'see': ['vedere'],
    'know': ['sapere', 'conoscere'],
    'can': ['potere'],
    'want': ['volere'],
    'give': ['dare'],
    'put': ['mettere'],
    'take': ['prendere'],
    'get': ['prendere', 'ottenere'],
    'leave': ['lasciare', 'partire'],
    'exit': ['uscire'],
    'arrive': ['arrivare'],
    'pass': ['passare'],
    'stay': ['rimanere', 'stare'],
    'follow': ['seguire'],
    'bring': ['portare'],
    'carry': ['portare'],
    'think': ['pensare'],
    'believe': ['credere'],
    'feel': ['sentire'],
    'live': ['vivere'],
    'die': ['morire'],
    'born': ['nascere'],
    'grow': ['crescere'],
    'eat': ['mangiare'],
    'drink': ['bere'],
    'sleep': ['dormire'],
    'wake up': ['svegliarsi'],
    'stand up': ['alzarsi', 'alzati'],
    'sit down': ['sedersi', 'siediti'],
    'walk': ['camminare'],
    'run': ['correre'],
    'jump': ['saltare'],
    'dance': ['ballare'],
    'sing': ['cantare'],
    'talk': ['parlare'],
    'speak': ['parlare'],
    'listen': ['ascoltare'],
    'hear': ['sentire', 'udire'],
    'look': ['guardare'],
    'watch': ['guardare'],
    'read': ['leggere'],
    'write': ['scrivere'],
    'study': ['studiare'],
    'learn': ['imparare'],
    'teach': ['insegnare'],
    'play': ['giocare'],
    'buy': ['comprare'],
    'sell': ['vendere'],
    'pay': ['pagare'],
    'spend': ['spendere'],
    'save': ['risparmiare', 'salvare'],
    'earn': ['guadagnare'],
    'win': ['vincere'],
    'lose': ['perdere'],
    'find': ['trovare'],
    'search': ['cercare'],
    'look for': ['cercare'],
    'close': ['chiudere'],
    'start': ['iniziare', 'cominciare'],
    'begin': ['iniziare', 'cominciare'],
    'finish': ['finire', 'terminare'],
    'end': ['finire', 'terminare'],
    'help': ['aiutare'],
    'hate': ['odiare'],
    'like': ['piacere', 'come'],
    'prefer': ['preferire'],
    'need': ['aver bisogno', 'necessitare'],
    'use': ['usare'],
    'call': ['chiamare'],
    'ask': ['domandare', 'chiedere'],
    'answer': ['rispondere'],
    'meet': ['incontrare'],
    'remember': ['ricordare'],
    'forget': ['dimenticare'],
    'wait': ['aspettare'],
    'hope': ['sperare'],
    'try': ['provare', 'tentare'],
    'understand': ['capire', 'comprendere'],
    'explain': ['spiegare'],
    'choose': ['scegliere'],
    'decide': ['decidere'],
    'promise': ['promettere'],
    'allow': ['permettere'],
    'forbid': ['proibire'],
    'order': ['ordinare', 'comandare'],
    'obey': ['obbedire'],
    'wash': ['lavare'],
    'drive': ['guidare'],
    'travel': ['viaggiare'],
    'swim': ['nuotare'],
    'climb': ['scalare', 'arrampicarsi'],
    'break': ['rompere'],
    'fix': ['riparare', 'aggiustare'],
    'build': ['costruire'],
    'destroy': ['distruggere'],
    'create': ['creare'],
    'change': ['cambiare'],
    'move': ['muovere', 'spostare'],
    'turn': ['girare'],
    'push': ['spingere'],
    'pull': ['tirare'],
    'throw': ['lanciare', 'gettare'],
    'catch': ['prendere', 'afferrare'],
    'hit': ['colpire'],
    'cut': ['tagliare'],
    'draw': ['disegnare'],
    'paint': ['dipingere'],
    'smile': ['sorridere'],
    'laugh': ['ridere'],
    'cry': ['piangere'],
    'shout': ['gridare'],
    'whisper': ['sussurrare'],
    
    // Prepositions and connectors
    'in': ['in', 'dentro'],
    'on': ['su', 'sopra'],
    'at': ['a', 'presso'],
    'of': ['di'],
    'from': ['da'],
    'to': ['a', 'verso'],
    'with': ['con'],
    'without': ['senza'],
    'for': ['per'],
    'about': ['su', 'circa'],
    'over': ['sopra', 'oltre'],
    'under': ['sotto'],
    'between': ['tra', 'fra'],
    'among': ['tra', 'fra'],
    'during': ['durante'],
    'until': ['fino a'],
    'since': ['da', 'fin da'],
    'toward': ['verso'],
    'towards': ['verso'],
    'against': ['contro'],
    'according to': ['secondo'],
    'except': ['eccetto', 'tranne'],
    'besides': ['oltre a'],
    'also': ['anche'],
    'too': ['anche', 'troppo'],
    'neither': ['nemmeno', 'neanche'],
    'but': ['ma', 'però'],
    'however': ['tuttavia', 'però'],
    'although': ['anche se', 'benché'],
    'because': ['perché'],
    'as': ['come', 'mentre'],
    'while': ['mentre'],
    'if': ['se'],
    'that': ['che'],
    'and': ['e', 'ed'],
    'or': ['o', 'oppure'],
    'nor': ['né'],
    'so': ['così', 'quindi'],
    'then': ['allora', 'poi'],
    'therefore': ['quindi', 'perciò'],
    'thus': ['così', 'dunque'],
    
    // Question words
    'what': ['che cosa', 'cosa', 'che'],
    'who': ['chi'],
    'when': ['quando'],
    'where': ['dove'],
    'why': ['perché'],
    'how': ['come'],
    'how much': ['quanto'],
    'how many': ['quanti'],
    'which': ['quale', 'che'],
    'whose': ['di chi'],
    
    // Useful phrases
    'very well': ['molto bene'],
    'no problem': ['non c\'è problema'],
    'it doesn\'t matter': ['non importa'],
    'i\'m sorry': ['mi dispiace'],
    'i don\'t understand': ['non capisco'],
    'speak slower': ['parla più lentamente'],
    'please repeat': ['ripeti per favore'],
    'how much does it cost': ['quanto costa'],
    'how much is it': ['quanto costa', 'quanto è'],
    'where is': ['dov\'è', 'dove si trova'],
    'i like': ['mi piace'],
    'i don\'t like': ['non mi piace'],
    'i like it': ['mi piace'],
    'i love you': ['ti amo', 'ti voglio bene'],
    'i miss you': ['mi manchi'],
    'i\'m hungry': ['ho fame'],
    'i\'m thirsty': ['ho sete'],
    'i\'m tired': ['sono stanco'],
    'i\'m lost': ['sono perso', 'mi sono perso'],
    'i need help': ['ho bisogno di aiuto'],
    'i need': ['ho bisogno di'],
    'call the police': ['chiama la polizia'],
    'call a doctor': ['chiama il medico'],
    'have a good trip': ['buon viaggio'],
    'good luck': ['buona fortuna'],
    'have a nice day': ['buona giornata'],
    'have a good day': ['che tu abbia una buona giornata'],
    'nice to meet you': ['piacere di conoscerti'],
    'pleased to meet you': ['molto piacere'],
    'where are you from': ['di dove sei'],
    'what\'s your name': ['come ti chiami'],
    'my name is': ['mi chiamo'],
    'how old are you': ['quanti anni hai'],
    'i am years old': ['ho anni'],
    'what time is it': ['che ora è', 'che ore sono'],
    'it\'s o\'clock': ['sono le'],
    'it\'s one o\'clock': ['è l\'una'],
    'half an hour': ['mezz\'ora'],
    'quarter of an hour': ['un quarto d\'ora'],
    'the weather is nice': ['fa bel tempo'],
    'the weather is bad': ['fa brutto tempo'],
    'it\'s raining': ['piove', 'sta piovendo'],
    'it\'s snowing': ['nevica', 'sta nevicando'],
    'it\'s sunny': ['c\'è il sole'],
    'it\'s windy': ['c\'è vento'],
    'it\'s cold': ['fa freddo'],
    'it\'s hot': ['fa caldo'],
    'can you help me': ['puoi aiutarmi', 'mi puoi aiutare'],
    'of course': ['certo', 'certamente'],
    'yes': ['sì'],
    'no': ['no'],
    'maybe': ['forse'],
    'i think so': ['penso di sì'],
    'i don\'t think so': ['penso di no'],
    'welcome back': ['bentornato'],
    'see you soon': ['a presto'],
    'take care': ['stammi bene', 'abbi cura di te'],
    'be careful': ['stai attento', 'fai attenzione'],
    'hurry up': ['sbrigati'],
    'wait a moment': ['aspetta un momento'],
    'come here': ['vieni qui'],
    'go away': ['vai via'],
    'come in': ['entra', 'prego entra'],
    'go out': ['esci'],
    'turn right': ['gira a destra'],
    'turn left': ['gira a sinistra'],
    'go straight': ['vai dritto'],
    'it\'s near': ['è vicino'],
    'it\'s far': ['è lontano'],
    'it\'s here': ['è qui'],
    'it\'s there': ['è lì'],
    'do you speak english': ['parli inglese'],
    'do you speak italian': ['parli italiano'],
    'a little': ['un po\''],
    'i speak a little italian': ['parlo un po\' di italiano'],
    'can you repeat': ['puoi ripetere'],
    'can you write it': ['puoi scriverlo'],
    'what does it mean': ['cosa significa', 'che significa'],
    'how do you say': ['come si dice'],
    'where can i find': ['dove posso trovare'],
    'is there': ['c\'è'],
    'are there': ['ci sono'],
    'how do i get to': ['come arrivo a'],
    'how far is it': ['quanto è lontano'],
    'what\'s this': ['cos\'è questo'],
    'what\'s that': ['cos\'è quello'],
    'i would like': ['vorrei'],
    'may i': ['posso'],
    'do you have': ['hai', 'avete'],
    'there is': ['c\'è'],
    'there are': ['ci sono'],
    'what happened': ['cosa è successo'],
    'don\'t worry': ['non preoccuparti'],
    'everything is fine': ['tutto bene', 'va tutto bene'],
    'are you okay': ['stai bene'],
    'i\'m fine': ['sto bene'],
    'what\'s wrong': ['cosa c\'è che non va'],
    'nothing': ['niente', 'nulla'],
    'something': ['qualcosa'],
    'everything': ['tutto'],
    'everyone': ['tutti'],
    'no one': ['nessuno'],
    'someone': ['qualcuno'],
    'somewhere': ['da qualche parte'],
    'anywhere': ['ovunque', 'da qualsiasi parte'],
    'everywhere': ['dappertutto'],
    'here': ['qui'],
    'there': ['lì', 'là'],
    'soon': ['presto'],
    'already': ['già'],
    'still': ['ancora'],
    'yet': ['ancora'],
    'again': ['ancora', 'di nuovo'],
    'more': ['più', 'ancora'],
    'less': ['meno'],
    'enough': ['abbastanza'],
    'too much': ['troppo'],
    'a lot': ['molto', 'tanto'],
    'all': ['tutto', 'tutti'],
    'some': ['alcuni', 'qualche'],
    'many': ['molti'],
    'few': ['pochi'],
    'several': ['diversi', 'parecchi'],
    'both': ['entrambi', 'tutti e due'],
    'each': ['ogni', 'ciascuno'],
    'every': ['ogni'],
    'other': ['altro'],
    'another': ['un altro']
  };

  // Reverse dictionaries (IT→ES, IT→EN)
  private static italianToSpanishDictionary: Record<string, string[]> = {};
  private static italianToEnglishDictionary: Record<string, string[]> = {};

  // Initialize reverse dictionaries
  private static initializeReverseDictionaries() {
    if (Object.keys(this.italianToSpanishDictionary).length === 0) {
      // Create IT→ES dictionary
      for (const [spanish, italianArray] of Object.entries(this.spanishDictionary)) {
        for (const italian of italianArray) {
          const normalizedItalian = italian.toLowerCase();
          if (!this.italianToSpanishDictionary[normalizedItalian]) {
            this.italianToSpanishDictionary[normalizedItalian] = [];
          }
          if (!this.italianToSpanishDictionary[normalizedItalian].includes(spanish)) {
            this.italianToSpanishDictionary[normalizedItalian].push(spanish);
          }
        }
      }
    }

    if (Object.keys(this.italianToEnglishDictionary).length === 0) {
      // Create IT→EN dictionary
      for (const [english, italianArray] of Object.entries(this.englishDictionary)) {
        for (const italian of italianArray) {
          const normalizedItalian = italian.toLowerCase();
          if (!this.italianToEnglishDictionary[normalizedItalian]) {
            this.italianToEnglishDictionary[normalizedItalian] = [];
          }
          if (!this.italianToEnglishDictionary[normalizedItalian].includes(english)) {
            this.italianToEnglishDictionary[normalizedItalian].push(english);
          }
        }
      }
    }
  }

  // Cache for phrase translations
  private static phraseCache = new Map<string, string>();

  // DeepL API configuration
  private static readonly DEEPL_API_KEY = Constants.expoConfig?.extra?.deeplApiKey || '';
  private static readonly DEEPL_API_URL = 'https://api-free.deepl.com/v2/translate';
  private static readonly MIN_API_LENGTH = 5; // Minimum characters for API call
  private static readonly API_TIMEOUT = 5000; // 5 seconds timeout

  // Bidirectional translation method (ES↔IT, EN↔IT) with DeepL API support
  static async translateBidirectional(
    text: string,
    sourceLang: Language,
    targetLang: Language
  ): Promise<string> {
    try {
      const normalizedText = text.toLowerCase().trim();

      // Validate that source and target are different
      if (sourceLang === targetLang) {
        return text;
      }

      // Initialize reverse dictionaries on first use
      this.initializeReverseDictionaries();

      // Check cache first
      const cacheKey = `${sourceLang}-${targetLang}:${normalizedText}`;
      if (this.phraseCache.has(cacheKey)) {
        return this.phraseCache.get(cacheKey)!;
      }

      // Select appropriate dictionary based on direction
      let dictionary: Record<string, string[]>;

      if (sourceLang === 'es' && targetLang === 'it') {
        dictionary = this.spanishDictionary;
      } else if (sourceLang === 'en' && targetLang === 'it') {
        dictionary = this.englishDictionary;
      } else if (sourceLang === 'it' && targetLang === 'es') {
        dictionary = this.italianToSpanishDictionary;
      } else if (sourceLang === 'it' && targetLang === 'en') {
        dictionary = this.italianToEnglishDictionary;
      } else {
        // For unsupported combinations (ES↔EN), return a message
        return `Traduzione ${sourceLang.toUpperCase()}→${targetLang.toUpperCase()} non ancora supportata. Usa l'italiano come lingua intermedia.`;
      }

      // 1. Try exact match in dictionary first
      if (dictionary[normalizedText]) {
        const translations = dictionary[normalizedText];
        const result = translations.length === 1
          ? translations[0]
          : translations.join(' • ');
        this.phraseCache.set(cacheKey, result);
        return result;
      }

      // 2. Try DeepL API for phrases or words not in dictionary
      if (normalizedText.length >= this.MIN_API_LENGTH) {
        const apiTranslation = await this.translateWithAPIBidirectional(text, sourceLang, targetLang);
        if (apiTranslation) {
          this.phraseCache.set(cacheKey, apiTranslation);
          return apiTranslation;
        }
      }

      // 3. For longer text, try word-by-word and phrase matching
      const words = normalizedText.split(' ');
      if (words.length > 1) {
        const phraseTranslation = await this.translateByPhrases(words, dictionary);
        if (phraseTranslation && phraseTranslation !== normalizedText) {
          this.phraseCache.set(cacheKey, phraseTranslation);
          return phraseTranslation;
        }
      }

      // 4. Try single word with variations
      const wordTranslation = this.translateSingleWord(normalizedText, dictionary);
      if (wordTranslation) {
        this.phraseCache.set(cacheKey, wordTranslation);
        return wordTranslation;
      }

      // 5. Try partial matches and suggestions
      const suggestions = this.findSmartSuggestions(normalizedText, dictionary);
      if (suggestions.length > 0) {
        const result = this.formatSuggestionsForBidirectional(suggestions, normalizedText, targetLang);
        this.phraseCache.set(cacheKey, result);
        return result;
      }

      // 6. No translation found - provide helpful message
      const notFound = this.getNotFoundMessageBidirectional(text, targetLang);
      return notFound;

    } catch (error) {
      console.error('Bidirectional translation error:', error);
      return this.getErrorMessageBidirectional(text, targetLang);
    }
  }

  static async translate(text: string, sourceLang: Language): Promise<string> {
    try {
      const normalizedText = text.toLowerCase().trim();

      // Check cache first
      const cacheKey = `${sourceLang}:${normalizedText}`;
      if (this.phraseCache.has(cacheKey)) {
        return this.phraseCache.get(cacheKey)!;
      }

      const dictionary = sourceLang === 'es' ? this.spanishDictionary : this.englishDictionary;
      
      // 1. Try exact match in dictionary first
      if (dictionary[normalizedText]) {
        const translations = dictionary[normalizedText];
        const result = translations.length === 1 
          ? translations[0] 
          : translations.join(' • ');
        this.phraseCache.set(cacheKey, result);
        return result;
      }

      // 2. For longer text, try API translation first
      if (normalizedText.length > this.MIN_API_LENGTH && normalizedText.includes(' ')) {
        const apiTranslation = await this.translateWithAPI(text, sourceLang);
        if (apiTranslation) {
          this.phraseCache.set(cacheKey, apiTranslation);
          return apiTranslation;
        }
      }

      // 3. Try to find the longest matching phrase in dictionary
      const words = normalizedText.split(' ');
      if (words.length > 1) {
        const phraseTranslation = await this.translateByPhrases(words, dictionary);
        if (phraseTranslation && phraseTranslation !== normalizedText) {
          this.phraseCache.set(cacheKey, phraseTranslation);
          return phraseTranslation;
        }
      }

      // 4. Try intelligent word-by-word translation with context
      const contextualTranslation = await this.translateWithContext(words, dictionary, sourceLang);
      if (contextualTranslation && contextualTranslation !== normalizedText) {
        this.phraseCache.set(cacheKey, contextualTranslation);
        return contextualTranslation;
      }

      // 5. Try partial matches and suggestions
      const suggestions = this.findSmartSuggestions(normalizedText, dictionary);
      if (suggestions.length > 0) {
        const result = this.formatSuggestions(suggestions, normalizedText, sourceLang);
        this.phraseCache.set(cacheKey, result);
        return result;
      }

      // 6. No translation found - provide helpful message
      const notFound = this.getNotFoundMessage(text, sourceLang);
      return notFound;
      
    } catch (error) {
      console.error('Translation error:', error);
      return this.getErrorMessage(text, sourceLang);
    }
  }

  // API translation using DeepL (original method - ES/EN to IT only)
  private static async translateWithAPI(text: string, sourceLang: Language): Promise<string | null> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.API_TIMEOUT);

      const sourceLangCode = sourceLang === 'es' ? 'ES' : 'EN';
      const targetLangCode = 'IT';

      const formData = new URLSearchParams();
      formData.append('auth_key', this.DEEPL_API_KEY);
      formData.append('text', text);
      formData.append('source_lang', sourceLangCode);
      formData.append('target_lang', targetLangCode);

      const response = await fetch(this.DEEPL_API_URL, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString()
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.log('DeepL API error:', response.status);
        return null;
      }

      const data = await response.json();

      if (data.translations && data.translations.length > 0) {
        const translation = data.translations[0].text;
        // Verify it's not the same as input
        if (translation.toLowerCase() !== text.toLowerCase()) {
          return translation;
        }
      }

      return null;
    } catch (error) {
      // Silently fail and fallback to dictionary
      console.log('DeepL API translation failed, using dictionary fallback');
      return null;
    }
  }

  // Bidirectional API translation using DeepL (supports all directions)
  private static async translateWithAPIBidirectional(
    text: string,
    sourceLang: Language,
    targetLang: Language
  ): Promise<string | null> {
    try {
      // Skip API if no API key configured
      if (!this.DEEPL_API_KEY || this.DEEPL_API_KEY === '') {
        return null;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.API_TIMEOUT);

      // Map language codes for DeepL API
      const langMap: Record<Language, string> = {
        'es': 'ES',
        'en': 'EN',
        'it': 'IT'
      };

      const sourceLangCode = langMap[sourceLang];
      const targetLangCode = langMap[targetLang];

      const formData = new URLSearchParams();
      formData.append('auth_key', this.DEEPL_API_KEY);
      formData.append('text', text);
      formData.append('source_lang', sourceLangCode);
      formData.append('target_lang', targetLangCode);

      const response = await fetch(this.DEEPL_API_URL, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString()
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.log(`DeepL API error (${sourceLang}→${targetLang}):`, response.status);
        return null;
      }

      const data = await response.json();

      if (data.translations && data.translations.length > 0) {
        const translation = data.translations[0].text;
        // Verify it's not the same as input
        if (translation.toLowerCase() !== text.toLowerCase()) {
          console.log(`DeepL translation success: "${text}" → "${translation}"`);
          return translation;
        }
      }

      return null;
    } catch (error) {
      // Silently fail and fallback to dictionary
      console.log('DeepL API bidirectional translation failed, using dictionary fallback', error);
      return null;
    }
  }

  // Translate by finding longest matching phrases
  private static async translateByPhrases(words: string[], dictionary: Record<string, string[]>): Promise<string | null> {
    const translated: string[] = [];
    let i = 0;
    
    while (i < words.length) {
      let phraseFound = false;
      
      // Try to match the longest possible phrase starting from current position
      for (let length = Math.min(words.length - i, 5); length > 0; length--) {
        const phrase = words.slice(i, i + length).join(' ');
        
        if (dictionary[phrase]) {
          translated.push(dictionary[phrase][0]);
          i += length;
          phraseFound = true;
          break;
        }
      }
      
      if (!phraseFound) {
        // Try to translate single word with variations
        const word = words[i];
        const wordTranslation = this.translateSingleWord(word, dictionary);
        translated.push(wordTranslation || word);
        i++;
      }
    }
    
    const result = translated.join(' ');
    return result !== words.join(' ') ? result : null;
  }

  // Translate with context awareness
  private static async translateWithContext(words: string[], dictionary: Record<string, string[]>, sourceLang: Language): Promise<string | null> {
    const translated: string[] = [];
    
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const prevWord = i > 0 ? words[i - 1] : null;
      const nextWord = i < words.length - 1 ? words[i + 1] : null;
      
      // Try contextual translation
      let translation = this.getContextualTranslation(word, prevWord, nextWord, dictionary, sourceLang);
      
      if (!translation) {
        translation = this.translateSingleWord(word, dictionary) || word;
      }
      
      translated.push(translation);
    }
    
    const result = translated.join(' ');
    return result !== words.join(' ') ? result : null;
  }

  // Get contextual translation based on surrounding words
  private static getContextualTranslation(
    word: string, 
    prevWord: string | null, 
    nextWord: string | null, 
    dictionary: Record<string, string[]>,
    sourceLang: Language
  ): string | null {
    // Handle common contextual patterns
    if (sourceLang === 'es') {
      // Spanish contextual rules
      if (word === 'de' && nextWord && ['la', 'el', 'los', 'las'].includes(nextWord)) {
        return 'del'; // de + el = del in Italian context
      }
      if (word === 'a' && nextWord && ['la', 'el', 'los', 'las'].includes(nextWord)) {
        return 'al'; // a + el = al in Italian context
      }
    } else {
      // English contextual rules
      if (word === 'the' && prevWord && ['to', 'of', 'in'].includes(prevWord)) {
        return 'il'; // Default to masculine singular
      }
    }
    
    // Check for verb conjugations based on subject
    if (prevWord && this.isSubjectPronoun(prevWord, sourceLang)) {
      const conjugated = this.getConjugatedForm(word, prevWord, dictionary, sourceLang);
      if (conjugated) return conjugated;
    }
    
    return null;
  }

  // Check if a word is a subject pronoun
  private static isSubjectPronoun(word: string, sourceLang: Language): boolean {
    const spanishPronouns = ['yo', 'tú', 'él', 'ella', 'nosotros', 'vosotros', 'ellos', 'ellas'];
    const englishPronouns = ['i', 'you', 'he', 'she', 'we', 'they'];
    
    return sourceLang === 'es' 
      ? spanishPronouns.includes(word.toLowerCase())
      : englishPronouns.includes(word.toLowerCase());
  }

  // Get conjugated form of verb based on subject
  private static getConjugatedForm(
    verb: string, 
    subject: string, 
    dictionary: Record<string, string[]>,
    sourceLang: Language
  ): string | null {
    // This is a simplified version - in a real app, you'd have proper conjugation rules
    const verbTranslation = dictionary[verb];
    if (verbTranslation && verbTranslation.length > 0) {
      // Return infinitive for now - could be enhanced with conjugation rules
      return verbTranslation[0];
    }
    return null;
  }

  // Translate a single word with variations
  private static translateSingleWord(word: string, dictionary: Record<string, string[]>): string | null {
    // Direct match
    if (dictionary[word]) {
      return dictionary[word][0];
    }
    
    // Try variations (plural, conjugations, etc.)
    const variations = this.findWordVariations(word, dictionary);
    if (variations.length > 0) {
      return variations[0];
    }
    
    // Try stem matching
    const stem = this.getStem(word);
    if (stem && stem !== word) {
      for (const [key, values] of Object.entries(dictionary)) {
        if (this.getStem(key) === stem) {
          return values[0];
        }
      }
    }
    
    return null;
  }

  // Get word stem (basic implementation)
  private static getStem(word: string): string {
    // Remove common endings
    const endings = ['s', 'es', 'ed', 'ing', 'ly', 'er', 'est', 'tion', 'mente', 'ando', 'iendo'];
    
    for (const ending of endings) {
      if (word.endsWith(ending) && word.length > ending.length + 2) {
        return word.slice(0, -ending.length);
      }
    }
    
    return word;
  }

  private static findWordVariations(word: string, dictionary: Record<string, string[]>): string[] {
    const variations: string[] = [];
    const lowerWord = word.toLowerCase();
    
    // Direct variations
    for (const [key, values] of Object.entries(dictionary)) {
      // Check for words that start with the input or vice versa
      if (key.startsWith(lowerWord) || lowerWord.startsWith(key)) {
        variations.push(...values);
      }
      
      // Check for words that share the same stem
      if (this.getStem(key) === this.getStem(lowerWord)) {
        variations.push(...values);
      }
      
      // Check for Levenshtein distance <= 1 (for typos)
      if (this.levenshteinDistance(key, lowerWord) <= 1) {
        variations.push(...values);
      }
    }
    
    // Remove duplicates and return
    return Array.from(new Set(variations));
  }

  // Calculate Levenshtein distance between two strings
  private static levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];
    
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
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  // Find smart suggestions based on partial matches and similarity
  private static findSmartSuggestions(text: string, dictionary: Record<string, string[]>): string[] {
    const suggestions: string[] = [];
    const scoredMatches: { translation: string; score: number }[] = [];
    
    for (const [key, values] of Object.entries(dictionary)) {
      let score = 0;
      
      // Exact substring match
      if (key.includes(text)) {
        score += 5;
        if (key.startsWith(text)) score += 3;
      }
      if (text.includes(key)) {
        score += 4;
      }
      
      // Word boundary matches
      const keyWords = key.split(' ');
      const textWords = text.split(' ');
      
      const commonWords = keyWords.filter(kw => textWords.some(tw => tw === kw));
      score += commonWords.length * 3;
      
      // Partial word matches
      const partialMatches = keyWords.filter(kw => 
        textWords.some(tw => tw.includes(kw) || kw.includes(tw))
      );
      score += partialMatches.length * 2;
      
      // Levenshtein distance bonus
      const distance = this.levenshteinDistance(key, text);
      if (distance <= 3) {
        score += (4 - distance);
      }
      
      // Add to scored matches if score > 0
      if (score > 0) {
        values.forEach(value => {
          scoredMatches.push({ translation: value, score });
        });
      }
    }
    
    // Sort by score and take top matches
    scoredMatches.sort((a, b) => b.score - a.score);
    const topMatches = scoredMatches.slice(0, 5);
    
    return topMatches.map(m => m.translation);
  }

  // Format suggestions in a user-friendly way
  private static formatSuggestions(suggestions: string[], originalText: string, sourceLang: Language): string {
    if (suggestions.length === 0) {
      return this.getNotFoundMessage(originalText, sourceLang);
    }
    
    if (suggestions.length === 1) {
      return `${suggestions[0]} (suggerimento)`;
    }
    
    const topSuggestions = suggestions.slice(0, 3).join(' • ');
    return `Suggerimenti: ${topSuggestions}`;
  }

  // Get helpful not found message
  private static getNotFoundMessage(text: string, sourceLang: Language): string {
    if (sourceLang === 'es') {
      return `"${text}" non trovato. Prova:
• Controllare l'ortografia
• Usare parole più semplici
• Dividere frasi lunghe`;
    } else {
      return `"${text}" not found. Try:
• Checking spelling
• Using simpler words
• Breaking up long phrases`;
    }
  }

  // Get error message
  private static getErrorMessage(text: string, sourceLang: Language): string {
    if (sourceLang === 'es') {
      return `Errore nella traduzione di "${text}". Riprova più tardi.`;
    } else {
      return `Error translating "${text}". Please try again later.`;
    }
  }

  // Bidirectional helper methods
  private static formatSuggestionsForBidirectional(suggestions: string[], originalText: string, targetLang: Language): string {
    if (suggestions.length === 0) {
      return this.getNotFoundMessageBidirectional(originalText, targetLang);
    }

    if (suggestions.length === 1) {
      return `${suggestions[0]} (suggerimento)`;
    }

    const topSuggestions = suggestions.slice(0, 3).join(' • ');
    return `Suggerimenti: ${topSuggestions}`;
  }

  private static getNotFoundMessageBidirectional(text: string, targetLang: Language): string {
    const langName = targetLang === 'it' ? 'italiano' : targetLang === 'es' ? 'spagnolo' : 'inglese';
    return `"${text}" non trovato nel dizionario ${langName}. Prova:
• Controllare l'ortografia
• Usare parole più semplici
• Dividere frasi lunghe`;
  }

  private static getErrorMessageBidirectional(text: string, targetLang: Language): string {
    return `Errore nella traduzione di "${text}". Riprova più tardi.`;
  }

  static getRandomWord(sourceLang: Language): { original: string, translation: string } {
    const dictionary = sourceLang === 'es' ? this.spanishDictionary : this.englishDictionary;
    const keys = Object.keys(dictionary);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    return {
      original: randomKey,
      translation: dictionary[randomKey][0]
    };
  }

  static getSuggestions(text: string, sourceLang: Language): string[] {
    const normalizedText = text.toLowerCase().trim();
    const dictionary = sourceLang === 'es' ? this.spanishDictionary : this.englishDictionary;
    const suggestions: string[] = [];
    
    if (normalizedText.length < 2) return suggestions;
    
    // Find keys that start with the input text
    for (const key of Object.keys(dictionary)) {
      if (key.startsWith(normalizedText)) {
        suggestions.push(key);
      }
    }
    
    // If few suggestions, also include keys that contain the text
    if (suggestions.length < 5) {
      for (const key of Object.keys(dictionary)) {
        if (!suggestions.includes(key) && key.includes(normalizedText)) {
          suggestions.push(key);
        }
      }
    }
    
    // Sort by relevance (exact starts first, then by length)
    suggestions.sort((a, b) => {
      const aStarts = a.startsWith(normalizedText);
      const bStarts = b.startsWith(normalizedText);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      return a.length - b.length;
    });
    
    return suggestions.slice(0, 10);
  }

  // Clear cache periodically to prevent memory issues
  static clearCache(): void {
    this.phraseCache.clear();
  }
}

// Clear cache every hour
setInterval(() => {
  TranslationService.clearCache();
}, 3600000);