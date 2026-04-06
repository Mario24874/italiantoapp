import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Voice, { SpeechResultsEvent, SpeechErrorEvent } from '@react-native-voice/voice';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { SupabaseService, TUTOR_MINUTE_LIMITS } from '../services/supabaseService';

const ITALIANTO_URL = process.env.EXPO_PUBLIC_ITALIANTO_URL ?? 'https://italianto.com';
const ELEVENLABS_API_KEY = process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY ?? '';

// ─── Voces italianas curadas ──────────────────────────────────────────────────
export const ITALIAN_VOICES = [
  {
    id: 'Yb9rQITgCX1VdXgAkbjM',
    name: 'Gioele',
    gender: 'male' as const,
    description: 'Mediterraneo, caldo',
  },
  {
    id: 'zcAOhNBS3c14rBihAFp1',
    name: 'Giovanni',
    gender: 'male' as const,
    description: 'Classico, chiaro',
  },
  {
    id: 'CnVVMwhKmKZ6hKBAkL6Y',
    name: 'Giulia',
    gender: 'female' as const,
    description: 'Dolce, rassicurante',
  },
  {
    id: 'HLbf5OcXzzI5RP4O3I3d',
    name: 'Francesca',
    gender: 'female' as const,
    description: 'Elegante, professionale',
  },
];

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface TutorConfig {
  tutorName: string;
  voiceId: string;
  voiceName: string;
  gender: 'male' | 'female';
}

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface TranscriptMessage {
  role: 'user' | 'assistant';
  text: string;
}

type SessionState = 'idle' | 'starting' | 'listening' | 'processing' | 'speaking';

const DEFAULT_CONFIG: TutorConfig = {
  tutorName: 'Marco',
  voiceId: ITALIAN_VOICES[0].id,
  voiceName: ITALIAN_VOICES[0].name,
  gender: 'male',
};

const STORAGE_KEY = 'tutor_config_v1';

