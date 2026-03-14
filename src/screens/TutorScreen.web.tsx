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
  Image,
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
  { id: 'Yb9rQITgCX1VdXgAkbjM', name: 'Marco', gender: 'male' as const, description: 'Mediterraneo, caldo', avatar: '/tutor-Marco.png' },
  { id: 'zcAOhNBS3c14rBihAFp1', name: 'Giovanni', gender: 'male' as const, description: 'Classico, chiaro', avatar: '/tutor-Giovanni.png' },
  { id: 'CnVVMwhKmKZ6hKBAkL6Y', name: 'Giulia', gender: 'female' as const, description: 'Dolce, rassicurante', avatar: '/tutor-Giulia.png' },
  { id: 'HLbf5OcXzzI5RP4O3I3d', name: 'Francesca', gender: 'female' as const, description: 'Elegante, professionale', avatar: '/tutor-Francesca.png' },
];

interface TutorConfig {
  tutorName: string;
  voiceId: string;
  voiceName: string;
  gender: 'male' | 'female';
  avatarUri: string;
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
  avatarUri: ITALIAN_VOICES[0].avatar,
};

const STORAGE_KEY = 'tutor_config_v1';

function buildSystemPrompt(tutorName: string): string {
  return `Sei ${tutorName}, un tutor di italiano amichevole e paziente specializzato nell'insegnamento dell'italiano dal livello A1 al B1.

## LINGUA DI COMUNICAZIONE
- Rileva IMMEDIATAMENTE la lingua in cui ti parla l'utente (italiano, spagnolo o inglese).
- Rispondi SEMPRE nella stessa lingua dell'utente finché lui non dimostra di poter continuare in italiano.
- Se parla in spagnolo: rispondi in spagnolo, introducendo gradualmente frasi in italiano con traduzione.
- Se parla in inglese: rispondi in inglese, introducendo gradualmente frasi in italiano con traduzione.
- Se parla già in italiano: mantieni la conversazione in italiano, adattando la difficoltà.
- Passa gradualmente all'italiano man mano che l'utente acquisisce sicurezza. Mai forzare il cambiamento.

## PRE-VALUTAZIONE DEL LIVELLO (obbligatoria all'inizio di ogni sessione)
Dopo il saluto, fai UNA domanda alla volta per determinare il livello:
1. Chiedi se ha già studiato italiano (sì/no/un po') — nella lingua dell'utente.
2. Se sì: fai una domanda semplice in italiano ("Come ti chiami?", "Da dove vieni?") e valuta la risposta.
3. Classifica l'utente internamente e adatta tutta la sessione:
   - **A1** (principiante assoluto): inizia dalle basi — saluti, numeri, presentazioni, oggetti quotidiani.
   - **A2** (principiante con basi): vocabolario quotidiano, frasi semplici, presente e passato.
   - **B1** (intermedio): conversazione fluida, grammatica avanzata, correzione contestuale.
4. Comunica il livello rilevato all'utente in modo positivo e motivante.

## METODOLOGIA DI INSEGNAMENTO
- Correggi gli errori con gentilezza: ripeti la forma corretta e spiega brevemente perché.
- Mantieni le risposte brevi (2-3 frasi) per un ritmo naturale e conversazionale.
- Ogni 4-5 scambi, dai un incoraggiamento concreto sui progressi dell'utente.
- Usa esempi pratici e situazioni della vita reale (al ristorante, in viaggio, presentarsi).
- Per A1-A2: spiega prima in spagnolo/inglese, poi ripeti in italiano con pronuncia chiara.
- Per B1: conversa direttamente in italiano, spiega solo i termini complessi.
- La sessione deve essere PIACEVOLE e motivante — mai frustrante o meccanica.
- Se l'utente si blocca, incoraggialo e semplifica: "Prova a dirlo così...".`;
}

// ─── Ecualizador visual ───────────────────────────────────────────────────────
const BAR_CONFIGS = [
  { high: 0.9, low: 0.2, duration: 260 },
  { high: 0.5, low: 0.15, duration: 380 },
  { high: 1.0, low: 0.3, duration: 210 },
  { high: 0.7, low: 0.2, duration: 440 },
  { high: 0.85, low: 0.25, duration: 300 },
];

