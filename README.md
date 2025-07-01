# ItaliantoApp

App per l'apprendimento della lingua italiana con traduttore, coniugatore di verbi e pratica di pronuncia.

## Caratteristiche

- **Traduttore**: Traduce testo da spagnolo o inglese all'italiano
- **Coniugatore di Verbi**: Coniuga verbi italiani in diversi tempi verbali
- **Pratica di Pronuncia**: Usa il riconoscimento vocale per praticare la pronuncia italiana

## Requisiti

- Node.js 16 o superiore
- npm o yarn
- Android Studio (per l'emulatore Android)
- Expo CLI
- EAS CLI (per generare APK)

## Installazione

1. Clona il repository
2. Installa le dipendenze:
```bash
npm install
```

## Eseguire l'App

### Nel browser web
```bash
npm start
# Premi 'w' per aprire nel browser
```

### Nell'emulatore Android

1. Apri Android Studio
2. Avvia un emulatore Android (AVD Manager)
3. Esegui:
```bash
npm run android
```

### Sul dispositivo fisico Android

1. Installa l'app Expo Go sul tuo dispositivo
2. Esegui:
```bash
npm start
```
3. Scansiona il codice QR con l'app Expo Go

## Generare APK

### Configurazione iniziale

1. Crea un account su https://expo.dev
2. Accedi con EAS CLI:
```bash
eas login
```

3. Configura il progetto:
```bash
eas build:configure
```

### Generare APK per distribuzione

Per generare un APK che puoi caricare sul tuo sito web:

```bash
npm run build:apk
```

Oppure:

```bash
eas build --platform android --profile preview
```

Il processo di build richiederà alcuni minuti. Una volta completato, riceverai un link per scaricare l'APK.

### Build locale (senza EAS)

Se preferisci generare l'APK localmente:

1. Esegui eject da Expo (attenzione: questo è irreversibile):
```bash
expo eject
```

2. Segui le istruzioni per Android:
```bash
cd android
./gradlew assembleRelease
```

L'APK sarà in `android/app/build/outputs/apk/release/`

## Configurazione API

Per utilizzare la traduzione con una vera API, modifica il file `src/services/translationService.ts` e inserisci la tua API key di Google Translate.

## Struttura del Progetto

```
src/
├── components/       # Componenti riutilizzabili
├── screens/         # Schermate dell'app
├── services/        # Servizi (traduzione, coniugazione, pronuncia)
├── i18n/           # Internazionalizzazione
├── types/          # Tipi TypeScript
└── constants/      # Costanti dell'app
```

## Note per lo Sviluppo

- L'app è configurata per essere in italiano di default
- Il riconoscimento vocale richiede permessi del microfono
- Per testare la pronuncia, è necessario un dispositivo fisico o un emulatore con supporto audio

## Troubleshooting

### L'emulatore non si avvia
- Assicurati che Android Studio sia installato correttamente
- Verifica che la virtualizzazione sia abilitata nel BIOS
- Prova a creare un nuovo AVD

### Errori di build
- Pulisci la cache:
```bash
expo start -c
```

### Problemi con il riconoscimento vocale
- Verifica i permessi del microfono
- Su emulatore, potrebbe non funzionare correttamente

## Licenza

Proprietà di ItaliantoApp - Tutti i diritti riservati