// ─── ElevenLabs TTS ───────────────────────────────────────────────────────────
async function synthesizeSpeech(text: string, voiceId: string): Promise<string | null> {
  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
          Accept: 'audio/mpeg',
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: { stability: 0.5, similarity_boost: 0.8, style: 0.3 },
        }),
      }
    );

    if (!response.ok) {
      console.error('[ElevenLabs TTS error]', response.status);
      return null;
    }

    const arrayBuffer = await response.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    let binary = '';
    const chunkSize = 8192;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
    }
    const base64 = btoa(binary);

    const fileUri = (FileSystem.cacheDirectory ?? '') + 'tutor_speech.mp3';
    await FileSystem.writeAsStringAsync(fileUri, base64, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return fileUri;
  } catch (err) {
    console.error('[synthesizeSpeech]', err);
    return null;
  }
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function TutorScreen() {
  const { colors } = useTheme();
  const { isSignedIn, isPremium, clerkConfigured, userId, subscriptionPlan } = useAuth();
  const navigation = useNavigation<any>();

  const minuteLimit = TUTOR_MINUTE_LIMITS[subscriptionPlan ?? 'free'] ?? 0;

  const [config, setConfig] = useState<TutorConfig>(DEFAULT_CONFIG);
  const [editingConfig, setEditingConfig] = useState<TutorConfig>(DEFAULT_CONFIG);
  const [showConfig, setShowConfig] = useState(false);
  const [sessionState, setSessionState] = useState<SessionState>('idle');
  const [isTutorSpeaking, setIsTutorSpeaking] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);
  const [partialText, setPartialText] = useState('');
  const [history, setHistory] = useState<ConversationMessage[]>([]);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [minutesUsed, setMinutesUsed] = useState(0);
  const [error, setError] = useState('');

  const soundRef = useRef<Audio.Sound | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionStartRef = useRef<number>(0);
  const scrollRef = useRef<ScrollView>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const activeRef = useRef(false); // tracks if session is still running
  const styles = getStyles(colors);

  const minutesRemaining = Math.max(0, minuteLimit - minutesUsed);
  const isInSession = sessionState !== 'idle';

  // ─── Load config + minutes used ──────────────────────────────────────────
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(val => {
      if (val) {
        const saved = JSON.parse(val) as TutorConfig;
        setConfig(saved);
        setEditingConfig(saved);
      }
    });
    if (userId) {
      SupabaseService.getTutorMinutesUsed(userId).then(setMinutesUsed);
    }
  }, [userId]);

  // ─── Session timer ────────────────────────────────────────────────────────
  useEffect(() => {
    if (isInSession) {
      if (sessionStartRef.current === 0) sessionStartRef.current = Date.now();
      timerRef.current = setInterval(() => {
        setSessionSeconds(s => {
          const next = s + 1;
          if (minutesRemaining > 0 && next >= minutesRemaining * 60) {
            endSession();
          }
          return next;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setSessionSeconds(0);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isInSession, minutesRemaining]);

  // ─── Pulse animation when tutor speaking ─────────────────────────────────
  useEffect(() => {
    if (isTutorSpeaking) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.3,
            duration: 600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [isTutorSpeaking]);

  // ─── Voice event handlers ─────────────────────────────────────────────────
  useEffect(() => {
    Voice.onSpeechResults = (e: SpeechResultsEvent) => {
      const text = e.value?.[0]?.trim() ?? '';
      setPartialText('');
      if (text && activeRef.current) {
        sendUserMessage(text);
      }
    };

    Voice.onSpeechPartialResults = (e: any) => {
      setPartialText(e.value?.[0] ?? '');
    };

    Voice.onSpeechError = (e: SpeechErrorEvent) => {
      const code = (e.error as any)?.code ?? '';
      // Code 7 = "No match" (silence timeout), just restart if still in session
      if (activeRef.current && code === '7') {
        startListening();
        return;
      }
      if (activeRef.current) {
        console.warn('[Voice error]', e.error);
      }
    };

    Voice.onSpeechEnd = () => {
      setPartialText('');
    };

    return () => {
      Voice.onSpeechResults = undefined as any;
      Voice.onSpeechPartialResults = undefined as any;
      Voice.onSpeechError = undefined as any;
      Voice.onSpeechEnd = undefined as any;
      Voice.destroy().catch(() => {});
    };
  }, [config]);

  // ─── Cleanup on unmount ───────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      activeRef.current = false;
      Voice.destroy().catch(() => {});
      soundRef.current?.stopAsync().catch(() => {});
      soundRef.current?.unloadAsync().catch(() => {});
    };
  }, []);

  // ─── Play TTS + resume mic when done ─────────────────────────────────────
  const playTTS = useCallback(async (text: string, voiceId: string) => {
    setIsTutorSpeaking(true);
    setSessionState('speaking');

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
      });

      const fileUri = await synthesizeSpeech(text, voiceId);

      if (!fileUri || !activeRef.current) {
        setIsTutorSpeaking(false);
        if (activeRef.current) startListening();
        return;
      }

      // Unload previous sound
      if (soundRef.current) {
        await soundRef.current.unloadAsync().catch(() => {});
        soundRef.current = null;
      }

      const { sound } = await Audio.Sound.createAsync({ uri: fileUri });
      soundRef.current = sound;

      sound.setOnPlaybackStatusUpdate(status => {
        if (!status.isLoaded) return;
        if (status.didJustFinish) {
          setIsTutorSpeaking(false);
          sound.unloadAsync().catch(() => {});
          soundRef.current = null;
          if (activeRef.current) {
            startListening();
          }
        }
      });

      await sound.playAsync();
    } catch (err) {
      console.error('[playTTS]', err);
      setIsTutorSpeaking(false);
      if (activeRef.current) startListening();
    }
  }, []);

  // ─── Start listening via Voice ────────────────────────────────────────────
  const startListening = useCallback(async () => {
    if (!activeRef.current) return;
    setSessionState('listening');
    setPartialText('');

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      await Voice.start('it-IT');
    } catch (err) {
      console.error('[startListening]', err);
      // Retry once
      setTimeout(() => {
        if (activeRef.current) startListening();
      }, 1000);
    }
  }, []);

  // ─── Send user message to Gemini ──────────────────────────────────────────
  const sendUserMessage = useCallback(async (text: string) => {
    if (!activeRef.current) return;

    try {
      await Voice.stop();
    } catch {}

    setSessionState('processing');
    setPartialText('');

    const userMsg: ConversationMessage = { role: 'user', content: text };
    const updatedHistory = [...history, userMsg];
    setHistory(updatedHistory);
    setTranscript(prev => [...prev, { role: 'user', text }]);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      const res = await fetch(`${ITALIANTO_URL}/api/tutor/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedHistory,
          tutorName: config.tutorName,
        }),
      });

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? 'Errore del tutor');
      }

      const { text: reply } = await res.json();

      if (!activeRef.current) return;

      const assistantMsg: ConversationMessage = { role: 'assistant', content: reply };
      setHistory(prev => [...prev, assistantMsg]);
      setTranscript(prev => [...prev, { role: 'assistant', text: reply }]);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);

      await playTTS(reply, config.voiceId);
    } catch (err: any) {
      console.error('[sendUserMessage]', err);
      setError(err?.message ?? 'Errore di connessione');
      setSessionState('idle');
      activeRef.current = false;
    }
  }, [history, config, playTTS]);

  // ─── Start session ────────────────────────────────────────────────────────
  const startSession = useCallback(async () => {
    if (minutesRemaining <= 0) {
      setError(`Hai esaurito i ${minuteLimit} minuti mensili. Si resetteranno il mese prossimo.`);
      return;
    }

    activeRef.current = true;
    setSessionState('starting');
    setError('');
    setTranscript([]);
    setHistory([]);
    sessionStartRef.current = Date.now();

    const greeting = `Ciao! Sono ${config.tutorName}. Di cosa vorresti parlare oggi?`;
    const assistantMsg: ConversationMessage = { role: 'assistant', content: greeting };
    setHistory([assistantMsg]);
    setTranscript([{ role: 'assistant', text: greeting }]);

    await playTTS(greeting, config.voiceId);
  }, [config, minutesRemaining, minuteLimit, playTTS]);

  // ─── End session ──────────────────────────────────────────────────────────
  const endSession = useCallback(async () => {
    activeRef.current = false;
    setSessionState('idle');
    setIsTutorSpeaking(false);
    setPartialText('');

    try { await Voice.stop(); } catch {}
    try { await Voice.cancel(); } catch {}
    try {
      await soundRef.current?.stopAsync();
      await soundRef.current?.unloadAsync();
      soundRef.current = null;
    } catch {}

    // Save minutes used
    if (userId && sessionStartRef.current > 0) {
      const elapsedMinutes = (Date.now() - sessionStartRef.current) / 60000;
      sessionStartRef.current = 0;
      if (elapsedMinutes > 0.1) {
        await SupabaseService.addTutorMinutes(userId, elapsedMinutes);
        const updated = await SupabaseService.getTutorMinutesUsed(userId);
        setMinutesUsed(updated);
      }
    }
  }, [userId]);

  // ─── Save config ──────────────────────────────────────────────────────────
  const saveConfig = useCallback(async () => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(editingConfig));
    setConfig(editingConfig);
    setShowConfig(false);
  }, [editingConfig]);

  // ─── Format timer ─────────────────────────────────────────────────────────
  const formatTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  // ─── Guard: auth ──────────────────────────────────────────────────────────
  if (!isSignedIn && clerkConfigured) {
    return (
      <View style={[styles.container, styles.center]}>
        <Ionicons name="lock-closed" size={60} color={colors.textSecondary} />
        <Text style={styles.lockTitle}>Accedi per usare il Tutor</Text>
        <Text style={styles.lockSubtitle}>
          Il Tutor AI è una funzionalità esclusiva per gli utenti registrati.
        </Text>
        <TouchableOpacity style={styles.lockButton} onPress={() => navigation.navigate('SignIn')}>
          <Text style={styles.lockButtonText}>Accedi</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!isPremium) {
    return (
      <View style={[styles.container, styles.center]}>
        <Ionicons name="sparkles" size={60} color="#ffd700" />
        <Text style={styles.lockTitle}>Funzionalità Premium</Text>
        <Text style={styles.lockSubtitle}>
          Il Tutor AI è disponibile per gli abbonati Premium. Sblocca conversazioni
          illimitate in italiano con un tutor personalizzato.
        </Text>
        <TouchableOpacity style={styles.lockButton} onPress={() => navigation.navigate('Paywall')}>
          <Text style={styles.lockButtonText}>Scopri Premium</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ─── Config panel ─────────────────────────────────────────────────────────
  if (showConfig) {
    const maleVoices = ITALIAN_VOICES.filter(v => v.gender === 'male');
    const femaleVoices = ITALIAN_VOICES.filter(v => v.gender === 'female');
    const currentGenderVoices = editingConfig.gender === 'male' ? maleVoices : femaleVoices;

    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.configScroll}>
        <View style={styles.configHeader}>
          <Text style={styles.configTitle}>Configura il tuo Tutor</Text>
          <TouchableOpacity onPress={() => setShowConfig(false)}>
            <Ionicons name="close" size={26} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Nome tutor */}
        <Text style={styles.configLabel}>Nome del tutor</Text>
        <TextInput
          style={styles.configInput}
          value={editingConfig.tutorName}
          onChangeText={t => setEditingConfig(prev => ({ ...prev, tutorName: t }))}
          placeholder="es. Marco, Sofia..."
          placeholderTextColor={colors.textSecondary}
          maxLength={20}
        />

        {/* Genere */}
        <Text style={styles.configLabel}>Genere</Text>
        <View style={styles.genderRow}>
          {(['male', 'female'] as const).map(g => (
            <TouchableOpacity
              key={g}
              style={[
                styles.genderChip,
                editingConfig.gender === g && styles.genderChipSelected,
              ]}
              onPress={() => {
                const voices = g === 'male' ? maleVoices : femaleVoices;
                setEditingConfig(prev => ({
                  ...prev,
                  gender: g,
                  voiceId: voices[0].id,
                  voiceName: voices[0].name,
                }));
              }}
            >
              <Ionicons
                name={g === 'male' ? 'man' : 'woman'}
                size={18}
                color={editingConfig.gender === g ? '#fff' : colors.text}
              />
              <Text style={[
                styles.genderChipText,
                editingConfig.gender === g && styles.genderChipTextSelected,
              ]}>
                {g === 'male' ? 'Maschile' : 'Femminile'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Voce */}
        <Text style={styles.configLabel}>Voce</Text>
        {currentGenderVoices.map(v => (
          <TouchableOpacity
            key={v.id}
            style={[
              styles.voiceCard,
              editingConfig.voiceId === v.id && styles.voiceCardSelected,
            ]}
            onPress={() => setEditingConfig(prev => ({
              ...prev,
              voiceId: v.id,
              voiceName: v.name,
            }))}
          >
            <View style={styles.voiceInfo}>
              <Text style={[
                styles.voiceName,
                editingConfig.voiceId === v.id && styles.voiceNameSelected,
              ]}>
                {v.name}
              </Text>
              <Text style={styles.voiceDesc}>{v.description}</Text>
            </View>
            {editingConfig.voiceId === v.id && (
              <Ionicons name="checkmark-circle" size={22} color="#667eea" />
            )}
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.saveButton} onPress={saveConfig}>
          <Text style={styles.saveButtonText}>Salva configurazione</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  // ─── Main screen ──────────────────────────────────────────────────────────
  const speakingLabel = (() => {
    if (sessionState === 'starting' || sessionState === 'speaking') return '🎙 Sta parlando...';
    if (sessionState === 'listening') return '👂 In ascolto...';
    if (sessionState === 'processing') return '⏳ Elaborando...';
    return '';
  })();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Tutor AI</Text>
          {isInSession && (
            <Text style={styles.sessionTimer}>{formatTime(sessionSeconds)}</Text>
          )}
        </View>
        {!isInSession && (
          <TouchableOpacity style={styles.configIconButton} onPress={() => setShowConfig(true)}>
            <Ionicons name="settings-outline" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Quota meter */}
      <View style={styles.quotaContainer}>
        <View style={styles.quotaRow}>
          <Ionicons name="time-outline" size={16} color={
            minutesRemaining <= 10 ? '#e53935' :
            minutesRemaining <= 20 ? '#f57c00' : '#2e7d32'
          } />
          <Text style={[styles.quotaText, {
            color: minutesRemaining <= 10 ? '#e53935' :
                   minutesRemaining <= 20 ? '#f57c00' : colors.textSecondary,
          }]}>
            {minutesRemaining} / {minuteLimit} min rimasti questo mese
          </Text>
        </View>
        <View style={styles.quotaBar}>
          <View style={[styles.quotaFill, {
            width: `${minuteLimit > 0 ? Math.min(100, (minutesUsed / minuteLimit) * 100) : 0}%` as any,
            backgroundColor: minutesRemaining <= 10 ? '#e53935' :
                             minutesRemaining <= 20 ? '#f57c00' : '#667eea',
          }]} />
        </View>
      </View>

      {/* Tutor card */}
      <View style={styles.tutorCard}>
        <Animated.View style={[styles.avatarCircle, { transform: [{ scale: pulseAnim }] }]}>
          <Ionicons
            name={config.gender === 'male' ? 'man' : 'woman'}
            size={48}
            color="#fff"
          />
        </Animated.View>
        <Text style={styles.tutorName}>{config.tutorName}</Text>
        <Text style={styles.tutorVoice}>{config.voiceName}</Text>
        {isInSession && speakingLabel ? (
          <Text style={styles.speakingStatus}>{speakingLabel}</Text>
        ) : null}
        {sessionState === 'starting' && (
          <View style={styles.connectingRow}>
            <ActivityIndicator size="small" color="#667eea" />
            <Text style={styles.connectingText}>Avvio sessione...</Text>
          </View>
        )}
      </View>

      {/* Partial transcript */}
      {partialText ? (
        <View style={styles.partialBox}>
          <Text style={styles.partialText}>{partialText}</Text>
        </View>
      ) : null}

      {/* Transcript */}
      {transcript.length > 0 && (
        <ScrollView
          ref={scrollRef}
          style={styles.transcriptBox}
          contentContainerStyle={styles.transcriptContent}
          showsVerticalScrollIndicator={false}
        >
          {transcript.map((msg, i) => (
            <View
              key={i}
              style={[
                styles.bubble,
                msg.role === 'user' ? styles.bubbleUser : styles.bubbleTutor,
              ]}
            >
              <Text style={[
                styles.bubbleText,
                msg.role === 'user' ? styles.bubbleTextUser : styles.bubbleTextTutor,
              ]}>
                {msg.text}
              </Text>
            </View>
          ))}
        </ScrollView>
      )}

      {transcript.length === 0 && sessionState === 'idle' && (
        <View style={styles.emptyHint}>
          <Ionicons name="chatbubbles-outline" size={40} color={colors.textSecondary} />
          <Text style={styles.emptyHintText}>
            Premi il pulsante per iniziare a conversare con {config.tutorName}
          </Text>
        </View>
      )}

      {/* Error */}
      {error ? (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle-outline" size={16} color="#c62828" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {/* CTA buttons */}
      <View style={styles.ctaContainer}>
        {sessionState === 'idle' && (
          <TouchableOpacity style={styles.startButton} onPress={startSession} activeOpacity={0.85}>
            <Ionicons name="mic" size={32} color="#fff" />
            <Text style={styles.startButtonText}>Inizia Conversazione</Text>
          </TouchableOpacity>
        )}
        {sessionState === 'starting' && (
          <TouchableOpacity style={[styles.startButton, styles.buttonDisabled]} disabled>
            <ActivityIndicator color="#fff" />
          </TouchableOpacity>
        )}
        {(sessionState === 'listening' || sessionState === 'processing' || sessionState === 'speaking') && (
          <TouchableOpacity style={styles.endButton} onPress={endSession} activeOpacity={0.85}>
            <Ionicons name="call" size={32} color="#fff" />
            <Text style={styles.endButtonText}>Termina</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const getStyles = (colors: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    center: { justifyContent: 'center', alignItems: 'center', padding: 32 },

    lockTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      color: colors.text,
      marginTop: 20,
      textAlign: 'center',
    },
    lockSubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: 10,
      lineHeight: 22,
    },
    lockButton: {
      marginTop: 24,
      backgroundColor: '#667eea',
      borderRadius: 14,
      paddingVertical: 14,
      paddingHorizontal: 36,
    },
    lockButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },

    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 10,
    },
    headerTitle: {
      fontSize: 26,
      fontWeight: 'bold',
      color: colors.primary,
    },
    sessionTimer: {
      fontSize: 14,
      color: '#667eea',
      fontWeight: '600',
      marginTop: 2,
    },
    configIconButton: { padding: 8 },

    quotaContainer: {
      marginHorizontal: 20,
      marginBottom: 8,
      gap: 6,
    },
    quotaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    quotaText: {
      fontSize: 13,
      fontWeight: '500',
    },
    quotaBar: {
      height: 4,
      backgroundColor: colors.border,
      borderRadius: 2,
      overflow: 'hidden',
    },
    quotaFill: {
      height: '100%',
      borderRadius: 2,
    },

    tutorCard: {
      alignItems: 'center',
      paddingVertical: 24,
    },
    avatarCircle: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: '#667eea',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 14,
      shadowColor: '#667eea',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.35,
      shadowRadius: 10,
      elevation: 6,
    },
    tutorName: { fontSize: 22, fontWeight: 'bold', color: colors.text },
    tutorVoice: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 4,
    },
    speakingStatus: {
      fontSize: 14,
      color: '#667eea',
      fontWeight: '600',
      marginTop: 8,
    },
    connectingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginTop: 8,
    },
    connectingText: { fontSize: 14, color: '#667eea' },

    partialBox: {
      marginHorizontal: 16,
      marginBottom: 4,
      backgroundColor: colors.surface,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    partialText: {
      fontSize: 14,
      color: colors.textSecondary,
      fontStyle: 'italic',
    },

    transcriptBox: {
      flex: 1,
      marginHorizontal: 16,
      marginBottom: 8,
    },
    transcriptContent: { gap: 8, paddingVertical: 8 },
    bubble: {
      maxWidth: '80%',
      borderRadius: 16,
      paddingHorizontal: 14,
      paddingVertical: 10,
    },
    bubbleTutor: {
      alignSelf: 'flex-start',
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    bubbleUser: {
      alignSelf: 'flex-end',
      backgroundColor: '#667eea',
    },
    bubbleText: { fontSize: 14, lineHeight: 20 },
    bubbleTextTutor: { color: colors.text },
    bubbleTextUser: { color: '#fff' },

    emptyHint: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 32,
      gap: 12,
    },
    emptyHintText: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
    },

    errorBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: '#ffebee',
      borderRadius: 10,
      padding: 12,
      marginHorizontal: 16,
      marginBottom: 8,
    },
    errorText: { color: '#c62828', fontSize: 13, flex: 1 },

    ctaContainer: {
      paddingHorizontal: 20,
      paddingBottom: 24,
      paddingTop: 8,
    },
    startButton: {
      flexDirection: 'row',
      backgroundColor: '#667eea',
      borderRadius: 18,
      height: 64,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 12,
      shadowColor: '#667eea',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 8,
      elevation: 5,
    },
    startButtonText: { color: '#fff', fontSize: 18, fontWeight: '700' },
    endButton: {
      flexDirection: 'row',
      backgroundColor: '#e53935',
      borderRadius: 18,
      height: 64,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 12,
      shadowColor: '#e53935',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 8,
      elevation: 5,
    },
    endButtonText: { color: '#fff', fontSize: 18, fontWeight: '700' },
    buttonDisabled: { opacity: 0.6 },

    configScroll: { padding: 24, paddingBottom: 40 },
    configHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 28,
    },
    configTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      color: colors.text,
    },
    configLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 10,
      marginTop: 20,
    },
    configInput: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 16,
      height: 52,
      fontSize: 16,
      color: colors.text,
    },
    genderRow: { flexDirection: 'row', gap: 12 },
    genderChip: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      height: 48,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    genderChipSelected: {
      backgroundColor: '#667eea',
      borderColor: '#667eea',
    },
    genderChipText: { fontSize: 15, fontWeight: '600', color: colors.text },
    genderChipTextSelected: { color: '#fff' },
    voiceCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.border,
      padding: 14,
      marginBottom: 10,
    },
    voiceCardSelected: { borderColor: '#667eea' },
    voiceInfo: { flex: 1 },
    voiceName: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
    },
    voiceNameSelected: { color: '#667eea' },
    voiceDesc: {
      fontSize: 13,
      color: colors.textSecondary,
      marginTop: 2,
    },
    saveButton: {
      backgroundColor: '#667eea',
      borderRadius: 14,
      height: 56,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 28,
    },
    saveButtonText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  });