function EqualizerBars({ active, color }: { active: boolean; color: string }) {
  const b0 = useRef(new Animated.Value(0.2)).current;
  const b1 = useRef(new Animated.Value(0.2)).current;
  const b2 = useRef(new Animated.Value(0.2)).current;
  const b3 = useRef(new Animated.Value(0.2)).current;
  const b4 = useRef(new Animated.Value(0.2)).current;
  const bars = [b0, b1, b2, b3, b4];

  useEffect(() => {
    if (!active) {
      bars.forEach(b => { b.stopAnimation(); b.setValue(0.2); });
      return;
    }
    const anims = bars.map((b, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(b, { toValue: BAR_CONFIGS[i].high, duration: BAR_CONFIGS[i].duration, useNativeDriver: false }),
          Animated.timing(b, { toValue: BAR_CONFIGS[i].low, duration: BAR_CONFIGS[i].duration, useNativeDriver: false }),
        ])
      )
    );
    anims.forEach(a => a.start());
    return () => anims.forEach(a => a.stop());
  }, [active]);

  return (
    <View style={{ flexDirection: 'row', gap: 4, alignItems: 'flex-end', height: 28 }}>
      {bars.map((b, i) => (
        <Animated.View key={i} style={{
          width: 5,
          height: b.interpolate({ inputRange: [0, 1], outputRange: [4, 28] }),
          backgroundColor: color,
          borderRadius: 3,
        }} />
      ))}
    </View>
  );
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
  const [userSpeaking, setUserSpeaking] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionStartRef = useRef<number>(0);
  const scrollRef = useRef<ScrollView>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const listenersAttached = useRef(false);
  const micStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<any>(null);
  const analyserRef = useRef<any>(null);
  const micPollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const styles = getStyles(colors);

  const minutesRemaining = Math.max(0, Math.floor(minuteLimit - minutesUsed));

  // ─── Cargar config + minutos usados ──────────────────────────────────────
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(val => {
      if (val) {
        const saved = JSON.parse(val) as TutorConfig;
        // Retrocompatibilidad: si no tiene avatarUri, recuperarlo del array de voces
        if (!saved.avatarUri) {
          const voice = ITALIAN_VOICES.find(v => v.id === saved.voiceId);
          saved.avatarUri = voice?.avatar ?? ITALIAN_VOICES[0].avatar;
        }
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
    vapi.removeAllListeners(); // evita listeners duplicados en llamadas sucesivas

    vapi.on('call-start', () => { setCallStatus('active'); setError(''); });

    vapi.on('call-end', async () => {
      setCallStatus('idle');
      setIsTutorSpeaking(false);
      setUserSpeaking(false);
      listenersAttached.current = false; // permite re-attachar en la próxima llamada
      // Limpiar análisis de micrófono
      if (micPollRef.current) clearInterval(micPollRef.current);
      if (audioContextRef.current) { audioContextRef.current.close(); audioContextRef.current = null; }
      if (micStreamRef.current) { micStreamRef.current.getTracks().forEach(t => t.stop()); micStreamRef.current = null; }
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

    // Solicitar permiso de micrófono e iniciar análisis de nivel de audio
    let micStream: MediaStream;
    try {
      micStream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      micStreamRef.current = micStream;
      // Análisis de audio para detectar cuando el usuario habla
      const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 512;
        ctx.createMediaStreamSource(micStream).connect(analyser);
        audioContextRef.current = ctx;
        analyserRef.current = analyser;
        const dataArr = new Uint8Array(analyser.frequencyBinCount);
        micPollRef.current = setInterval(() => {
          analyser.getByteFrequencyData(dataArr);
          const avg = dataArr.reduce((a, b) => a + b, 0) / dataArr.length;
          setUserSpeaking(avg > 12);
        }, 80);
      }
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

      await vapi.start(VAPI_ASSISTANT_ID, {
        firstMessage: `Ciao! Sono ${config.tutorName}. Parli italiano, español o English?`,
        voice: { provider: '11labs', voiceId: config.voiceId },
        transcriber: { provider: 'deepgram', model: 'nova-2', language: 'multi' },
      } as any);
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
    if (micPollRef.current) clearInterval(micPollRef.current);
    if (audioContextRef.current) { audioContextRef.current.close(); audioContextRef.current = null; }
    if (micStreamRef.current) { micStreamRef.current.getTracks().forEach(t => t.stop()); micStreamRef.current = null; }
    setUserSpeaking(false);
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
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.configScroll}>
        <View style={styles.configHeader}>
          <Text style={styles.configTitle}>Configura il tuo Tutor</Text>
          <TouchableOpacity onPress={() => setShowConfig(false)}>
            <Ionicons name="close" size={26} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Selección de tutor con avatar */}
        <Text style={styles.configLabel}>Scegli il tuo tutor</Text>
        <View style={styles.avatarGrid}>
          {ITALIAN_VOICES.map(v => {
            const isSelected = editingConfig.voiceId === v.id;
            return (
              <TouchableOpacity
                key={v.id}
                style={[styles.avatarOption, isSelected && styles.avatarOptionSelected]}
                onPress={() => setEditingConfig(prev => ({
                  ...prev,
                  voiceId: v.id,
                  voiceName: v.name,
                  tutorName: v.name,
                  gender: v.gender,
                  avatarUri: v.avatar,
                }))}
                activeOpacity={0.8}
              >
                <View style={[styles.avatarImgWrap, isSelected && styles.avatarImgWrapSelected]}>
                  <Image
                    source={{ uri: v.avatar }}
                    style={styles.avatarOptionImg}
                    resizeMode="cover"
                  />
                  {isSelected && (
                    <View style={styles.avatarCheckBadge}>
                      <Ionicons name="checkmark" size={12} color="#fff" />
                    </View>
                  )}
                </View>
                <Text style={[styles.avatarOptionName, isSelected && styles.avatarOptionNameSelected]}>
                  {v.name}
                </Text>
                <Text style={styles.avatarOptionDesc}>{v.description}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Nombre personalizado (opcional) */}
        <Text style={styles.configLabel}>Nome personalizzato (opzionale)</Text>
        <TextInput
          style={styles.configInput}
          value={editingConfig.tutorName}
          onChangeText={t => setEditingConfig(prev => ({ ...prev, tutorName: t }))}
          placeholder="Lascia il nome originale o personalizzalo"
          placeholderTextColor={colors.textSecondary}
          maxLength={20}
        />

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
            backgroundColor: minutesRemaining <= 10 ? '#e53935' : minutesRemaining <= 20 ? '#f57c00' : colors.primary,
          }]} />
        </View>
      </View>

      {/* Tarjeta del tutor */}
      <View style={styles.tutorCard}>
        <Animated.View style={[styles.avatarCircle, { transform: [{ scale: pulseAnim }] }]}>
          <Image
            source={{ uri: config.avatarUri }}
            style={styles.avatarImage}
            resizeMode="cover"
          />
        </Animated.View>
        <Text style={styles.tutorName}>{config.tutorName}</Text>
        <Text style={styles.tutorVoice}>{config.voiceName}</Text>
        {callStatus === 'active' && (
          <View style={styles.equalizerRow}>
            {/* Ecualizador tutor (habla) */}
            <View style={styles.equalizerBlock}>
              <EqualizerBars active={isTutorSpeaking} color={colors.primary} />
              <Text style={[styles.equalizerLabel, { color: isTutorSpeaking ? colors.primary : colors.textSecondary }]}>
                {isTutorSpeaking ? `${config.tutorName} parla` : config.tutorName}
              </Text>
            </View>
            <Ionicons name="swap-horizontal" size={18} color={colors.border} style={{ marginHorizontal: 8 }} />
            {/* Ecualizador usuario (micrófono real) */}
            <View style={styles.equalizerBlock}>
              <EqualizerBars active={userSpeaking} color="#2196f3" />
              <Text style={[styles.equalizerLabel, { color: userSpeaking ? '#2196f3' : colors.textSecondary }]}>
                {userSpeaking ? 'Tu parli' : 'In ascolto'}
              </Text>
            </View>
          </View>
        )}
        {(callStatus === 'connecting' || sdkLoading) && (
          <View style={styles.connectingRow}>
            <ActivityIndicator size="small" color={colors.primary} />
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
    lockButton: { marginTop: 24, backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 36 },
    lockButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 },
    headerTitle: { fontSize: 26, fontWeight: 'bold', color: colors.primary },
    sessionTimer: { fontSize: 14, color: colors.primary, fontWeight: '600', marginTop: 2 },
    configIconButton: { padding: 8 },
    quotaContainer: { marginHorizontal: 20, marginBottom: 8, gap: 6 },
    quotaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    quotaText: { fontSize: 13, fontWeight: '500' },
    quotaBar: { height: 4, backgroundColor: colors.border, borderRadius: 2, overflow: 'hidden' },
    quotaFill: { height: '100%', borderRadius: 2 },
    tutorCard: { alignItems: 'center', paddingVertical: 20 },
    avatarCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 14, shadowColor: colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 10, elevation: 6, overflow: 'hidden' },
    avatarImage: { width: 100, height: 100, borderRadius: 50 },
    tutorName: { fontSize: 22, fontWeight: 'bold', color: colors.text },
    tutorVoice: { fontSize: 14, color: colors.textSecondary, marginTop: 4 },
    equalizerRow: { flexDirection: 'row', alignItems: 'center', marginTop: 16, paddingHorizontal: 20 },
    equalizerBlock: { alignItems: 'center', gap: 6 },
    equalizerLabel: { fontSize: 11, fontWeight: '600' },
    connectingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
    connectingText: { fontSize: 14, color: colors.primary },
    webHint: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 20, marginBottom: 8, backgroundColor: colors.surface, borderRadius: 10, padding: 12, borderWidth: 1, borderColor: colors.border },
    webHintText: { fontSize: 12, color: colors.textSecondary, flex: 1, lineHeight: 18 },
    transcriptBox: { flex: 1, marginHorizontal: 16, marginBottom: 8 },
    transcriptContent: { gap: 8, paddingVertical: 8 },
    bubble: { maxWidth: '80%', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10 },
    bubbleTutor: { alignSelf: 'flex-start', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
    bubbleUser: { alignSelf: 'flex-end', backgroundColor: colors.primary },
    bubbleText: { fontSize: 14, lineHeight: 20 },
    bubbleTextTutor: { color: colors.text },
    bubbleTextUser: { color: '#fff' },
    emptyHint: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, gap: 12 },
    emptyHintText: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', lineHeight: 22 },
    errorBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#ffebee', borderRadius: 10, padding: 12, marginHorizontal: 16, marginBottom: 8 },
    errorText: { color: '#c62828', fontSize: 13, flex: 1 },
    ctaContainer: { paddingHorizontal: 20, paddingBottom: 24, paddingTop: 8 },
    startButton: { flexDirection: 'row', backgroundColor: colors.primary, borderRadius: 18, height: 64, justifyContent: 'center', alignItems: 'center', gap: 12, shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8, elevation: 5 },
    startButtonText: { color: '#fff', fontSize: 18, fontWeight: '700' },
    endButton: { flexDirection: 'row', backgroundColor: '#e53935', borderRadius: 18, height: 64, justifyContent: 'center', alignItems: 'center', gap: 12, shadowColor: '#e53935', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8, elevation: 5 },
    endButtonText: { color: '#fff', fontSize: 18, fontWeight: '700' },
    buttonDisabled: { opacity: 0.6 },
    configScroll: { padding: 24, paddingBottom: 40 },
    configHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 },
    configTitle: { fontSize: 22, fontWeight: 'bold', color: colors.text },
    configLabel: { fontSize: 14, fontWeight: '600', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10, marginTop: 20 },
    configInput: { backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1.5, borderColor: colors.border, paddingHorizontal: 16, height: 52, fontSize: 16, color: colors.text },
    saveButton: { backgroundColor: colors.primary, borderRadius: 14, height: 56, justifyContent: 'center', alignItems: 'center', marginTop: 28 },
    saveButtonText: { color: '#fff', fontSize: 17, fontWeight: '700' },
    // Avatar grid
    avatarGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 8 },
    avatarOption: { width: '46%', alignItems: 'center', gap: 6, padding: 10, borderRadius: 16, borderWidth: 2, borderColor: colors.border, backgroundColor: colors.surface },
    avatarOptionSelected: { borderColor: colors.primary, backgroundColor: colors.primary + '10' },
    avatarImgWrap: { position: 'relative', width: 72, height: 72, borderRadius: 36, overflow: 'hidden', borderWidth: 3, borderColor: 'transparent' },
    avatarImgWrapSelected: { borderColor: colors.primary },
    avatarOptionImg: { width: 72, height: 72, borderRadius: 36 },
    avatarCheckBadge: { position: 'absolute', bottom: 2, right: 2, width: 20, height: 20, borderRadius: 10, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
    avatarOptionName: { fontSize: 14, fontWeight: '700', color: colors.text },
    avatarOptionNameSelected: { color: colors.primary },
    avatarOptionDesc: { fontSize: 11, color: colors.textSecondary, textAlign: 'center' },
  });
