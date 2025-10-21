import AsyncStorage from '@react-native-async-storage/async-storage';

export type SubscriptionTier = 'free' | 'premium';

export interface SubscriptionStatus {
  tier: SubscriptionTier;
  isActive: boolean;
  expiresAt?: string;
  features: string[];
}

export interface PremiumFeature {
  id: string;
  name: string;
  description: string;
  icon: string;
  available: boolean;
}

/**
 * Servicio de Suscripción Premium
 *
 * Este servicio gestiona el sistema de suscripción premium de ItaliantoApp.
 * Funcionalidades planeadas para Premium:
 *
 * 1. Tutor AI Personalizado
 *    - Conversaciones en italiano con IA
 *    - Corrección de gramática en tiempo real
 *    - Ejercicios personalizados según nivel
 *
 * 2. Contenido Avanzado
 *    - Lecciones estructuradas por nivel (A1-C2)
 *    - Videos explicativos de gramática
 *    - Ejercicios interactivos avanzados
 *
 * 3. Funciones Premium
 *    - Sin límites en traducciones
 *    - Acceso a todos los tiempos verbales
 *    - Estadísticas avanzadas con gráficos
 *    - Modo offline completo
 *    - Exportar progreso a PDF
 *
 * 4. Gamificación Mejorada
 *    - Logros exclusivos
 *    - Tablas de clasificación
 *    - Desafíos semanales
 *    - Recompensas especiales
 */
export class SubscriptionService {
  private static readonly STORAGE_KEY = 'subscription_status';

  // Features disponibles en cada tier
  private static readonly FREE_FEATURES = [
    'basic_translation',
    'basic_conjugation',
    'basic_pronunciation',
    'basic_dictionary',
    'basic_stats',
  ];

  private static readonly PREMIUM_FEATURES = [
    ...SubscriptionService.FREE_FEATURES,
    'ai_tutor',
    'unlimited_translations',
    'advanced_lessons',
    'offline_mode',
    'export_progress',
    'advanced_stats',
    'exclusive_achievements',
    'weekly_challenges',
    'video_lessons',
    'grammar_checker',
  ];

  /**
   * Obtiene el estado actual de la suscripción del usuario
   */
  static async getSubscriptionStatus(): Promise<SubscriptionStatus> {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEY);

      if (data) {
        const status = JSON.parse(data);

        // Verificar si la suscripción ha expirado
        if (status.expiresAt && new Date(status.expiresAt) < new Date()) {
          return this.getDefaultFreeStatus();
        }

        return status;
      }

      return this.getDefaultFreeStatus();
    } catch (error) {
      console.error('Error getting subscription status:', error);
      return this.getDefaultFreeStatus();
    }
  }

  /**
   * Verifica si el usuario tiene acceso premium
   */
  static async hasPremiumAccess(): Promise<boolean> {
    const status = await this.getSubscriptionStatus();
    return status.tier === 'premium' && status.isActive;
  }

  /**
   * Verifica si el usuario tiene acceso a una feature específica
   */
  static async hasFeatureAccess(featureId: string): Promise<boolean> {
    const status = await this.getSubscriptionStatus();
    return status.features.includes(featureId);
  }

  /**
   * Obtiene todas las features premium disponibles
   */
  static getPremiumFeatures(): PremiumFeature[] {
    return [
      {
        id: 'ai_tutor',
        name: 'Tutor AI Personalizado',
        description: 'Conversa in italiano con un tutor virtuale alimentato da IA',
        icon: 'chatbubbles',
        available: false, // Será true en futuras versiones
      },
      {
        id: 'unlimited_translations',
        name: 'Traduzioni Illimitate',
        description: 'Traduci senza limiti con accesso all\'API premium',
        icon: 'infinite',
        available: true,
      },
      {
        id: 'advanced_lessons',
        name: 'Lezioni Avanzate',
        description: 'Accesso a lezioni strutturate per livelli A1-C2',
        icon: 'school',
        available: false,
      },
      {
        id: 'offline_mode',
        name: 'Modalità Offline',
        description: 'Usa l\'app senza connessione internet',
        icon: 'cloud-offline',
        available: false,
      },
      {
        id: 'export_progress',
        name: 'Esporta Progresso',
        description: 'Scarica il tuo progresso in formato PDF',
        icon: 'download',
        available: true,
      },
      {
        id: 'advanced_stats',
        name: 'Statistiche Avanzate',
        description: 'Grafici dettagliati del tuo apprendimento',
        icon: 'analytics',
        available: true,
      },
      {
        id: 'video_lessons',
        name: 'Video Lezioni',
        description: 'Lezioni video sulla grammatica italiana',
        icon: 'videocam',
        available: false,
      },
      {
        id: 'grammar_checker',
        name: 'Correttore Grammaticale',
        description: 'Correzione automatica della grammatica',
        icon: 'checkmark-done',
        available: false,
      },
    ];
  }

  /**
   * Simula la activación de una suscripción premium
   * En producción, esto se integraría con servicios de pago como RevenueCat, Stripe, etc.
   */
  static async activatePremium(duration: number = 30): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + duration);

    const status: SubscriptionStatus = {
      tier: 'premium',
      isActive: true,
      expiresAt: expiresAt.toISOString(),
      features: this.PREMIUM_FEATURES,
    };

    await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(status));
  }

  /**
   * Cancela la suscripción premium
   */
  static async cancelPremium(): Promise<void> {
    const status = this.getDefaultFreeStatus();
    await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(status));
  }

  /**
   * Obtiene el estado gratuito por defecto
   */
  private static getDefaultFreeStatus(): SubscriptionStatus {
    return {
      tier: 'free',
      isActive: true,
      features: this.FREE_FEATURES,
    };
  }

  /**
   * Obtiene los planes de suscripción disponibles
   * Precios de ejemplo - ajustar según mercado
   */
  static getSubscriptionPlans() {
    return [
      {
        id: 'monthly',
        name: 'Piano Mensile',
        price: '$9.99',
        duration: 'al mese',
        features: this.PREMIUM_FEATURES,
        popular: false,
      },
      {
        id: 'yearly',
        name: 'Piano Annuale',
        price: '$79.99',
        duration: 'all\'anno',
        savings: 'Risparmia il 33%',
        features: this.PREMIUM_FEATURES,
        popular: true,
      },
      {
        id: 'lifetime',
        name: 'Accesso a Vita',
        price: '$199.99',
        duration: 'pagamento unico',
        savings: 'Miglior valore',
        features: this.PREMIUM_FEATURES,
        popular: false,
      },
    ];
  }

  /**
   * Verifica si una feature específica está habilitada
   * (independientemente de la suscripción)
   */
  static isFeatureEnabled(featureId: string): boolean {
    const availableFeatures = this.getPremiumFeatures();
    const feature = availableFeatures.find(f => f.id === featureId);
    return feature?.available || false;
  }
}
