// TutorScreen para PWA/web
// Carga @vapi-ai/web desde CDN (esm.sh) para evitar el error
// "Requiring unknown module 1051" que surge cuando Metro intenta
// bundlear @daily-co/daily-js (que usa webpack numeric requires internamente).
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { SupabaseService, TUTOR_MINUTE_LIMITS } from '../services/supabaseService';

// ─── Configuración Vapi ───────────────────────────────────────────────────────
const VAPI_PUBLIC_KEY = process.env.EXPO_PUBLIC_VAPI_PUBLIC_KEY!;
const VAPI_ASSISTANT_ID = process.env.EXPO_PUBLIC_VAPI_ASSISTANT_ID!;

// ─── Voces italianas curadas ──────────────────────────────────────────────────
export const ITALIAN_VOICES = [
  { id: 'Yb9rQITgCX1VdXgAkbjM', name: 'Gioele', gender: 'male' as const, description: 'Mediterraneo, caldo' },
  { id: 'zcAOhNBS3c14rBihAFp1', name: 'Giovanni', gender: 'male' as const, description: 'Classico, chiaro' },
  { id: 'CnVVMwhKmKZ6hKBAkL6Y', name: 'Giulia', gender: 'female' as const, description: 'Dolce, rassicurante' },
  { id: 'HLbf5OcXzzI5RP4O3I3d', name: 'Francesca', gender: 'female' as const, description: 'Elegante, professionale' },
];

interface TutorConfig {
  tutorName: string;
  voiceId: string;
  voiceName: string;
  gender: 'male' | 'female';
}

type CallStatus = 'idle' | 'connecting' | 'active' | 'ending';

interface TranscriptMessage {
  role: 'user' | 'assistant';
  text: string;
}

const DEFAULT_CONFIG: TutorConfig = {
  tutorName: 'Marco',
  voiceId: ITALIAN_VOICES[0].id,
  voiceName: ITALIAN_VOICES[0].name,
  gender: 'male',
};

const STORAGE_KEY = 'tutor_config_v1';

function buildSystemPrompt(tutorName: string): string {
  return `Sei ${tutorName}, un tutor di italiano amichevole e paziente. Il tuo compito è aiutare l'utente a praticare l'italiano parlato.

Regole fondamentali:
- Parla SEMPRE in italiano, anche se l'utente ti scrive in un'altra lingua
- Correggi gli errori grammaticali con gentilezza: ripeti la frase corretta e spiega brevemente l'errore
- Adatta il livello di difficoltà in base alla capacità dimostrata dall'utente
- Fai domande aperte per mantenere la conversazione fluente
- Mantieni le risposte brevi (2-3 frasi) per un ritmo naturale
- Ogni 4-5 scambi, dai un breve incoraggiamento sui progressi

Se l'utente è principiante (A1-A2), puoi dare brevi spiegazioni in spagnolo o inglese solo quando strettamente necessario, poi torna subito all'italiano.`;
}

// ─── Carga dinámica de Vapi desde CDN ────────────────────────────────────────
// Usamos new Function() para que Metro NO analice estáticamente el import()
// y falle en build-time. El browser lo ejecuta sin problemas en runtime.
let vapiInstance: any = null;

