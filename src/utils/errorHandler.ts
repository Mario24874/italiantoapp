export class ErrorHandler {
  static logError(error: Error, context: string) {
    console.error(`[${context}] Error:`, error.message);
    console.error('Stack:', error.stack);
  }

  static handleVoiceError(error: any): string {
    if (!error) return 'Errore sconosciuto';
    
    const errorMessage = error.error?.message || error.message || '';
    
    if (errorMessage.includes('No speech input')) {
      return 'Nessun audio rilevato. Prova a parlare più chiaramente.';
    }
    
    if (errorMessage.includes('Audio recording error')) {
      return 'Errore di registrazione. Verifica i permessi del microfono.';
    }
    
    if (errorMessage.includes('Speech recognition not available')) {
      return 'Riconoscimento vocale non disponibile su questo dispositivo.';
    }
    
    if (errorMessage.includes('Permission denied')) {
      return 'Permesso del microfono negato. Abilitalo nelle impostazioni.';
    }
    
    if (errorMessage.includes('Network error')) {
      return 'Errore di connessione. Verifica la tua connessione internet.';
    }
    
    return `Errore: ${errorMessage}`;
  }

  static handleTranslationError(error: any): string {
    if (!error) return 'Errore di traduzione sconosciuto';
    
    const errorMessage = error.message || '';
    
    if (errorMessage.includes('Network')) {
      return 'Errore di connessione durante la traduzione';
    }
    
    if (errorMessage.includes('API')) {
      return 'Servizio di traduzione temporaneamente non disponibile';
    }
    
    return 'Errore durante la traduzione. Riprova.';
  }

  static validateInput(text: string, maxLength: number = 70): boolean {
    if (!text || typeof text !== 'string') return false;
    if (text.trim().length === 0) return false;
    if (text.length > maxLength) return false;
    return true;
  }

  static sanitizeInput(text: string): string {
    if (!text) return '';
    return text.trim().toLowerCase().replace(/[^\w\s\-']/g, '');
  }

  static retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const attempt = (retriesLeft: number) => {
        operation()
          .then(resolve)
          .catch((error) => {
            if (retriesLeft === 0) {
              reject(error);
            } else {
              setTimeout(() => attempt(retriesLeft - 1), delay);
            }
          });
      };
      
      attempt(maxRetries);
    });
  }
}