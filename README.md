# 🇮🇹 ItaliantoApp - Aprende Italiano de Forma Interactiva

<div align="center">

![Version](https://img.shields.io/badge/version-1.2.0-blue.svg)
![Platform](https://img.shields.io/badge/platform-Android-green.svg)
![React Native](https://img.shields.io/badge/React%20Native-0.73.6-61DAFB.svg)
![Expo](https://img.shields.io/badge/Expo-50.0.20-000020.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.1.3-3178C6.svg)
![License](https://img.shields.io/badge/license-Proprietary-red.svg)

**Una aplicación móvil completa para aprender italiano con IA, reconocimiento de voz y traducción automática.**

[Características](#-características) •
[Instalación](#-instalación) •
[Uso](#-uso) •
[Documentación](#-documentación) •
[Roadmap](#-roadmap)

</div>

---

## 📱 Sobre ItaliantoApp

ItaliantoApp es una herramienta integral de aprendizaje de italiano diseñada para hablantes de español e inglés. Combina tecnologías de IA, reconocimiento de voz y traducción automática para ofrecer una experiencia de aprendizaje interactiva y efectiva.

### 🎯 ¿Por qué ItaliantoApp?

- ✅ **Traducción Bidireccional:** ES/EN ↔ IT con API DeepL
- ✅ **Conjugador Completo:** 50+ verbos, 6 tiempos verbales
- ✅ **Práctica de Pronunciación:** Feedback objetivo en tiempo real
- ✅ **Gamificación:** Racha de días, estadísticas, logros
- ✅ **100% Offline Ready:** Diccionario local de 800+ palabras
- ✅ **UI/UX Moderna:** Tema claro/oscuro, animaciones suaves

---

## ⭐ Características

### 🌍 Traductor Bidireccional
- Soporta: Español ↔ Italiano, Inglés ↔ Italiano
- Diccionario local (800+ palabras) + DeepL API
- Historial y favoritos
- Sugerencias inteligentes
- Botón de intercambio de idiomas

### 📖 Conjugador de Verbos
- 50+ verbos italianos comunes
- 6 tiempos verbales principales
- Audio de pronunciación para cada conjugación
- Modo de práctica interactivo

### 🎤 Práctica de Pronunciación
- Reconocimiento de voz en italiano
- Algoritmo de evaluación objetivo y estricto
- Puntaje de precisión (0-100%)
- 60+ palabras de práctica
- Feedback educativo:
  - **95-100%:** Excellent (pronunciación casi perfecta)
  - **75-94%:** Good (errores menores)
  - **<75%:** Try Again (necesita mejorar)

### 🎨 Experiencia de Usuario
- Splash screen animado
- Onboarding interactivo (4 pantallas)
- Tema claro/oscuro adaptativo
- Sistema de notificaciones toast
- Estadísticas detalladas de progreso

---

## 🚀 Instalación

### Prerrequisitos
```bash
Node.js >= 16.x
npm >= 8.x
Expo CLI
```

### Pasos de Instalación

```bash
# 1. Clonar el repositorio
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

# 6. Ejecutar en iOS (Mac only)
npm run ios
```

### Variables de Entorno

Crear archivo `.env` en la raíz del proyecto:

```bash
DEEPL_API_KEY=tu-api-key-aqui
API_TIMEOUT=5000
```

> **Nota:** Obtén tu API key gratuita en [DeepL API](https://www.deepl.com/pro-api)

---

## 📖 Uso

### Para Usuarios

1. **Traducir:**
   - Ve a la pestaña "Traduttore"
   - Selecciona idiomas (origen y destino)
   - Escribe el texto y toca "Traduci"
   - Usa 🔄 para intercambiar idiomas

2. **Conjugar Verbos:**
   - Ve a "Coniugatore"
   - Selecciona un verbo y tiempo verbal
   - Escucha la pronunciación con 🔊

3. **Practicar Pronunciación:**
   - Ve a "Pronuncia"
   - Elige modo (Casuale o Scegli)
   - Toca 🎤 para grabar tu pronunciación
   - Recibe feedback instantáneo

### Para Desarrolladores

```typescript
// Agregar palabra al diccionario
// src/services/translationService.ts
private static spanishDictionary: Record<string, string[]> = {
  'nueva': ['nuovo', 'nuova'],
  // ...
};

// Agregar verbo
// src/services/conjugationService.ts
private static verbs: Record<string, VerbConjugations> = {
  'parlare': {
    presente: { io: 'parlo', tu: 'parli', /* ... */ },
    // ...
  }
};
```

---

## 🛠️ Tecnologías

### Stack Principal
- **Frontend:** React Native + Expo
- **Lenguaje:** TypeScript
- **Navegación:** React Navigation
- **Estado:** Context API
- **Storage:** AsyncStorage

### APIs y Servicios
- **DeepL API:** Traducción automática
- **Google Voice Recognition:** Reconocimiento de voz
- **expo-speech:** Text-to-Speech

### Librerías Clave
```json
{
  "@react-native-voice/voice": "^3.2.4",
  "expo-speech": "~11.7.0",
  "@react-navigation/bottom-tabs": "^6.5.11",
  "axios": "^1.6.7"
}
```

---

## 📁 Estructura del Proyecto

```
ItaliantoApp/
├── src/
│   ├── components/         # Componentes reutilizables
│   ├── context/           # Context API (Theme, Toast)
│   ├── hooks/             # Custom hooks
│   ├── screens/           # Pantallas principales (4)
│   ├── services/          # Lógica de negocio (7 servicios)
│   ├── types/             # TypeScript types
│   └── utils/             # Utilidades
├── assets/                # Imágenes y recursos
├── .env.example          # Ejemplo de variables de entorno
├── app.config.js         # Configuración de Expo
├── CHANGELOG.md          # Registro de cambios
├── PROYECTO_COMPLETO.md  # Documentación completa
└── package.json          # Dependencias
```

---

## 🧪 Scripts Disponibles

```bash
# Desarrollo
npm start                  # Iniciar Expo Dev Server
npm run android           # Ejecutar en Android
npm run ios              # Ejecutar en iOS

# Testing
npm run type-check       # Verificar tipos TypeScript
npm run lint            # Ejecutar ESLint

# Build
npm run build:apk       # Generar APK para testing
npx eas build --platform android --profile preview
```

---

## 📊 Estadísticas

- **Líneas de código:** ~11,000
- **Componentes:** 10
- **Pantallas:** 4
- **Servicios:** 7
- **Palabras en diccionario:** 800+
- **Verbos conjugados:** 50+
- **Palabras de pronunciación:** 60+

---

## 🗺️ Roadmap

### Versión 1.3.0 (Próxima)
- [ ] Modo offline completo
- [ ] Exportar progreso a PDF
- [ ] Compartir traducciones
- [ ] Widgets de Android

### Versión 2.0.0 (Q2 2025)
- [ ] **Tutor AI Personalizado** 🤖
  - Conversaciones con IA
  - Corrección gramatical en tiempo real
  - Ejercicios personalizados
- [ ] Lecciones estructuradas (A1-C2)
- [ ] Tests de nivel

### Versión 3.0.0 (Q4 2025)
- [ ] Más idiomas (FR, DE, PT)
- [ ] Modo multijugador
- [ ] Realidad aumentada
- [ ] App de escritorio

---

## 📝 Changelog

### v1.2.0 (2025-10-23) - Correcciones Críticas

**✅ Traducción Bidireccional IT→ES/EN:**
- Integración completa de DeepL API
- Soporte para traducciones IT→ES, IT→EN
- Diccionarios inversos automáticos

**✅ Algoritmo de Pronunciación Estricto:**
- Eliminadas bonificaciones automáticas
- Nuevos umbrales: Excellent (95%+), Good (75-94%)
- Ponderación equilibrada 50% literal + 50% fonética

**✅ Reproducción de Audio Mejorada:**
- Manejo robusto de errores
- Configuración optimizada para italiano
- Feedback al usuario

Ver [CHANGELOG.md](./CHANGELOG.md) para historial completo.

---

## 📚 Documentación

- **[PROYECTO_COMPLETO.md](./PROYECTO_COMPLETO.md)** - Documentación técnica completa
- **[CHANGELOG.md](./CHANGELOG.md)** - Registro detallado de cambios
- **[NUEVAS_IMPLEMENTACIONES.md](./NUEVAS_IMPLEMENTACIONES.md)** - Features v2.0

---

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-feature`)
3. Commit tus cambios (`git commit -m 'Agregar nueva feature'`)
4. Push a la rama (`git push origin feature/nueva-feature`)
5. Abre un Pull Request

### Guías de Estilo
- TypeScript strict mode
- Convenciones de React Native
- Documentar funciones complejas
- Tests para nuevas features

---

## 🐛 Reportar Bugs

Si encuentras un bug, por favor abre un issue en GitHub con:
- Descripción detallada del problema
- Pasos para reproducir
- Versión de la app
- Dispositivo y OS
- Screenshots (si aplica)

---

## 📄 Licencia

Copyright © 2024 Mario24874. Todos los derechos reservados.

Este proyecto es de código propietario. No está permitido copiar, distribuir o modificar este software sin permiso explícito del autor.

---

## 👨‍💻 Autor

**Mario24874**
- GitHub: [@mario24874](https://github.com/mario24874)
- Proyecto: [ItaliantoApp](https://github.com/mario24874/italiantoapp)

---

## 🙏 Agradecimientos

- **Claude Code (Anthropic)** - Asistente de desarrollo IA
- **Expo Team** - Framework excelente
- **DeepL** - API de traducción de alta calidad
- **React Native Community** - Librerías y soporte

---

## 📞 Soporte

¿Necesitas ayuda?
- 📧 Abre un issue en GitHub
- 📖 Lee la [documentación completa](./PROYECTO_COMPLETO.md)
- 💬 Consulta el [changelog](./CHANGELOG.md)

---

<div align="center">

**🇮🇹 Buon apprendimento! 🚀**

Hecho con ❤️ y Claude Code

[⬆ Volver arriba](#-italiantoapp---aprende-italiano-de-forma-interactiva)

</div>
