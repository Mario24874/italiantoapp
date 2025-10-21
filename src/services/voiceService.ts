import Voice from '@react-native-voice/voice';
import { ErrorHandler } from '../utils/errorHandler';

export class VoiceService {
  private static isInitialized = false;
  private static isListening = false;
  private static currentCallbacks: {
    onResults?: (results: string[]) => void;
    onError?: (error: any) => void;
    onStart?: () => void;
    onEnd?: () => void;
  } = {};
  private static partialResults: string[] = [];
  private static finalResults: string[] = [];

  static async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Limpiar cualquier estado anterior
      await this.cleanup();
      
      // Configurar callbacks
      Voice.onSpeechStart = this.onSpeechStart.bind(this);
      Voice.onSpeechEnd = this.onSpeechEnd.bind(this);
      Voice.onSpeechError = this.onSpeechError.bind(this);
      Voice.onSpeechResults = this.onSpeechResults.bind(this);
      Voice.onSpeechPartialResults = this.onSpeechPartialResults.bind(this);
      Voice.onSpeechVolumeChanged = this.onSpeechVolumeChanged.bind(this);

      this.isInitialized = true;
      console.log('Voice service initialized successfully');
    } catch (error) {
      console.error('Error initializing voice service:', error);
      throw error;
    }
  }

  static async cleanup(): Promise<void> {
    try {
      if (this.isListening) {
        await Voice.stop();
        await Voice.cancel();
      }
      
      await Voice.destroy();
      Voice.removeAllListeners();
      
      this.isInitialized = false;
      this.isListening = false;
      this.currentCallbacks = {};
      
      console.log('Voice service cleaned up');
    } catch (error) {
      console.error('Error cleaning up voice service:', error);
    }
  }

  static async startListening(callbacks: {
    onResults?: (results: string[]) => void;
    onError?: (error: any) => void;
    onStart?: () => void;
    onEnd?: () => void;
  } = {}): Promise<void> {
    try {
      // Inicializar si no está inicializado
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Si ya está escuchando, parar primero
      if (this.isListening) {
        await this.stopListening();
        // Esperar un poco antes de reiniciar
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Limpiar resultados anteriores
      this.partialResults = [];
      this.finalResults = [];

      // Guardar callbacks
      this.currentCallbacks = callbacks;

      // Intentar iniciar reconocimiento con reintentos
      await ErrorHandler.retryOperation(async () => {
        console.log('Starting voice recognition...');
        await Voice.start('it-IT');
        this.isListening = true;
      }, 3, 1000);

      console.log('Voice recognition started successfully');
      
    } catch (error) {
      this.isListening = false;
      console.error('Error starting voice recognition:', error);
      
      const errorMessage = ErrorHandler.handleVoiceError(error);
      if (callbacks.onError) {
        callbacks.onError({ message: errorMessage });
      }
      throw new Error(errorMessage);
    }
  }

  static async stopListening(): Promise<void> {
    try {
      if (this.isListening) {
        console.log('Stopping voice recognition...');
        await Voice.stop();
        this.isListening = false;
      }
    } catch (error) {
      console.error('Error stopping voice recognition:', error);
      this.isListening = false;
    }
  }

  static async cancelListening(): Promise<void> {
    try {
      if (this.isListening) {
        console.log('Cancelling voice recognition...');
        await Voice.cancel();
        this.isListening = false;
      }
    } catch (error) {
      console.error('Error cancelling voice recognition:', error);
      this.isListening = false;
    }
  }

  static isCurrentlyListening(): boolean {
    return this.isListening;
  }

  // Callbacks del Voice
  private static onSpeechStart(): void {
    console.log('Speech started');
    this.isListening = true;
    if (this.currentCallbacks.onStart) {
      this.currentCallbacks.onStart();
    }
  }

  private static onSpeechEnd(): void {
    console.log('Speech ended');
    this.isListening = false;
    
    // Si no hay resultados finales, usar los parciales
    if (this.finalResults.length === 0 && this.partialResults.length > 0) {
      console.log('Using partial results as final results');
      this.finalResults = [...this.partialResults];
      if (this.currentCallbacks.onResults) {
        this.currentCallbacks.onResults(this.finalResults);
      }
    }
    
    if (this.currentCallbacks.onEnd) {
      this.currentCallbacks.onEnd();
    }
  }

  private static onSpeechError(error: any): void {
    console.error('Speech error:', error);
    this.isListening = false;
    
    if (this.currentCallbacks.onError) {
      this.currentCallbacks.onError(error);
    }
  }

  private static onSpeechResults(e: any): void {
    console.log('Speech results:', e.value);
    
    if (e.value && e.value.length > 0) {
      this.finalResults = e.value;
      if (this.currentCallbacks.onResults) {
        this.currentCallbacks.onResults(e.value);
      }
    }
  }

  private static onSpeechPartialResults(e: any): void {
    console.log('Partial results:', e.value);
    
    if (e.value && e.value.length > 0) {
      this.partialResults = e.value;
      // Opcionalmente, podemos notificar los resultados parciales
      // para dar feedback inmediato al usuario
      if (this.currentCallbacks.onResults) {
        this.currentCallbacks.onResults(e.value);
      }
    }
  }

  private static onSpeechVolumeChanged(e: any): void {
    // Solo log en debug mode para no llenar los logs
    // console.log('Volume changed:', e.value);
  }

  static async checkPermissions(): Promise<boolean> {
    try {
      // En React Native, los permisos se manejan automáticamente
      // Esta función puede expandirse en el futuro si necesitamos verificaciones específicas
      return true;
    } catch (error) {
      console.error('Error checking permissions:', error);
      return false;
    }
  }

  static async requestPermissions(): Promise<boolean> {
    try {
      // Los permisos se solicitan automáticamente al usar Voice.start()
      // Esta función puede expandirse si necesitamos solicitud manual de permisos
      return true;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return false;
    }
  }
}