async function getVapi(): Promise<any> {
  if (vapiInstance) return vapiInstance;

  // new Function evita que Metro intente resolver la URL en tiempo de bundling
  const dynamicImport = new Function('url', 'return import(url)');
  const module = await dynamicImport('https://esm.sh/@vapi-ai/web@2.5.2');
  const VapiClass = module.default ?? module.Vapi ?? module;
  vapiInstance = new VapiClass(VAPI_PUBLIC_KEY);
  return vapiInstance;
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
  const [callStatus, setCallStatus] = useState<CallStatus>('idle');
  const [isTutorSpeaking, setIsTutorSpeaking] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [minutesUsed, setMinutesUsed] = useState(0);
  const [error, setError] = useState('');
  const [sdkLoading, setSdkLoading] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionStartRef = useRef<number>(0);
  const scrollRef = useRef<ScrollView>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const listenersAttached = useRef(false);
  const styles = getStyles(colors);

  const minutesRemaining = Math.max(0, minuteLimit - minutesUsed);

  // ─── Cargar config + minutos usados ──────────────────────────────────────
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

  // ─── Animación de pulso (useNativeDriver: false para web) ─────────────────
  useEffect(() => {
    if (isTutorSpeaking) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.3, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [isTutorSpeaking]);

  // ─── Timer de sesión + control de quota ──────────────────────────────────
  useEffect(() => {
    if (callStatus === 'active') {
      sessionStartRef.current = Date.now();
      timerRef.current = setInterval(() => {
        setSessionSeconds(s => {
          const next = s + 1;
          if (minutesRemaining > 0 && next >= minutesRemaining * 60) endCall();
          return next;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      if (callStatus === 'idle') setSessionSeconds(0);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [callStatus, minutesRemaining]);

  // ─── Guardar config ───────────────────────────────────────────────────────
  const saveConfig = useCallback(async () => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(editingConfig));
    setConfig(editingConfig);
    setShowConfig(false);
  }, [editingConfig]);

  // ─── Helpers para eventos Vapi ────────────────────────────────────────────
  const attachListeners = useCallback((vapi: any) => {
    if (listenersAttached.current) return;
    listenersAttached.current = true;

    vapi.on('call-start', () => { setCallStatus('active'); setError(''); });

    vapi.on('call-end', async () => {
      setCallStatus('idle');
      setIsTutorSpeaking(false);
      if (userId && sessionStartRef.current > 0) {
        const elapsedMinutes = (Date.now() - sessionStartRef.current) / 60000;
        sessionStartRef.current = 0;
        if (elapsedMinutes > 0.1) {
          await SupabaseService.addTutorMinutes(userId, elapsedMinutes);
          const updated = await SupabaseService.getTutorMinutesUsed(userId);
          setMinutesUsed(updated);
        }
      }
    });

    vapi.on('speech-start', () => setIsTutorSpeaking(true));
    vapi.on('speech-end', () => setIsTutorSpeaking(false));

    vapi.on('message', (msg: any) => {
      if (msg.type === 'transcript' && msg.transcriptType === 'final') {
        setTranscript(prev => [...prev, { role: msg.role, text: msg.transcript }]);
        setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
      }
    });

    vapi.on('error', (err: any) => {
      console.error('[Vapi error full]', JSON.stringify(err, null, 2));
      const detail = err?.error?.message ?? err?.message ?? 'Errore durante la chiamata';
      setError(typeof detail === 'string' ? detail : JSON.stringify(detail));
      setCallStatus('idle');
    });
  }, [userId]);

  // ─── Iniciar llamada ──────────────────────────────────────────────────────
  const startCall = useCallback(async () => {
    if (minutesRemaining <= 0) {
      setError(`Hai esaurito i ${minuteLimit} minuti mensili. Si resetteranno il mese prossimo.`);
      return;
    }

    // Solicitar permiso de micrófono
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setError('Permesso microfono negato. Consenti l\'accesso al microfono nelle impostazioni del browser.');
      return;
    }

    setCallStatus('connecting');
    setTranscript([]);
    setError('');
    setSdkLoading(true);

    try {
      const vapi = await getVapi();
      attachListeners(vapi);
      setSdkLoading(false);

      const overrides = {
        assistantOverrides: {
          firstMessage: `Ciao! Sono ${config.tutorName}. Di cosa vorresti parlare oggi?`,
          voice: { provider: 'elevenlabs', voiceId: config.voiceId },
        },
      };
      console.log('[Vapi start] overrides:', JSON.stringify(overrides));
      await vapi.start(VAPI_ASSISTANT_ID, overrides as any);
    } catch (err: any) {
      setSdkLoading(false);
      console.error('[Vapi catch]', JSON.stringify(err, null, 2));
      setError(err?.message ?? 'Impossibile avviare la conversazione');
      setCallStatus('idle');
    }
  }, [config, minutesRemaining, minuteLimit, attachListeners]);

  // ─── Terminar llamada ─────────────────────────────────────────────────────
  const endCall = useCallback(async () => {
    setCallStatus('ending');
    try {
      const vapi = await getVapi();
      vapi.stop();
    } catch {
      setCallStatus('idle');
    }
  }, []);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  // ─── Guard: requiere auth y premium ──────────────────────────────────────
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

  // ─── Panel de configuración ───────────────────────────────────────────────
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

        <Text style={styles.configLabel}>Nome del tutor</Text>
        <TextInput
          style={styles.configInput}
          value={editingConfig.tutorName}
          onChangeText={t => setEditingConfig(prev => ({ ...prev, tutorName: t }))}
          placeholder="es. Marco, Sofia..."
          placeholderTextColor={colors.textSecondary}
          maxLength={20}
        />

        <Text style={styles.configLabel}>Genere</Text>
        <View style={styles.genderRow}>
          {(['male', 'female'] as const).map(g => (
            <TouchableOpacity
              key={g}
              style={[styles.genderChip, editingConfig.gender === g && styles.genderChipSelected]}
              onPress={() => {
                const voices = g === 'male' ? maleVoices : femaleVoices;
                setEditingConfig(prev => ({ ...prev, gender: g, voiceId: voices[0].id, voiceName: voices[0].name }));
              }}
            >
              <Ionicons name={g === 'male' ? 'man' : 'woman'} size={18} color={editingConfig.gender === g ? '#fff' : colors.text} />
              <Text style={[styles.genderChipText, editingConfig.gender === g && styles.genderChipTextSelected]}>
                {g === 'male' ? 'Maschile' : 'Femminile'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.configLabel}>Voce</Text>
        {currentGenderVoices.map(v => (
          <TouchableOpacity
            key={v.id}
            style={[styles.voiceCard, editingConfig.voiceId === v.id && styles.voiceCardSelected]}
            onPress={() => setEditingConfig(prev => ({ ...prev, voiceId: v.id, voiceName: v.name }))}
          >
            <View style={styles.voiceInfo}>
              <Text style={[styles.voiceName, editingConfig.voiceId === v.id && styles.voiceNameSelected]}>{v.name}</Text>
              <Text style={styles.voiceDesc}>{v.description}</Text>
            </View>
            {editingConfig.voiceId === v.id && <Ionicons name="checkmark-circle" size={22} color="#667eea" />}
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.saveButton} onPress={saveConfig}>
          <Text style={styles.saveButtonText}>Salva configurazione</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  // ─── Pantalla principal del tutor ─────────────────────────────────────────
  const isInCall = callStatus === 'active' || callStatus === 'connecting' || callStatus === 'ending';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Tutor AI</Text>
          {isInCall && <Text style={styles.sessionTimer}>{formatTime(sessionSeconds)}</Text>}
        </View>
        {!isInCall && (
          <TouchableOpacity style={styles.configIconButton} onPress={() => setShowConfig(true)}>
            <Ionicons name="settings-outline" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Medidor de minutos */}
      <View style={styles.quotaContainer}>
        <View style={styles.quotaRow}>
          <Ionicons name="time-outline" size={16} color={minutesRemaining <= 10 ? '#e53935' : minutesRemaining <= 20 ? '#f57c00' : '#2e7d32'} />
          <Text style={[styles.quotaText, { color: minutesRemaining <= 10 ? '#e53935' : minutesRemaining <= 20 ? '#f57c00' : colors.textSecondary }]}>
            {minutesRemaining} / {minuteLimit} min rimasti questo mese
          </Text>
        </View>
        <View style={styles.quotaBar}>
          <View style={[styles.quotaFill, {
            width: `${Math.min(100, (minutesUsed / minuteLimit) * 100)}%` as any,
            backgroundColor: minutesRemaining <= 10 ? '#e53935' : minutesRemaining <= 20 ? '#f57c00' : '#667eea',
          }]} />
        </View>
      </View>

      {/* Tarjeta del tutor */}
      <View style={styles.tutorCard}>
        <Animated.View style={[styles.avatarCircle, { transform: [{ scale: pulseAnim }] }]}>
          <Ionicons name={config.gender === 'male' ? 'man' : 'woman'} size={48} color="#fff" />
        </Animated.View>
        <Text style={styles.tutorName}>{config.tutorName}</Text>
        <Text style={styles.tutorVoice}>{config.voiceName}</Text>
        {callStatus === 'active' && (
          <Text style={styles.speakingStatus}>
            {isTutorSpeaking ? '🎙 Sta parlando...' : '👂 In ascolto...'}
          </Text>
        )}
        {(callStatus === 'connecting' || sdkLoading) && (
          <View style={styles.connectingRow}>
            <ActivityIndicator size="small" color="#667eea" />
            <Text style={styles.connectingText}>
              {sdkLoading ? 'Caricamento SDK...' : 'Connessione in corso...'}
            </Text>
          </View>
        )}
      </View>

      {/* Aviso de micrófono para web */}
      {callStatus === 'idle' && transcript.length === 0 && (
        <View style={styles.webHint}>
          <Ionicons name="mic-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.webHintText}>
            Il browser chiederà il permesso per il microfono quando avvii la conversazione
          </Text>
        </View>
      )}

      {/* Transcript */}
      {transcript.length > 0 && (
        <ScrollView ref={scrollRef} style={styles.transcriptBox} contentContainerStyle={styles.transcriptContent}>
          {transcript.map((msg, i) => (
            <View key={i} style={[styles.bubble, msg.role === 'user' ? styles.bubbleUser : styles.bubbleTutor]}>
              <Text style={[styles.bubbleText, msg.role === 'user' ? styles.bubbleTextUser : styles.bubbleTextTutor]}>
                {msg.text}
              </Text>
            </View>
          ))}
        </ScrollView>
      )}

      {transcript.length === 0 && callStatus === 'idle' && (
        <View style={styles.emptyHint}>
          <Ionicons name="chatbubbles-outline" size={40} color={colors.textSecondary} />
          <Text style={styles.emptyHintText}>
            Premi il pulsante per iniziare a conversare con {config.tutorName}
          </Text>
        </View>
      )}

      {error ? (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle-outline" size={16} color="#c62828" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {/* Botón principal */}
      <View style={styles.ctaContainer}>
        {callStatus === 'idle' && (
          <TouchableOpacity style={styles.startButton} onPress={startCall} activeOpacity={0.85}>
            <Ionicons name="mic" size={32} color="#fff" />
            <Text style={styles.startButtonText}>Inizia Conversazione</Text>
          </TouchableOpacity>
        )}
        {callStatus === 'connecting' && (
          <TouchableOpacity style={[styles.startButton, styles.buttonDisabled]} disabled>
            <ActivityIndicator color="#fff" />
          </TouchableOpacity>
        )}
        {callStatus === 'active' && (
          <TouchableOpacity style={styles.endButton} onPress={endCall} activeOpacity={0.85}>
            <Ionicons name="call" size={32} color="#fff" />
            <Text style={styles.endButtonText}>Termina</Text>
          </TouchableOpacity>
        )}
        {callStatus === 'ending' && (
          <TouchableOpacity style={[styles.endButton, styles.buttonDisabled]} disabled>
            <ActivityIndicator color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const getStyles = (colors: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    center: { justifyContent: 'center', alignItems: 'center', padding: 32 },
    lockTitle: { fontSize: 22, fontWeight: 'bold', color: colors.text, marginTop: 20, textAlign: 'center' },
    lockSubtitle: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginTop: 10, lineHeight: 22 },
    lockButton: { marginTop: 24, backgroundColor: '#667eea', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 36 },
    lockButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 },
    headerTitle: { fontSize: 26, fontWeight: 'bold', color: colors.primary },
    sessionTimer: { fontSize: 14, color: '#667eea', fontWeight: '600', marginTop: 2 },
    configIconButton: { padding: 8 },
    quotaContainer: { marginHorizontal: 20, marginBottom: 8, gap: 6 },
    quotaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    quotaText: { fontSize: 13, fontWeight: '500' },
    quotaBar: { height: 4, backgroundColor: colors.border, borderRadius: 2, overflow: 'hidden' },
    quotaFill: { height: '100%', borderRadius: 2 },
    tutorCard: { alignItems: 'center', paddingVertical: 28 },
    avatarCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#667eea', justifyContent: 'center', alignItems: 'center', marginBottom: 14, shadowColor: '#667eea', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 10, elevation: 6 },
    tutorName: { fontSize: 22, fontWeight: 'bold', color: colors.text },
    tutorVoice: { fontSize: 14, color: colors.textSecondary, marginTop: 4 },
    speakingStatus: { fontSize: 14, color: '#667eea', fontWeight: '600', marginTop: 8 },
    connectingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
    connectingText: { fontSize: 14, color: '#667eea' },
    webHint: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 20, marginBottom: 8, backgroundColor: colors.surface, borderRadius: 10, padding: 12, borderWidth: 1, borderColor: colors.border },
    webHintText: { fontSize: 12, color: colors.textSecondary, flex: 1, lineHeight: 18 },
    transcriptBox: { flex: 1, marginHorizontal: 16, marginBottom: 8 },
    transcriptContent: { gap: 8, paddingVertical: 8 },
    bubble: { maxWidth: '80%', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10 },
    bubbleTutor: { alignSelf: 'flex-start', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
    bubbleUser: { alignSelf: 'flex-end', backgroundColor: '#667eea' },
    bubbleText: { fontSize: 14, lineHeight: 20 },
    bubbleTextTutor: { color: colors.text },
    bubbleTextUser: { color: '#fff' },
    emptyHint: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, gap: 12 },
    emptyHintText: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', lineHeight: 22 },
    errorBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#ffebee', borderRadius: 10, padding: 12, marginHorizontal: 16, marginBottom: 8 },
    errorText: { color: '#c62828', fontSize: 13, flex: 1 },
    ctaContainer: { paddingHorizontal: 20, paddingBottom: 24, paddingTop: 8 },
    startButton: { flexDirection: 'row', backgroundColor: '#667eea', borderRadius: 18, height: 64, justifyContent: 'center', alignItems: 'center', gap: 12, shadowColor: '#667eea', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8, elevation: 5 },
    startButtonText: { color: '#fff', fontSize: 18, fontWeight: '700' },
    endButton: { flexDirection: 'row', backgroundColor: '#e53935', borderRadius: 18, height: 64, justifyContent: 'center', alignItems: 'center', gap: 12, shadowColor: '#e53935', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8, elevation: 5 },
    endButtonText: { color: '#fff', fontSize: 18, fontWeight: '700' },
    buttonDisabled: { opacity: 0.6 },
    configScroll: { padding: 24, paddingBottom: 40 },
    configHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 },
    configTitle: { fontSize: 22, fontWeight: 'bold', color: colors.text },
    configLabel: { fontSize: 14, fontWeight: '600', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10, marginTop: 20 },
    configInput: { backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1.5, borderColor: colors.border, paddingHorizontal: 16, height: 52, fontSize: 16, color: colors.text },
    genderRow: { flexDirection: 'row', gap: 12 },
    genderChip: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 48, borderRadius: 12, borderWidth: 2, borderColor: colors.border, backgroundColor: colors.surface },
    genderChipSelected: { backgroundColor: '#667eea', borderColor: '#667eea' },
    genderChipText: { fontSize: 15, fontWeight: '600', color: colors.text },
    genderChipTextSelected: { color: '#fff' },
    voiceCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 12, borderWidth: 2, borderColor: colors.border, padding: 14, marginBottom: 10 },
    voiceCardSelected: { borderColor: '#667eea' },
    voiceInfo: { flex: 1 },
    voiceName: { fontSize: 15, fontWeight: '600', color: colors.text },
    voiceNameSelected: { color: '#667eea' },
    voiceDesc: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
    saveButton: { backgroundColor: '#667eea', borderRadius: 14, height: 56, justifyContent: 'center', alignItems: 'center', marginTop: 28 },
    saveButtonText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  });
