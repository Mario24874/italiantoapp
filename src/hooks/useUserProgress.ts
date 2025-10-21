import { useState, useEffect } from 'react';
import StorageService, { UserProgress, TranslationHistoryItem } from '../services/storageService';

export const useUserProgress = () => {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProgress();
    updateStreak();
  }, []);

  const loadProgress = async () => {
    try {
      const userProgress = await StorageService.getUserProgress();
      setProgress(userProgress);
    } catch (error) {
      console.error('Error loading progress:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStreak = async () => {
    try {
      await StorageService.updateStreak();
      // Recargar progreso después de actualizar streak
      const updatedProgress = await StorageService.getUserProgress();
      setProgress(updatedProgress);
    } catch (error) {
      console.error('Error updating streak:', error);
    }
  };

  const addTranslation = async (originalText: string, translatedText: string, sourceLanguage: 'es' | 'en') => {
    try {
      await StorageService.addToTranslationHistory({
        originalText,
        translatedText,
        sourceLanguage,
        isFavorite: false,
      });
      await loadProgress(); // Recargar progreso
    } catch (error) {
      console.error('Error adding translation:', error);
    }
  };

  const addConjugation = async () => {
    try {
      await StorageService.incrementConjugationCount();
      await loadProgress(); // Recargar progreso
    } catch (error) {
      console.error('Error adding conjugation:', error);
    }
  };

  const updatePronunciation = async (word: string, score: number) => {
    try {
      await StorageService.updatePronunciationStats(word, score);
      await loadProgress(); // Recargar progreso
    } catch (error) {
      console.error('Error updating pronunciation:', error);
    }
  };

  const toggleFavoriteWord = async (word: string) => {
    try {
      const isFav = await StorageService.isFavorite(word);
      if (isFav) {
        await StorageService.removeFromFavorites(word);
      } else {
        await StorageService.addToFavorites(word);
      }
      await loadProgress(); // Recargar progreso
    } catch (error) {
      console.error('Error toggling favorite word:', error);
    }
  };

  const getStats = () => {
    if (!progress) return null;

    const accuracyRate = progress.pronunciationAttempts > 0 
      ? Math.round((progress.pronunciationSuccess / progress.pronunciationAttempts) * 100)
      : 0;

    const averageScore = progress.pronunciationAttempts > 0
      ? Math.round(progress.totalScore / progress.pronunciationAttempts)
      : 0;

    return {
      totalActivities: progress.totalTranslations + progress.totalConjugations + progress.pronunciationAttempts,
      accuracyRate,
      averageScore,
      streakDays: progress.streakDays,
      favoriteWordsCount: progress.favoriteWords.length,
    };
  };

  return {
    progress,
    isLoading,
    addTranslation,
    addConjugation,
    updatePronunciation,
    toggleFavoriteWord,
    getStats,
    refreshProgress: loadProgress,
  };
};