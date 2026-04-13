# Guía de Implementación - Voice Translator

## Implementar Reconocimiento de Voz

### 1. Agregar tipos TypeScript

Primero, agrega los tipos para la Web Speech API creando un archivo `src/types/speech.d.ts`:

\`\`\`typescript
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onaudioend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onaudiostart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onnomatch: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onsoundend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onsoundstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  abort(): void;
  start(): void;
  stop(): void;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

declare var SpeechRecognition: {
  prototype: SpeechRecognition;
  new(): SpeechRecognition;
};

declare var webkitSpeechRecognition: {
  prototype: SpeechRecognition;
  new(): SpeechRecognition;
};

interface Window {
  SpeechRecognition: typeof SpeechRecognition;
  webkitSpeechRecognition: typeof SpeechRecognition;
}
\`\`\`

### 2. Actualizar el componente Translator

En `src/app/components/translator.tsx`, reemplaza el método `handleRecord`:

\`\`\`typescript
const handleRecord = () => {
  if (!isRecording) {
    try {
      const SpeechRecognitionAPI = 
        window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (!SpeechRecognitionAPI) {
        alert('Tu navegador no soporta reconocimiento de voz');
        return;
      }

      const recognition = new SpeechRecognitionAPI();
      recognition.lang = sourceLanguage === 'en' ? 'en-US' : 
                        sourceLanguage === 'es' ? 'es-ES' :
                        sourceLanguage === 'fr' ? 'fr-FR' :
                        sourceLanguage === 'de' ? 'de-DE' :
                        sourceLanguage === 'it' ? 'it-IT' :
                        sourceLanguage === 'pt' ? 'pt-PT' :
                        sourceLanguage === 'zh' ? 'zh-CN' :
                        sourceLanguage === 'ja' ? 'ja-JP' :
                        sourceLanguage === 'ko' ? 'ko-KR' :
                        sourceLanguage === 'ar' ? 'ar-SA' : 'en-US';
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setSourceText(transcript);
        handleTranslate();
      };

      recognition.onerror = (event) => {
        console.error('Error de reconocimiento:', event.error);
        setIsRecording(false);
        
        if (event.error === 'not-allowed') {
          alert('Permiso de micrófono denegado');
        } else if (event.error === 'no-speech') {
          alert('No se detectó voz');
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
    } catch (error) {
      console.error('Error iniciando reconocimiento:', error);
      setIsRecording(false);
    }
  } else {
    setIsRecording(false);
  }
};
\`\`\`

### 3. Implementar Síntesis de Voz

Reemplaza el método `handlePlayAudio`:

\`\`\`typescript
const handlePlayAudio = () => {
  if (!translatedText) return;

  // Cancelar cualquier síntesis en curso
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(translatedText);
  
  // Configurar el idioma
  utterance.lang = targetLanguage === 'en' ? 'en-US' :
                  targetLanguage === 'es' ? 'es-ES' :
                  targetLanguage === 'fr' ? 'fr-FR' :
                  targetLanguage === 'de' ? 'de-DE' :
                  targetLanguage === 'it' ? 'it-IT' :
                  targetLanguage === 'pt' ? 'pt-PT' :
                  targetLanguage === 'zh' ? 'zh-CN' :
                  targetLanguage === 'ja' ? 'ja-JP' :
                  targetLanguage === 'ko' ? 'ko-KR' :
                  targetLanguage === 'ar' ? 'ar-SA' : 'en-US';
  
  utterance.rate = 0.9;
  utterance.pitch = 1;
  utterance.volume = 1;

  utterance.onstart = () => {
    setIsPlaying(true);
  };

  utterance.onend = () => {
    setIsPlaying(false);
  };

  utterance.onerror = (event) => {
    console.error('Error de síntesis:', event);
    setIsPlaying(false);
  };

  window.speechSynthesis.speak(utterance);
};
\`\`\`

## Implementar API de Traducción

### Opción 1: Google Cloud Translation API

1. Instala el cliente HTTP:
\`\`\`bash
pnpm add axios
\`\`\`

2. Crea un archivo `.env.local`:
\`\`\`
VITE_GOOGLE_TRANSLATE_API_KEY=tu_api_key_aqui
\`\`\`

3. Actualiza `handleTranslate`:
\`\`\`typescript
import axios from 'axios';

const handleTranslate = async () => {
  if (!sourceText.trim()) {
    setTranslatedText('');
    return;
  }

  try {
    const response = await axios.post(
      'https://translation.googleapis.com/language/translate/v2',
      {
        q: sourceText,
        source: sourceLanguage,
        target: targetLanguage,
        key: import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY
      }
    );

    setTranslatedText(response.data.data.translations[0].translatedText);
  } catch (error) {
    console.error('Error traduciendo:', error);
    setTranslatedText('Error al traducir. Por favor, intenta de nuevo.');
  }
};
\`\`\`

### Opción 2: LibreTranslate (Gratis y Open Source)

1. Instala el cliente HTTP:
\`\`\`bash
pnpm add axios
\`\`\`

2. Actualiza `handleTranslate`:
\`\`\`typescript
import axios from 'axios';

const handleTranslate = async () => {
  if (!sourceText.trim()) {
    setTranslatedText('');
    return;
  }

  try {
    const response = await axios.post(
      'https://libretranslate.de/translate',
      {
        q: sourceText,
        source: sourceLanguage,
        target: targetLanguage,
        format: 'text'
      }
    );

    setTranslatedText(response.data.translatedText);
  } catch (error) {
    console.error('Error traduciendo:', error);
    setTranslatedText('Error al traducir. Por favor, intenta de nuevo.');
  }
};
\`\`\`

### Opción 3: Azure Translator

1. Instala el cliente HTTP:
\`\`\`bash
pnpm add axios
\`\`\`

2. Crea un archivo `.env.local`:
\`\`\`
VITE_AZURE_TRANSLATOR_KEY=tu_subscription_key
VITE_AZURE_TRANSLATOR_REGION=tu_region
\`\`\`

3. Actualiza `handleTranslate`:
\`\`\`typescript
import axios from 'axios';

const handleTranslate = async () => {
  if (!sourceText.trim()) {
    setTranslatedText('');
    return;
  }

  try {
    const response = await axios.post(
      \`https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&from=\${sourceLanguage}&to=\${targetLanguage}\`,
      [{ text: sourceText }],
      {
        headers: {
          'Ocp-Apim-Subscription-Key': import.meta.env.VITE_AZURE_TRANSLATOR_KEY,
          'Ocp-Apim-Subscription-Region': import.meta.env.VITE_AZURE_TRANSLATOR_REGION,
          'Content-Type': 'application/json'
        }
      }
    );

    setTranslatedText(response.data[0].translations[0].text);
  } catch (error) {
    console.error('Error traduciendo:', error);
    setTranslatedText('Error al traducir. Por favor, intenta de nuevo.');
  }
};
\`\`\`

## Mejoras Adicionales

### Agregar Debouncing

Para evitar traducciones excesivas mientras el usuario escribe:

\`\`\`typescript
import { useState, useEffect, useCallback } from 'react';

// Dentro del componente
const [debouncedText, setDebouncedText] = useState(sourceText);

useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedText(sourceText);
  }, 500);

  return () => {
    clearTimeout(timer);
  };
}, [sourceText]);

useEffect(() => {
  if (debouncedText.trim()) {
    handleTranslate();
  } else {
    setTranslatedText('');
  }
}, [debouncedText]);
\`\`\`

### Guardar Historial de Traducciones

\`\`\`typescript
const [history, setHistory] = useState<Array<{
  source: string;
  target: string;
  sourceLang: string;
  targetLang: string;
  timestamp: Date;
}>>([]);

// Al traducir
const saveToHistory = () => {
  setHistory(prev => [
    {
      source: sourceText,
      target: translatedText,
      sourceLang: sourceLanguage,
      targetLang: targetLanguage,
      timestamp: new Date()
    },
    ...prev.slice(0, 9) // Mantener solo las últimas 10
  ]);
};
\`\`\`

## Consideraciones de Rendimiento

1. **Limitar caracteres**: Ya implementado con `maxChars = 5000`
2. **Cancelar traducciones en curso**: Usar AbortController
3. **Caché de traducciones**: Guardar traducciones recientes
4. **Modo offline**: Detectar y notificar cuando no hay conexión

## Compatibilidad de Navegadores

- **Web Speech API**: Chrome, Edge, Safari (iOS 14.5+)
- **Speech Synthesis**: Todos los navegadores modernos
- **Recomendación**: Agregar detección de características y mensajes de fallback
