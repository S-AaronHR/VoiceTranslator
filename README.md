# 🎙️ Voice Translator — Frontend

> Aplicación web de traducción de voz en tiempo real que permite traducir texto y voz entre más de 130 idiomas con una interfaz moderna, accesible y responsive.

## 🧩 Problema que resuelve

La comunicación entre personas que hablan diferentes idiomas es una barrera constante en contextos educativos, laborales y sociales. Las herramientas de traducción existentes a menudo requieren múltiples pasos manuales, no integran entrada/salida de voz en una sola interfaz, o carecen de una experiencia de usuario fluida e intuitiva.

**Voice Translator** resuelve este problema al ofrecer una aplicación todo-en-uno donde el usuario puede **escribir o hablar** en un idioma y obtener la traducción **escrita y hablada** al instante, sin necesidad de cambiar entre aplicaciones o copiar texto manualmente.

## 🎯 Objetivo principal

Desarrollar una aplicación web moderna de traducción que integre **texto y voz** en una interfaz única, permitiendo a los usuarios comunicarse de forma instantánea entre **130+ idiomas** usando tecnologías de Azure Cognitive Services (Translator, Speech-to-Text y Text-to-Speech) con una experiencia de usuario premium, accesible y responsive.

---

## 📑 Tabla de contenido

