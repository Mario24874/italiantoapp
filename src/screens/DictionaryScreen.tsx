import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  FlatList,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { DictionaryService, DictionaryEntry } from '../services/dictionaryService';
import { useTheme } from '../context/ThemeContext';
import { ThemeToggle } from '../components/ThemeToggle';
import { FadeInView } from '../components/FadeInView';
import { Language } from '../types';
import i18n from '../i18n/i18n';

export default function DictionaryScreen() {
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [targetLang, setTargetLang] = useState<Language>('es');
  const [results, setResults] = useState<DictionaryEntry[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const styles = getStyles(colors);

  const handleSearch = (query: string) => {
    setSearchQuery(query);

    if (query.trim().length === 0) {
      setResults([]);
      setSuggestions([]);
      return;
    }

    // Obtener resultados
    const searchResults = DictionaryService.search(query, targetLang);
    setResults(searchResults);

    // Obtener sugerencias
    const wordSuggestions = DictionaryService.getSuggestions(query);
    setSuggestions(wordSuggestions);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setResults([]);
    setSuggestions([]);
  };

  const handleSuggestionPress = (suggestion: string) => {
    setSearchQuery(suggestion);
    handleSearch(suggestion);
    setSuggestions([]);
  };

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category === selectedCategory ? null : category);
    if (category !== selectedCategory) {
      const categoryResults = DictionaryService.getByCategory(category);
      setResults(categoryResults);
    } else {
      setResults([]);
    }
  };

  const renderEntry = ({ item, index }: { item: DictionaryEntry; index: number }) => (
    <FadeInView delay={index * 50} style={styles.entryCard}>
      <View style={styles.entryHeader}>
        <Text style={styles.italianWord}>{item.word}</Text>
        {item.category && (
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
        )}
      </View>

      <View style={styles.translationsContainer}>
        <View style={styles.translationRow}>
          <Ionicons name="language" size={16} color={colors.primary} />
          <Text style={styles.langLabel}>{targetLang === 'es' ? 'Español:' : 'English:'}</Text>
          <Text style={styles.translationText}>
            {item.translations[targetLang].join(', ')}
          </Text>
        </View>
      </View>

      {item.examples && item.examples.length > 0 && (
        <View style={styles.examplesContainer}>
          <Text style={styles.examplesLabel}>Ejemplos:</Text>
          {item.examples.map((example, idx) => (
            <Text key={idx} style={styles.exampleText}>
              • {example}
            </Text>
          ))}
        </View>
      )}
    </FadeInView>
  );

  const categories = DictionaryService.getAllCategories();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <Image source={require('../../assets/Logo_ItaliAnto.png')} style={styles.logo} />
        <ThemeToggle />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Dizionario Italiano</Text>
        <Text style={styles.subtitle}>Cerca parole italiane</Text>

        {/* Language selector */}
        <View style={styles.languageSelector}>
          <Text style={styles.label}>Traduci a:</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={targetLang}
              onValueChange={setTargetLang}
              style={styles.picker}
            >
              <Picker.Item label="Español" value="es" />
              <Picker.Item label="English" value="en" />
            </Picker>
          </View>
        </View>

        {/* Search bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Cerca una parola italiana..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={handleSearch}
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={handleClearSearch} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <View style={styles.suggestionsContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {suggestions.map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.suggestionChip}
                  onPress={() => handleSuggestionPress(suggestion)}
                >
                  <Text style={styles.suggestionText}>{suggestion}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Category filters */}
        {results.length === 0 && searchQuery.length === 0 && (
          <View style={styles.categoriesSection}>
            <Text style={styles.categoriesTitle}>Categorie:</Text>
            <View style={styles.categoriesGrid}>
              {categories.map((category, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.categoryChip,
                    selectedCategory === category && styles.categoryChipActive,
                  ]}
                  onPress={() => handleCategoryFilter(category)}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      selectedCategory === category && styles.categoryChipTextActive,
                    ]}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Results */}
        {results.length > 0 ? (
          <FlatList
            data={results}
            renderItem={renderEntry}
            keyExtractor={(item, index) => `${item.word}-${index}`}
            scrollEnabled={false}
            style={styles.resultsList}
          />
        ) : searchQuery.length > 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="search" size={60} color={colors.textSecondary} />
            <Text style={styles.emptyStateText}>Nessun risultato trovato</Text>
            <Text style={styles.emptyStateSubtext}>
              Prova con un'altra parola o controlla l'ortografia
            </Text>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="book" size={60} color={colors.textSecondary} />
            <Text style={styles.emptyStateText}>Inizia a cercare</Text>
            <Text style={styles.emptyStateSubtext}>
              Digita una parola italiana per trovare la traduzione
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 10,
  },
  logo: {
    width: 40,
    height: 40,
    opacity: colors.logoOpacity,
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
    marginBottom: 20,
  },
  languageSelector: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 8,
    fontWeight: '600',
  },
  pickerContainer: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    color: colors.text,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBackground,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: colors.text,
  },
  clearButton: {
    padding: 5,
  },
  suggestionsContainer: {
    marginBottom: 15,
  },
  suggestionChip: {
    backgroundColor: colors.primaryLight + '20',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  suggestionText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  categoriesSection: {
    marginVertical: 20,
  },
  categoriesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 15,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryChip: {
    backgroundColor: colors.surface,
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryChipText: {
    color: colors.text,
    fontSize: 14,
  },
  categoryChipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  resultsList: {
    marginTop: 10,
  },
  entryCard: {
    backgroundColor: colors.surface,
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  italianWord: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    flex: 1,
  },
  categoryBadge: {
    backgroundColor: colors.primary + '20',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  categoryText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  translationsContainer: {
    marginBottom: 10,
  },
  translationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  langLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
    marginRight: 8,
  },
  translationText: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  examplesContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  examplesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 6,
  },
  exampleText: {
    fontSize: 14,
    color: colors.text,
    fontStyle: 'italic',
    marginBottom: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 15,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
