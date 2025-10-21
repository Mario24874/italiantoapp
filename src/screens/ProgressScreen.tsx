import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { ThemeToggle } from '../components/ThemeToggle';
import { useUserProgress } from '../hooks/useUserProgress';
import { StatsCard } from '../components/StatsCard';
import { CircularProgress } from '../components/CircularProgress';
import { FadeInView } from '../components/FadeInView';

export default function ProgressScreen() {
  const { colors } = useTheme();
  const { progress, isLoading, getStats, refreshProgress } = useUserProgress();
  const styles = getStyles(colors);

  useEffect(() => {
    refreshProgress();
  }, []);

  if (isLoading || !progress) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.loadingText}>Caricamento...</Text>
      </View>
    );
  }

  const stats = getStats();

  // Calculate overall progress
  const totalActivities = (progress.totalTranslations + progress.totalConjugations + progress.pronunciationAttempts) || 1;
  const overallProgress = Math.min(100, (totalActivities / 100) * 100);

  // Pronunciation accuracy
  const accuracyRate = stats?.accuracyRate || 0;
  const averageScore = stats?.averageScore || 0;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <Image source={require('../../assets/Logo_ItaliAnto.png')} style={styles.logo} />
        <ThemeToggle />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Il Tuo Progresso</Text>
        <Text style={styles.subtitle}>Continua così!</Text>

        {/* Streak Card */}
        <FadeInView delay={100}>
          <View style={styles.streakCard}>
            <View style={styles.streakHeader}>
              <Ionicons name="flame" size={40} color="#ff6b35" />
              <View style={styles.streakInfo}>
                <Text style={styles.streakNumber}>{progress.streakDays}</Text>
                <Text style={styles.streakLabel}>Giorni di fila</Text>
              </View>
            </View>
            <Text style={styles.streakMessage}>
              {progress.streakDays === 0 && "Inizia oggi la tua serie!"}
              {progress.streakDays >= 1 && progress.streakDays < 7 && "Ottimo inizio! Continua così!"}
              {progress.streakDays >= 7 && progress.streakDays < 30 && "Fantastico! Sei sulla buona strada!"}
              {progress.streakDays >= 30 && "Incredibile! Sei un campione!"}
            </Text>
          </View>
        </FadeInView>

        {/* Overall Progress */}
        <FadeInView delay={200}>
          <View style={styles.progressCard}>
            <Text style={styles.cardTitle}>Progresso Generale</Text>
            <View style={styles.progressCircleContainer}>
              <CircularProgress
                size={140}
                percentage={overallProgress}
                color={colors.primary}
                backgroundColor={colors.border}
                label="Completato"
                labelColor={colors.text}
              />
            </View>
            <Text style={styles.progressDescription}>
              {totalActivities} attività completate
            </Text>
          </View>
        </FadeInView>

        {/* Activity Stats */}
        <FadeInView delay={300}>
          <Text style={styles.sectionTitle}>Statistiche Attività</Text>

          <StatsCard
            icon="language"
            title="Traduzioni"
            value={progress.totalTranslations}
            subtitle="Parole tradotte"
            delay={350}
          />

          <StatsCard
            icon="book"
            title="Coniugazioni"
            value={progress.totalConjugations}
            subtitle="Verbi coniugati"
            delay={400}
          />

          <StatsCard
            icon="mic"
            title="Pronuncia"
            value={progress.pronunciationAttempts}
            subtitle={`${progress.pronunciationSuccess} corretti`}
            delay={450}
          />
        </FadeInView>

        {/* Pronunciation Performance */}
        {progress.pronunciationAttempts > 0 && (
          <FadeInView delay={500}>
            <View style={styles.performanceCard}>
              <Text style={styles.cardTitle}>Prestazione Pronuncia</Text>

              <View style={styles.performanceRow}>
                <View style={styles.performanceItem}>
                  <CircularProgress
                    size={100}
                    percentage={accuracyRate}
                    color={accuracyRate >= 70 ? '#4caf50' : '#ff9800'}
                    backgroundColor={colors.border}
                    labelColor={colors.text}
                  />
                  <Text style={styles.performanceLabel}>Precisione</Text>
                </View>

                <View style={styles.performanceItem}>
                  <CircularProgress
                    size={100}
                    percentage={averageScore}
                    color={colors.primary}
                    backgroundColor={colors.border}
                    labelColor={colors.text}
                  />
                  <Text style={styles.performanceLabel}>Punteggio Medio</Text>
                </View>
              </View>
            </View>
          </FadeInView>
        )}

        {/* Favorite Words */}
        {progress.favoriteWords.length > 0 && (
          <FadeInView delay={600}>
            <View style={styles.favoritesCard}>
              <View style={styles.favoritesHeader}>
                <Ionicons name="star" size={24} color={colors.primary} />
                <Text style={styles.cardTitle}>Parole Preferite</Text>
              </View>
              <View style={styles.favoritesList}>
                {progress.favoriteWords.slice(0, 10).map((word, index) => (
                  <View key={index} style={styles.favoriteChip}>
                    <Text style={styles.favoriteText}>{word}</Text>
                  </View>
                ))}
              </View>
              {progress.favoriteWords.length > 10 && (
                <Text style={styles.moreText}>
                  +{progress.favoriteWords.length - 10} altre parole
                </Text>
              )}
            </View>
          </FadeInView>
        )}

        {/* Recent Translations */}
        {progress.translationHistory.length > 0 && (
          <FadeInView delay={700}>
            <View style={styles.historyCard}>
              <View style={styles.historyHeader}>
                <Ionicons name="time" size={24} color={colors.primary} />
                <Text style={styles.cardTitle}>Traduzioni Recenti</Text>
              </View>
              {progress.translationHistory.slice(0, 5).map((item, index) => (
                <View key={item.id} style={styles.historyItem}>
                  <View style={styles.historyContent}>
                    <Text style={styles.historyOriginal}>{item.originalText}</Text>
                    <Ionicons name="arrow-forward" size={16} color={colors.textSecondary} />
                    <Text style={styles.historyTranslated}>{item.translatedText}</Text>
                  </View>
                  {item.isFavorite && (
                    <Ionicons name="star" size={16} color="#ffd700" />
                  )}
                </View>
              ))}
            </View>
          </FadeInView>
        )}

        {/* Achievements */}
        <FadeInView delay={800}>
          <View style={styles.achievementsCard}>
            <Text style={styles.cardTitle}>Traguardi</Text>
            <View style={styles.achievementsGrid}>

              {/* First translation */}
              <View style={[styles.achievementBadge, progress.totalTranslations > 0 && styles.achievementUnlocked]}>
                <Ionicons
                  name={progress.totalTranslations > 0 ? "checkmark-circle" : "lock-closed"}
                  size={40}
                  color={progress.totalTranslations > 0 ? colors.primary : colors.textSecondary}
                />
                <Text style={styles.achievementText}>Prima Traduzione</Text>
              </View>

              {/* 10 translations */}
              <View style={[styles.achievementBadge, progress.totalTranslations >= 10 && styles.achievementUnlocked]}>
                <Ionicons
                  name={progress.totalTranslations >= 10 ? "ribbon" : "lock-closed"}
                  size={40}
                  color={progress.totalTranslations >= 10 ? '#ffd700' : colors.textSecondary}
                />
                <Text style={styles.achievementText}>10 Traduzioni</Text>
              </View>

              {/* Perfect pronunciation */}
              <View style={[styles.achievementBadge, averageScore >= 90 && styles.achievementUnlocked]}>
                <Ionicons
                  name={averageScore >= 90 ? "trophy" : "lock-closed"}
                  size={40}
                  color={averageScore >= 90 ? '#ff6b35' : colors.textSecondary}
                />
                <Text style={styles.achievementText}>Pronuncia Perfetta</Text>
              </View>

              {/* 7 day streak */}
              <View style={[styles.achievementBadge, progress.streakDays >= 7 && styles.achievementUnlocked]}>
                <Ionicons
                  name={progress.streakDays >= 7 ? "flame" : "lock-closed"}
                  size={40}
                  color={progress.streakDays >= 7 ? '#ff6b35' : colors.textSecondary}
                />
                <Text style={styles.achievementText}>7 Giorni di Fila</Text>
              </View>

            </View>
          </View>
        </FadeInView>

        {/* Refresh Button */}
        <TouchableOpacity style={styles.refreshButton} onPress={refreshProgress}>
          <Ionicons name="refresh" size={20} color="#fff" />
          <Text style={styles.refreshButtonText}>Aggiorna Statistiche</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  logo: {
    width: 40,
    height: 40,
    opacity: colors.logoOpacity,
  },
  scrollContent: {
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 25,
  },
  streakCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 25,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#ff6b35',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  streakInfo: {
    marginLeft: 20,
  },
  streakNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ff6b35',
  },
  streakLabel: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '600',
  },
  streakMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  progressCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 25,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 15,
  },
  progressCircleContainer: {
    marginVertical: 20,
  },
  progressDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 15,
    marginTop: 10,
  },
  performanceCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 25,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  performanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  performanceItem: {
    alignItems: 'center',
  },
  performanceLabel: {
    fontSize: 14,
    color: colors.text,
    marginTop: 10,
    textAlign: 'center',
  },
  favoritesCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 25,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  favoritesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 10,
  },
  favoritesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  favoriteChip: {
    backgroundColor: colors.primary + '20',
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  favoriteText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  moreText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 10,
    fontStyle: 'italic',
  },
  historyCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 25,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 10,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  historyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  historyOriginal: {
    fontSize: 14,
    color: colors.text,
    maxWidth: '40%',
  },
  historyTranslated: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
    maxWidth: '40%',
  },
  achievementsCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 25,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 15,
  },
  achievementBadge: {
    width: '47%',
    aspectRatio: 1,
    backgroundColor: colors.background,
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    opacity: 0.5,
  },
  achievementUnlocked: {
    opacity: 1,
    borderColor: colors.primary,
  },
  achievementText: {
    fontSize: 12,
    color: colors.text,
    textAlign: 'center',
    marginTop: 10,
    fontWeight: '600',
  },
  refreshButton: {
    backgroundColor: colors.primary,
    borderRadius: 25,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 20,
    marginBottom: 30,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
