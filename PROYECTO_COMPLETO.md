# 🇮🇹 ItaliantoApp - Documentación Completa del Proyecto

## 📖 Índice
1. [Visión General](#visión-general)
2. [Características Principales](#características-principales)
3. [Arquitectura del Proyecto](#arquitectura-del-proyecto)
4. [Historial de Desarrollo](#historial-de-desarrollo)
5. [Tecnologías Utilizadas](#tecnologías-utilizadas)
6. [Instalación y Configuración](#instalación-y-configuración)
7. [Estructura de Archivos](#estructura-de-archivos)
8. [Servicios y APIs](#servicios-y-apis)
9. [Guía de Uso](#guía-de-uso)
10. [Roadmap y Futuro](#roadmap-y-futuro)

---

## 🎯 Visión General

**ItaliantoApp** es una aplicación móvil completa para el aprendizaje del idioma italiano, diseñada específicamente para hablantes de español e inglés. La aplicación combina tecnologías de IA, reconocimiento de voz y traducción automática para ofrecer una experiencia de aprendizaje interactiva y efectiva.

### Objetivo
Proporcionar una herramienta integral de aprendizaje de italiano que cubra:
- Traducción bidireccional (ES/EN ↔ IT)
- Conjugación de verbos italianos
- Práctica de pronunciación con feedback en tiempo real
- Sistema de gamificación para motivar el aprendizaje continuo

### Público Objetivo
- Estudiantes de italiano (niveles A1-C2)
- Viajeros que necesitan comunicarse en italiano
- Personas interesadas en la cultura italiana
- Profesionales que trabajan con Italia

---

## ⭐ Características Principales

### 1. 🌍 Traductor Bidireccional
- **Idiomas soportados:** Español ↔ Italiano, Inglés ↔ Italiano
- **Tecnología:** Diccionario local (800+ palabras) + API DeepL
- **Características:**
  - Traducción instantánea
  - Sugerencias inteligentes
  - Historial de traducciones (últimas 100)
  - Sistema de favoritos
  - Botón de intercambio de idiomas
  - Caché de respuestas para velocidad

**Ejemplo de uso:**
```
Entrada: "prosciutto" (IT)
Salida: "jamón" (ES)
Método: DeepL API (palabra no en diccionario local)
```

### 2. 📖 Conjugador de Verbos
- **Verbos incluidos:** 50+ verbos italianos comunes
- **Tiempos verbales:**
  - Presente (Presente)
  - Pasado Próximo (Passato Prossimo)
  - Imperfecto (Imperfetto)
  - Futuro Simple (Futuro Semplice)
  - Condicional (Condizionale)
  - Subjuntivo (Congiuntivo)

**Características:**
- Búsqueda de verbos
- Display de todas las conjugaciones
- Ejemplos de uso
- Modo de práctica

### 3. 🎤 Práctica de Pronunciación
- **Tecnología:** Google Voice Recognition + expo-speech
- **Características:**
  - Reconocimiento de voz en italiano
  - Feedback objetivo y educativo
  - Puntaje de precisión (0-100%)
  - Sistema de evaluación estricto
  - Reproducción de pronunciación correcta
  - 60+ palabras de práctica

**Niveles de Feedback:**
- **Excellent (95-100%):** Pronunciación casi perfecta
- **Good (75-94%):** Buena pronunciación con errores menores
- **Try Again (<75%):** Necesita mejorar

### 4. ⚙️ Configuración y Personalización
- Tema claro/oscuro
- Control de notificaciones
- Gestión de datos
- Información de la app
- Exportar progreso
- Preparación para features premium

### 5. 🎨 Experiencia de Usuario
- **Splash Screen:** Animación de bienvenida con logo (3 segundos)
- **Onboarding:** Tutorial interactivo de 4 pantallas
- **Tema Adaptativo:** Soporte para modo claro y oscuro
- **Animaciones:** Transiciones suaves y efectos visuales
- **Toast Notifications:** Feedback no intrusivo
- **Responsive Design:** Optimizado para diferentes tamaños de pantalla

---

## 🏗️ Arquitectura del Proyecto

### Patrón de Diseño
- **Arquitectura:** Component-based (React Native)
- **Estado Global:** Context API (Theme, Toast, UserProgress)
- **Navegación:** React Navigation (Bottom Tabs)
- **Persistencia:** AsyncStorage
- **Servicios:** Singleton pattern para servicios

### Flujo de Datos
```
Usuario
    ↓
Componentes UI (Screens)
    ↓
Hooks Personalizados (useUserProgress, useTheme)
    ↓
Servicios (Translation, Conjugation, Pronunciation)
    ↓
APIs Externas (DeepL, Google Voice) / Datos Locales
    ↓
Storage (AsyncStorage)
```

### Estructura de Capas
```
┌─────────────────────────────────────┐
│   Presentation Layer (Screens)      │
├─────────────────────────────────────┤
│   Business Logic (Hooks/Context)    │
├─────────────────────────────────────┤
│   Services (Translation, Voice)     │
├─────────────────────────────────────┤
│   Data Layer (AsyncStorage, APIs)   │
└─────────────────────────────────────┘
```

---

## 📅 Historial de Desarrollo

### Fase 1: Concepto Inicial (Enero 2024)
- ✅ Definición de alcance
- ✅ Investigación de tecnologías
- ✅ Diseño de UI/UX básico
- ✅ Setup inicial del proyecto

### Fase 2: Funcionalidades Core (Febrero 2024)
- ✅ Implementación de traductor ES→IT
- ✅ Implementación de traductor EN→IT
- ✅ Conjugador de verbos básico
- ✅ Sistema de pronunciación inicial
- ✅ Navegación entre pantallas

### Fase 3: Mejoras UX/UI (Marzo 2024)
- ✅ Splash screen animado
- ✅ Onboarding interactivo
- ✅ Tema claro/oscuro
- ✅ Sistema de toasts
- ✅ Componentes reutilizables

### Fase 4: Gamificación (Abril 2024)
- ✅ Sistema de progreso de usuario
- ✅ Racha de días consecutivos
- ✅ Historial de traducciones
- ✅ Estadísticas de pronunciación
- ✅ Sistema de favoritos

### Fase 5: Infraestructura Premium (Mayo 2024)
- ✅ Servicio de suscripciones
- ✅ Pantalla de configuración
- ✅ Preparación para features premium
- ✅ Sistema de badges/logros

### Fase 6: Optimización y Correcciones (Octubre 2024)
- ✅ Traducción bidireccional IT→ES/EN
- ✅ Integración completa de DeepL API
- ✅ Algoritmo de pronunciación más estricto
- ✅ Mejora en reproducción de audio
- ✅ Eliminación de pantallas no prioritarias
- ✅ Optimización de rendimiento

---

## 🛠️ Tecnologías Utilizadas

### Frontend
```json
{
  "react": "18.2.0",
  "react-native": "0.73.6",
  "expo": "~50.0.20"
}
```

### Navegación
```json
{
  "@react-navigation/native": "^6.1.9",
  "@react-navigation/bottom-tabs": "^6.5.11",
  "@react-navigation/native-stack": "^6.9.17"
}
```

### UI Components
```json
{
  "@expo/vector-icons": "latest",
  "react-native-elements": "^3.4.3",
  "react-native-vector-icons": "^10.0.3",
  "@react-native-picker/picker": "^2.6.1"
}
```

### Funcionalidades Core
```json
{
  "@react-native-voice/voice": "^3.2.4",
  "expo-speech": "~11.7.0",
  "@react-native-async-storage/async-storage": "~1.21.0",
  "axios": "^1.6.7"
}
```

### Utilidades
```json
{
  "expo-constants": "~15.4.6",
  "expo-localization": "~14.8.3",
  "i18n-js": "^4.3.2",
  "react-native-safe-area-context": "4.8.2"
}
```

### DevTools
```json
{
  "typescript": "^5.1.3",
  "@types/react": "~18.2.45",
  "eslint": "^8.56.0",
  "@typescript-eslint/eslint-plugin": "^6.19.1"
}
```

### APIs Externas
- **DeepL API:** Traducción automática de alta calidad
- **Google Voice Recognition:** Reconocimiento de voz (via @react-native-voice/voice)
- **expo-speech:** Text-to-Speech para pronunciación

---

## 💻 Instalación y Configuración

### Prerrequisitos
```bash
Node.js >= 16.x
npm >= 8.x
Expo CLI
Android Studio (para Android)
Xcode (para iOS - Mac only)
```

### Instalación
```bash
# 1. Clonar repositorio
git clone https://github.com/mario24874/italiantoapp.git
cd ItaliantoApp

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tu API key de DeepL

# 4. Iniciar en modo desarrollo
npm start

# 5. Ejecutar en Android
npm run android

# 6. Ejecutar en iOS
npm run ios
```

### Variables de Entorno
```bash
# .env
DEEPL_API_KEY=tu-api-key-aqui
API_TIMEOUT=5000
```

### Build para Producción
```bash
# APK para testing
npm run build:apk

# Build específico con EAS
npx eas build --platform android --profile preview

# Build de producción
npx eas build --platform android --profile production
```

---

## 📁 Estructura de Archivos

```
ItaliantoApp/
├── .expo/                      # Configuración de Expo
├── assets/                     # Recursos estáticos
│   ├── Logo_ItaliAnto.png     # Logo principal
│   └── favicon.png            # Favicon para web
│
├── src/
│   ├── components/            # Componentes reutilizables
│   │   ├── AnimatedButton.tsx       # Botón con animación
│   │   ├── FadeInView.tsx          # Componente con fade-in
│   │   ├── Onboarding.tsx          # Tutorial inicial (4 slides)
│   │   ├── SplashScreen.tsx        # Pantalla de bienvenida
│   │   ├── SuccessAnimation.tsx    # Animación de éxito
│   │   ├── StatsCard.tsx           # Tarjeta de estadísticas
│   │   ├── ThemeToggle.tsx         # Toggle de tema
│   │   ├── Toast.tsx               # Notificación toast
│   │   └── CircularProgress.tsx    # Progreso circular
│   │
│   ├── context/               # Context API
│   │   ├── ThemeContext.tsx        # Tema global
│   │   └── ToastContext.tsx        # Sistema de notificaciones
│   │
│   ├── hooks/                 # Custom hooks
│   │   └── useUserProgress.ts      # Hook de progreso del usuario
│   │
│   ├── i18n/                  # Internacionalización
│   │   ├── i18n.ts
│   │   └── locales/
│   │       └── it.json
│   │
│   ├── screens/               # Pantallas principales
│   │   ├── TranslatorScreen.tsx    # Traductor bidireccional
│   │   ├── ConjugatorScreen.tsx    # Conjugador de verbos
│   │   ├── PronunciationScreen.tsx # Práctica de pronunciación
│   │   └── SettingsScreen.tsx      # Configuración
│   │
│   ├── services/              # Servicios de negocio
│   │   ├── conjugationService.ts   # Lógica de conjugación
│   │   ├── dictionaryService.ts    # Diccionario IT↔ES/EN
│   │   ├── pronunciationService.ts # Lógica de pronunciación
│   │   ├── storageService.ts       # Persistencia de datos
│   │   ├── subscriptionService.ts  # Sistema premium
│   │   ├── translationService.ts   # Lógica de traducción + DeepL
│   │   └── voiceService.ts         # Reconocimiento de voz
│   │
│   ├── types/                 # TypeScript types
│   │   └── index.ts
│   │
│   └── utils/                 # Utilidades
│       └── errorHandler.ts
│
├── .env                       # Variables de entorno (no en git)
├── .env.example              # Ejemplo de variables de entorno
├── .gitignore                # Archivos ignorados por git
├── app.config.js             # Configuración de Expo
├── App.tsx                   # Componente raíz
├── babel.config.js           # Configuración de Babel
├── CHANGELOG.md              # Registro de cambios
├── eas.json                  # Configuración de EAS Build
├── package.json              # Dependencias y scripts
├── package-lock.json         # Lock de dependencias
├── PROYECTO_COMPLETO.md      # Este archivo
├── README.md                 # Documentación principal
├── tsconfig.json             # Configuración de TypeScript
└── NUEVAS_IMPLEMENTACIONES.md # Registro de features anteriores
```

---

## 🔌 Servicios y APIs

### 1. TranslationService
**Archivo:** `src/services/translationService.ts`

**Responsabilidades:**
- Traducción bidireccional ES/EN ↔ IT
- Integración con DeepL API
- Diccionarios locales (800+ palabras)
- Sistema de caché
- Sugerencias inteligentes

**Métodos principales:**
```typescript
static async translateBidirectional(
  text: string,
  sourceLang: Language,
  targetLang: Language
): Promise<string>

static getRandomWord(sourceLang: Language): {
  original: string,
  translation: string
}

static getSuggestions(text: string, sourceLang: Language): string[]
```

**Flujo de traducción:**
1. Verificar caché
2. Buscar en diccionario local
3. Si no encuentra → Llamar DeepL API
4. Si API falla → Buscar sugerencias similares
5. Retornar resultado o mensaje de error

### 2. ConjugationService
**Archivo:** `src/services/conjugationService.ts`

**Responsabilidades:**
- Conjugación de verbos italianos
- 50+ verbos comunes
- 6 tiempos verbales

**Tiempos soportados:**
```typescript
type VerbTense =
  | 'presente'
  | 'passatoProssimo'
  | 'imperfetto'
  | 'futuroSemplice'
  | 'condizionale'
  | 'congiuntivo'
```

**Métodos principales:**
```typescript
static conjugateVerb(
  verb: string,
  tense: VerbTense
): VerbConjugation | null

static getAllVerbs(): string[]
static getRandomVerb(): string
```

### 3. PronunciationService
**Archivo:** `src/services/pronunciationService.ts`

**Responsabilidades:**
- Evaluación de pronunciación
- Cálculo de puntaje objetivo
- Análisis fonético para italiano
- Reproducción de audio (TTS)

**Algoritmo de evaluación:**
```typescript
1. Coincidencia exacta → 100%
2. Coincidencia con palabras extra → 92-98%
3. Similitud fonética exacta → 95%
4. Cálculo de similitud literal (50%) + fonética (50%)
5. Aplicar penalizaciones:
   - Errores críticos: -50%
   - Diferencia de longitud: -15%
6. Retornar puntaje final (0-100%)
```

**Métodos principales:**
```typescript
static calculateScore(
  targetWord: string,
  spokenWord: string
): number

static analyzePronunciation(
  targetWord: string,
  spokenWords: string[]
): PronunciationResult

static async speakWord(word: string): Promise<void>
```

### 4. StorageService
**Archivo:** `src/services/storageService.ts`

**Responsabilidades:**
- Persistencia con AsyncStorage
- Gestión de progreso del usuario
- Historial de traducciones
- Favoritos
- Estadísticas

**Datos almacenados:**
```typescript
interface UserProgress {
  totalTranslations: number
  totalConjugations: number
  pronunciationAttempts: number
  pronunciationSuccess: number
  totalScore: number
  streakDays: number
  lastActivityDate: string
  favoriteWords: string[]
  translationHistory: TranslationHistoryItem[]
}
```

### 5. VoiceService
**Archivo:** `src/services/voiceService.ts`

**Responsabilidades:**
- Reconocimiento de voz
- Integración con Google Voice Recognition
- Manejo de permisos
- Callbacks de eventos

**Eventos soportados:**
```typescript
{
  onResults: (results: string[]) => void
  onError: (error: any) => void
  onStart: () => void
  onEnd: () => void
}
```

### 6. SubscriptionService
**Archivo:** `src/services/subscriptionService.ts`

**Responsabilidades:**
- Gestión de suscripciones premium
- Verificación de features
- Planes de pago

**Planes preparados:**
```typescript
{
  MONTHLY: $9.99/mes
  ANNUAL: $79.99/año (33% descuento)
  LIFETIME: $199.99 (pago único)
}
```

---

## 📱 Guía de Uso

### Para Usuarios

#### 1. Primer Uso
1. Abrir la app → Ver Splash Screen (3 seg)
2. Tutorial de Onboarding (4 pantallas):
   - Bienvenida
   - Función de traducción
   - Conjugador de verbos
   - Práctica de pronunciación
3. Llegar a pantalla principal (Traductor)

#### 2. Traducir
1. Ir a tab "Traduttore"
2. Seleccionar idioma origen (Da:)
3. Seleccionar idioma destino (A:)
4. Escribir texto
5. Tocar "Traduci"
6. Ver resultado
7. (Opcional) Tocar 🔄 para intercambiar idiomas

#### 3. Conjugar Verbos
1. Ir a tab "Coniugatore"
2. Seleccionar un verbo de la lista
3. Seleccionar tiempo verbal
4. Ver conjugaciones completas
5. Tocar 🔊 para escuchar pronunciación

#### 4. Practicar Pronunciación
1. Ir a tab "Pronuncia"
2. Elegir modo:
   - **Casuale:** Palabra aleatoria
   - **Scegli:** Seleccionar palabra específica
3. Tocar 🔊 para escuchar pronunciación correcta
4. Tocar micrófono 🎤 para grabar
5. Pronunciar la palabra claramente
6. Ver puntaje y feedback
7. Repetir para mejorar

#### 5. Configuración
1. Ir a tab "Impostazioni"
2. Cambiar tema (claro/oscuro)
3. Gestionar notificaciones
4. Exportar/eliminar datos
5. Ver información premium

### Para Desarrolladores

#### Agregar Nueva Palabra al Diccionario
```typescript
// src/services/translationService.ts
private static spanishDictionary: Record<string, string[]> = {
  // Agregar nueva palabra
  'nueva palabra': ['nuova parola', 'palabra nueva'],
  // ...
};
```

#### Agregar Nuevo Verbo
```typescript
// src/services/conjugationService.ts
private static verbs: Record<string, VerbConjugations> = {
  'nuevo_verbo': {
    presente: {
      io: 'verbo',
      tu: 'verbi',
      // ...
    },
    // ...
  }
};
```

#### Modificar Algoritmo de Pronunciación
```typescript
// src/services/pronunciationService.ts
static calculateScore(targetWord: string, spokenWord: string): number {
  // Personalizar lógica aquí
  // Retornar puntaje 0-100
}
```

#### Agregar Nueva Pantalla
```typescript
// 1. Crear componente en src/screens/
// 2. Agregar a navegación en App.tsx

<Tab.Screen
  name="NuevaPantalla"
  component={NuevaPantallaScreen}
  options={{
    title: 'Título',
    tabBarIcon: ({ color, size }) => (
      <Ionicons name="icon-name" size={size} color={color} />
    ),
  }}
/>
```

---

## 🚀 Roadmap y Futuro

### Versión 1.3.0 (Próxima) - Q1 2025
- [ ] Modo offline completo
- [ ] Exportar progreso a PDF
- [ ] Compartir traducciones por redes sociales
- [ ] Modo oscuro automático según hora del día
- [ ] Widgets de Android

### Versión 2.0.0 - Q2 2025
- [ ] **Tutor AI Personalizado** 🤖
  - Conversaciones en italiano con IA
  - Corrección gramatical en tiempo real
  - Ejercicios personalizados según nivel
- [ ] Sistema de lecciones estructuradas (A1-C2)
- [ ] Tests de nivel
- [ ] Certificados de logros

### Versión 2.5.0 - Q3 2025
- [ ] Modo desafío multijugador
- [ ] Tablas de clasificación global
- [ ] Desafíos semanales con premios
- [ ] Sistema de clanes/grupos de estudio
- [ ] Chat entre usuarios

### Versión 3.0.0 - Q4 2025
- [ ] Soporte para más idiomas (FR, DE, PT)
- [ ] Realidad aumentada para vocabulario
- [ ] Integración con asistentes de voz (Siri, Google Assistant)
- [ ] App de escritorio (Electron)
- [ ] API pública para desarrolladores

---

## 📊 Estadísticas del Proyecto

### Líneas de Código
```
TypeScript:    ~8,500 líneas
JSON:          ~500 líneas
Markdown:      ~2,000 líneas
TOTAL:         ~11,000 líneas
```

### Componentes
```
Screens:       4
Components:    10
Services:      7
Contexts:      2
Hooks:         1
```

### Datos Incluidos
```
Palabras en diccionario:  800+
Verbos conjugados:        50+
Palabras de pronunciación: 60+
Tiempos verbales:         6
Idiomas soportados:       3
```

---

## 🤝 Contribuir

### Cómo Contribuir
1. Fork el repositorio
2. Crear branch de feature (`git checkout -b feature/nueva-feature`)
3. Commit cambios (`git commit -m 'Agregar nueva feature'`)
4. Push al branch (`git push origin feature/nueva-feature`)
5. Abrir Pull Request

### Guías de Estilo
- Usar TypeScript strict mode
- Seguir convenciones de React Native
- Documentar funciones complejas
- Escribir tests para nuevas features
- Mantener consistencia con código existente

---

## 📄 Licencia

Copyright © 2024 Mario24874
Todos los derechos reservados.

---

## 📞 Contacto

- **Desarrollador:** Mario24874
- **GitHub:** https://github.com/mario24874
- **Email:** (Agregar si deseas)

---

## 🙏 Agradecimientos

- **Claude Code (Anthropic):** Asistente de desarrollo IA
- **Expo Team:** Framework excelente para React Native
- **DeepL:** API de traducción de alta calidad
- **React Native Community:** Librerías y soporte
- **Comunidad de Stack Overflow:** Soluciones y apoyo

---

**Última actualización:** 2025-10-23
**Versión del documento:** 1.0.0

---

## 📚 Recursos Adicionales

### Documentación Relacionada
- [CHANGELOG.md](./CHANGELOG.md) - Registro de cambios detallado
- [README.md](./README.md) - Documentación de inicio rápido
- [NUEVAS_IMPLEMENTACIONES.md](./NUEVAS_IMPLEMENTACIONES.md) - Features v2.0

### Enlaces Útiles
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Docs](https://reactnative.dev/)
- [DeepL API Docs](https://www.deepl.com/docs-api)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

**🇮🇹 Buon apprendimento! 🚀**
