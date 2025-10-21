import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserProgress {
  totalTranslations: number;
  totalConjugations: number;
  pronunciationAttempts: number;
  pronunciationSuccess: number;
  favoriteWords: string[];
  translationHistory: TranslationHistoryItem[];
  lastUsed: string;
  streakDays: number;
  totalScore: number;
}

export interface TranslationHistoryItem {
  id: string;
  originalText: string;
  translatedText: string;
  sourceLanguage: 'es' | 'en';
  timestamp: string;
  isFavorite: boolean;
}

export interface PronunciationStats {
  word: string;
  attempts: number;
  bestScore: number;
  lastAttempt: string;
}

class StorageService {
  private static readonly KEYS = {
    USER_PROGRESS: 'user_progress',
    TRANSLATION_HISTORY: 'translation_history',
    PRONUNCIATION_STATS: 'pronunciation_stats',
    FAVORITE_WORDS: 'favorite_words',
    APP_SETTINGS: 'app_settings',
  };

  // User Progress
  static async getUserProgress(): Promise<UserProgress> {
    try {
      const progress = await AsyncStorage.getItem(this.KEYS.USER_PROGRESS);
      if (progress) {
        return JSON.parse(progress);
      }
      return this.getDefaultProgress();
    } catch (error) {
      console.error('Error getting user progress:', error);
      return this.getDefaultProgress();
    }
  }

  static async updateUserProgress(updates: Partial<UserProgress>): Promise<void> {
    try {
      const currentProgress = await this.getUserProgress();
      const updatedProgress = {
        ...currentProgress,
        ...updates,
        lastUsed: new Date().toISOString(),
      };
      await AsyncStorage.setItem(this.KEYS.USER_PROGRESS, JSON.stringify(updatedProgress));
    } catch (error) {
      console.error('Error updating user progress:', error);
    }
  }

  private static getDefaultProgress(): UserProgress {
    return {
      totalTranslations: 0,
      totalConjugations: 0,
      pronunciationAttempts: 0,
      pronunciationSuccess: 0,
      favoriteWords: [],
      translationHistory: [],
      lastUsed: new Date().toISOString(),
      streakDays: 0,
      totalScore: 0,
    };
  }

  // Translation History
  static async addToTranslationHistory(item: Omit<TranslationHistoryItem, 'id' | 'timestamp'>): Promise<void> {
    try {
      const history = await this.getTranslationHistory();
      const newItem: TranslationHistoryItem = {
        ...item,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
      };
      
      // Mantener solo los últimos 100 elementos
      const updatedHistory = [newItem, ...history].slice(0, 100);
      
      await AsyncStorage.setItem(this.KEYS.TRANSLATION_HISTORY, JSON.stringify(updatedHistory));
      
      // Actualizar contador
      await this.incrementTranslationCount();
    } catch (error) {
      console.error('Error adding to translation history:', error);
    }
  }

  static async getTranslationHistory(): Promise<TranslationHistoryItem[]> {
    try {
      const history = await AsyncStorage.getItem(this.KEYS.TRANSLATION_HISTORY);
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('Error getting translation history:', error);
      return [];
    }
  }

  static async toggleFavoriteTranslation(id: string): Promise<void> {
    try {
      const history = await this.getTranslationHistory();
      const updatedHistory = history.map(item => 
        item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
      );
      await AsyncStorage.setItem(this.KEYS.TRANSLATION_HISTORY, JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Error toggling favorite translation:', error);
    }
  }

  // Pronunciation Statistics
  static async updatePronunciationStats(word: string, score: number): Promise<void> {
    try {
      const stats = await this.getPronunciationStats();
      const existingWordStats = stats.find(stat => stat.word === word);
      
      if (existingWordStats) {
        existingWordStats.attempts += 1;
        existingWordStats.bestScore = Math.max(existingWordStats.bestScore, score);
        existingWordStats.lastAttempt = new Date().toISOString();
      } else {
        stats.push({
          word,
          attempts: 1,
          bestScore: score,
          lastAttempt: new Date().toISOString(),
        });
      }
      
      await AsyncStorage.setItem(this.KEYS.PRONUNCIATION_STATS, JSON.stringify(stats));
      
      // Actualizar progreso general
      const progress = await this.getUserProgress();
      await this.updateUserProgress({
        pronunciationAttempts: progress.pronunciationAttempts + 1,
        pronunciationSuccess: score >= 70 ? progress.pronunciationSuccess + 1 : progress.pronunciationSuccess,
        totalScore: progress.totalScore + score,
      });
    } catch (error) {
      console.error('Error updating pronunciation stats:', error);
    }
  }

  static async getPronunciationStats(): Promise<PronunciationStats[]> {
    try {
      const stats = await AsyncStorage.getItem(this.KEYS.PRONUNCIATION_STATS);
      return stats ? JSON.parse(stats) : [];
    } catch (error) {
      console.error('Error getting pronunciation stats:', error);
      return [];
    }
  }

  // Favorite Words
  static async addToFavorites(word: string): Promise<void> {
    try {
      const progress = await this.getUserProgress();
      if (!progress.favoriteWords.includes(word)) {
        const updatedFavorites = [...progress.favoriteWords, word];
        await this.updateUserProgress({ favoriteWords: updatedFavorites });
      }
    } catch (error) {
      console.error('Error adding to favorites:', error);
    }
  }

  static async removeFromFavorites(word: string): Promise<void> {
    try {
      const progress = await this.getUserProgress();
      const updatedFavorites = progress.favoriteWords.filter(w => w !== word);
      await this.updateUserProgress({ favoriteWords: updatedFavorites });
    } catch (error) {
      console.error('Error removing from favorites:', error);
    }
  }

  static async isFavorite(word: string): Promise<boolean> {
    try {
      const progress = await this.getUserProgress();
      return progress.favoriteWords.includes(word);
    } catch (error) {
      console.error('Error checking if favorite:', error);
      return false;
    }
  }

  // Helper methods
  private static async incrementTranslationCount(): Promise<void> {
    const progress = await this.getUserProgress();
    await this.updateUserProgress({ 
      totalTranslations: progress.totalTranslations + 1 
    });
  }

  static async incrementConjugationCount(): Promise<void> {
    const progress = await this.getUserProgress();
    await this.updateUserProgress({ 
      totalConjugations: progress.totalConjugations + 1 
    });
  }

  // Streak Management
  static async updateStreak(): Promise<void> {
    try {
      const progress = await this.getUserProgress();
      const today = new Date().toDateString();
      const lastUsed = new Date(progress.lastUsed).toDateString();
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
      
      if (lastUsed === today) {
        // Ya se usó hoy, no cambiar streak
        return;
      }
      
      if (lastUsed === yesterday) {
        // Usado ayer, incrementar streak
        await this.updateUserProgress({ 
          streakDays: progress.streakDays + 1 
        });
      } else {
        // No usado ayer, resetear streak
        await this.updateUserProgress({ 
          streakDays: 1 
        });
      }
    } catch (error) {
      console.error('Error updating streak:', error);
    }
  }

  // Clear all data
  static async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(Object.values(this.KEYS));
    } catch (error) {
      console.error('Error clearing all data:', error);
    }
  }

  // Export data for backup
  static async exportUserData(): Promise<string> {
    try {
      const keys = Object.values(this.KEYS);
      const values = await AsyncStorage.multiGet(keys);
      const data: Record<string, any> = {};
      
      values.forEach(([key, value]) => {
        if (value) {
          data[key] = JSON.parse(value);
        }
      });
      
      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error('Error exporting user data:', error);
      return '{}';
    }
  }
}

export default StorageService;