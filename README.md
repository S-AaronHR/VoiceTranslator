# Voice Translator

Una aplicación web moderna de traducción de voz e texto con diseño minimalista y soporte para temas claro/oscuro.

## Características

- 🎤 **Entrada de Voz**: Reconocimiento de voz utilizando Web Speech API
- 🔊 **Audio de Salida**: Síntesis de voz para escuchar traducciones
- 🌐 **Múltiples Idiomas**: Soporte para más de 10 idiomas
- 🎨 **Temas**: Modo claro, oscuro y sistema
- 📱 **Responsive**: Diseño adaptado para móvil y escritorio
- ⚡ **Rápido**: Interfaz fluida y moderna

## Tecnologías

- React 18.3
- Tailwind CSS 4.1
- Radix UI (shadcn/ui components)
- Solar Icon Set
- next-themes (gestión de temas)

## Estructura del Proyecto

```
src/
├── app/
│   ├── components/
│   │   ├── theme-provider.tsx    # Proveedor de temas
│   │   ├── header.tsx            # Cabecera con toggle de tema
│   │   ├── translator.tsx        # Componente principal de traducción
│   │   ├── language-selector.tsx # Selector de idiomas
│   │   ├── feature-card.tsx      # Tarjeta de características
│   │   └── ui/                   # Componentes shadcn/ui
│   └── App.tsx                   # Componente raíz
└── styles/
    ├── index.css                 # Estilos globales y animaciones
    ├── theme.css                 # Variables de tema
    └── fonts.css                 # Fuentes

```

## Próximos Pasos - Implementación de APIs

### 1. Reconocimiento de Voz (Web Speech API)

Para implementar el reconocimiento de voz, actualiza el método `handleRecord` en `translator.tsx`:

\`\`\`typescript
const handleRecord = () => {
  if (!isRecording) {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = sourceLanguage;
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setSourceText(transcript);
      handleTranslate();
    };

    recognition.start();
    setIsRecording(true);

    recognition.onend = () => {
      setIsRecording(false);
    };
  }
};
\`\`\`

### 2. Síntesis de Voz (Web Speech API)

Para implementar la reproducción de audio, actualiza el método `handlePlayAudio` en `translator.tsx`:

\`\`\`typescript
const handlePlayAudio = () => {
  const utterance = new SpeechSynthesisUtterance(translatedText);
  utterance.lang = targetLanguage;
  utterance.rate = 0.9;
  
  utterance.onstart = () => setIsPlaying(true);
  utterance.onend = () => setIsPlaying(false);
  
  window.speechSynthesis.speak(utterance);
};
\`\`\`

### 3. API de Traducción

Puedes integrar servicios como:

#### Google Cloud Translation API
\`\`\`typescript
const handleTranslate = async () => {
  const response = await fetch('https://translation.googleapis.com/language/translate/v2', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      q: sourceText,
      source: sourceLanguage,
      target: targetLanguage,
      key: 'YOUR_API_KEY'
    })
  });
  
  const data = await response.json();
  setTranslatedText(data.data.translations[0].translatedText);
};
\`\`\`

#### Azure Translator
\`\`\`typescript
const handleTranslate = async () => {
  const response = await fetch(
    \`https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&from=\${sourceLanguage}&to=\${targetLanguage}\`,
    {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': 'YOUR_SUBSCRIPTION_KEY',
        'Ocp-Apim-Subscription-Region': 'YOUR_REGION',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([{ text: sourceText }])
    }
  );
  
  const data = await response.json();
  setTranslatedText(data[0].translations[0].text);
};
\`\`\`

## Paleta de Colores

### Tema Claro
- **Primary** (botones, bordes, iconos): #1e3a8a (Azul Marino)
- **Background**: #ffffff (Blanco)
- **Card**: #ffffff (Blanco)
- **Muted**: #f8fafc (Gris muy claro)
- **Foreground**: #0f172a (Texto oscuro)

### Tema Oscuro
- **Primary** (botones, bordes, iconos): #3b82f6 (Azul)
- **Background**: #0a0e1a (Azul oscuro profundo)
- **Card**: #111827 (Gris oscuro)
- **Muted**: #1e293b (Gris medio oscuro)
- **Foreground**: #f1f5f9 (Texto claro)

**Nota**: El azul marino/azul se utiliza exclusivamente como color de acento en:
- Botones primarios y estados activos
- Bordes de elementos interactivos (hover, focus)
- Iconos destacados
- Logo y elementos de marca
- NO se usa en fondos principales

## Desarrollo

La aplicación utiliza Vite como bundler y se ejecuta automáticamente en el entorno de desarrollo.

## Licencia

MIT