- [Problema que resuelve](#-problema-que-resuelve)
- [Objetivo principal](#-objetivo-principal)
- [Stack tecnológico](#-stack-tecnológico)
- [Arquitectura del proyecto](#-arquitectura-del-proyecto)
- [Guía de instalación](#-guía-de-instalación)
- [Instrucciones de uso](#-instrucciones-de-uso)
- [Funcionalidades](#-funcionalidades)
- [Componentes principales](#-componentes-principales)
- [Idiomas soportados para voz](#-idiomas-soportados-para-voz)
- [Despliegue](#-despliegue)
- [Integrantes](#-integrantes)

---

## 🛠️ Stack tecnológico

| Tecnología | Versión | Uso |
|---|---|---|
| **React** | 18.3 | Biblioteca de UI |
| **TypeScript** | — | Tipado estático |
| **Vite** | 6.3 | Build tool y dev server |
| **Tailwind CSS** | 4.1 | Framework de estilos utilitario |
| **Radix UI** | — | Componentes accesibles headless |
| **shadcn/ui** | — | Sistema de componentes basado en Radix |
| **Azure Speech SDK** | 1.49 | Reconocimiento y síntesis de voz |
| **Solar Icon Set** | 2.0 | Iconografía principal |
| **Lucide React** | 0.487 | Iconos complementarios |
| **next-themes** | 0.4 | Gestión de temas claro/oscuro/sistema |
| **Motion** | 12.23 | Animaciones fluidas |

---

## 📁 Arquitectura del proyecto

```
./
├── index.html                        # HTML base de la SPA
├── vite.config.ts                    # Configuración de Vite + plugins
├── netlify.toml                      # Configuración de deploy en Netlify
├── package.json
├── tsconfig.json
└── src/
    ├── main.tsx                      # Punto de entrada de React
    ├── vite-env.d.ts                 # Declaraciones de tipos (Web Speech API)
    ├── styles/
    │   ├── fonts.css                 # Fuentes tipográficas
    │   ├── tailwind.css              # Configuración de Tailwind CSS
    │   ├── theme.css                 # Variables CSS del tema (claro/oscuro)
    │   └── index.css                 # Estilos globales y animaciones
    ├── hooks/
    │   └── useTranslation.ts         # Hook: API de traducción con debounce
    └── app/
        ├── App.tsx                   # Componente raíz con ThemeProvider
        └── components/
            ├── translator.tsx        # Componente principal de traducción
            ├── header.tsx            # Header con logo y selector de tema
            ├── language-selector.tsx  # Dropdown de selección de idioma
            ├── speech-controls.tsx    # Botones de grabar/reproducir audio
            ├── error-notification.tsx # Notificación de errores temporizada
            ├── feature-card.tsx      # Tarjeta de características
            ├── theme-provider.tsx    # Proveedor de contexto de tema
            └── ui/                   # 48 componentes base (shadcn/ui)
```

---

## 📦 Guía de instalación

### Requisitos previos

- **Node.js** >= 18
- **npm** >= 9
- El backend de Voice Translator corriendo localmente o desplegado

### Pasos

```bash
# 1. Clonar el repositorio
git clone <url-del-repositorio>

# 2. Instalar dependencias
npm install

# 3. Crear el archivo de variables de entorno
#    (o crear .env manualmente — ver sección siguiente)
```

### Variables de entorno

Crear un archivo `.env` en la raíz del proyecto:

```env
# === API Backend ===
VITE_TRANSLATION_API_BASE_URL=http://localhost:3000/api/translation
VITE_AZURE_SPEECH_TOKEN_URL=http://localhost:3000/api/speech/token

# === Configuración ===
VITE_TRANSLATION_DEBOUNCE_MS=500    # Delay antes de traducir (en ms)
VITE_MAX_INPUT_CHARS=5000           # Límite de caracteres del texto de entrada
```

| Variable | Default | Descripción |
|---|---|---|
| `VITE_TRANSLATION_API_BASE_URL` | `http://localhost:3000/api/translation` | URL base de la API de traducción |
| `VITE_AZURE_SPEECH_TOKEN_URL` | `http://localhost:3000/api/speech/token` | URL del endpoint de token de Speech |
| `VITE_TRANSLATION_DEBOUNCE_MS` | `500` | Milisegundos de espera antes de enviar la traducción |
| `VITE_MAX_INPUT_CHARS` | `5000` | Máximo de caracteres permitidos en el campo de entrada |

---

## 🚀 Instrucciones de uso

```bash
# Desarrollo (con hot-reload)
npm run dev

# Build de producción
npm run build
```

El servidor de desarrollo estará disponible en `http://localhost:5173`.

### ¿Cómo usar la aplicación?

1. **Escribe** texto en el panel izquierdo o **haz clic en el micrófono** 🎙️ para dictar
2. La traducción aparece **automáticamente** en el panel derecho conforme escribes
3. **Selecciona idiomas** con los dropdowns superiores de cada panel
4. Haz clic en el **botón de audio** 🔊 para escuchar la traducción o el texto original
5. Usa el **botón de intercambio** ⇅ para invertir los idiomas con un clic
6. Cambia entre **tema claro, oscuro o automático** con el botón del header

---

## ⚡ Funcionalidades

### Traducción
- ✅ Traducción de texto en tiempo real con **debounce configurable**
- ✅ **Detección automática de idioma** con indicador visual ("Español detectado")
- ✅ **130+ idiomas** disponibles desde Azure Translator
- ✅ **Intercambio de idiomas** (swap) con un clic
- ✅ Contador de caracteres con advertencia visual al acercarse al límite

### Voz
- ✅ **Speech-to-Text** — Dicta tu texto con el micrófono
  - Azure Speech SDK para 23+ idiomas con alta calidad
  - Web Speech API del navegador como fallback para otros idiomas
- ✅ **Text-to-Speech** — Escucha la traducción o el texto original
  - Azure Speech SDK con voces neurales de alta calidad
  - Web Speech API del navegador como fallback
- ✅ **Protección anti-spam** — Los botones de audio se bloquean durante la carga con animación de spinner
- ✅ **Prefetch de tokens** — El token de Azure Speech se obtiene al cargar la página

### Interfaz
- ✅ **Tema adaptable** — Claro, oscuro o automático según el sistema
- ✅ **Responsive** — Optimizado para móvil y escritorio
- ✅ **Accesibilidad** — Roles ARIA, labels descriptivos, navegación por teclado
- ✅ **Animaciones** — Transiciones suaves, fade-in, spinner de carga
- ✅ **Notificaciones de error** — Alertas temporales con auto-dismiss

---

## 🧱 Componentes principales

### `Translator`
El componente central que orquesta toda la funcionalidad:
- Gestiona el estado de idiomas, texto, grabación y reproducción
- Coordina las llamadas a la API de traducción con debounce
- Maneja Azure Speech SDK con fallback a Web Speech API
- Implementa prefetch y caché de tokens para rendimiento

### `useTranslation` (Hook)
Hook personalizado que encapsula la comunicación con el backend:
- `languages` — Lista de idiomas disponibles
- `translateWithDebounce()` — Traduce con delay configurable
- `cancelPendingTranslation()` — Cancela traducciones pendientes (AbortController)
- `swapLanguages()` — Intercambia idiomas y re-traduce

### `SpeechControls`
Botones de micrófono y reproducción con 4 estados visuales:
- **Idle** — Estado por defecto con hover interactivo
- **Loading** — Spinner animado mientras se prepara el audio (bloqueado)
- **Playing/Recording** — Estilo activo con color primario
- **Disabled** — Bloqueado durante traducciones

### `LanguageSelector`
Dropdown accesible con badges de abreviación del idioma (ES, EN, FR...) y soporte para label customizado ("Español detectado").

### `Header`
Barra superior sticky con logo, título y selector de tema (claro/oscuro/sistema) con tooltips.

---

## 🗣️ Idiomas soportados para voz

Azure Speech SDK soporta síntesis y reconocimiento de voz de alta calidad para los siguientes idiomas. Para los demás, se utiliza la Web Speech API del navegador como fallback.

| Idioma | Código | | Idioma | Código |
|---|---|---|---|---|
| Español | `es` | | Polaco | `pl` |
| Inglés | `en` | | Checo | `cs` |
| Francés | `fr` | | Finés | `fi` |
| Alemán | `de` | | Sueco | `sv` |
| Italiano | `it` | | Danés | `da` |
| Portugués | `pt` | | Noruego | `no` |
| Chino (Simplificado) | `zh-Hans` | | Tailandés | `th` |
| Chino (Tradicional) | `zh-Hant` | | Vietnamita | `vi` |
| Japonés | `ja` | | Árabe | `ar` |
| Coreano | `ko` | | Ruso | `ru` |
| Hindi | `hi` | | Turco | `tr` |
| Neerlandés | `nl` | | | |

---

## 🌍 Despliegue

El frontend está configurado para desplegarse en **Netlify**:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Pasos para Netlify:

1. Conectar el repositorio en Netlify
2. Configurar las variables de entorno en el panel:
   ```
   VITE_TRANSLATION_API_BASE_URL=https://tu-backend.onrender.com/api/translation
   VITE_AZURE_SPEECH_TOKEN_URL=https://tu-backend.onrender.com/api/speech/token
   ```
3. El build se ejecuta automáticamente al hacer push

---

## 👥 Integrantes

| Nombre | GitHub |
|---|---|
| Aaron Hernandez | [GitHub](https://github.com/S-AaronHR) |
| Miguel Mejia | [GitHub](https://github.com/AngelMejiaUAQ) |
| Omar Martinez | [GitHub](https://github.com/OmarAguilar43) |
| Mateo Perez | [GitHub](https://github.com/MateoPerez117) |
| Lizeth Mejia | [GitHub](https://github.com/tanial4) |
