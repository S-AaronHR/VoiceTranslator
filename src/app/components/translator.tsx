import { useState, useEffect, useRef } from "react";
import * as SpeechSDK from "microsoft-cognitiveservices-speech-sdk";
import { LanguageSelector } from "./language-selector";
import { ErrorNotification } from "./error-notification";
import { SpeechControls } from "./speech-controls";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Separator } from "./ui/separator";
import { FeatureCard } from "./feature-card";
import { useTranslation } from "../../hooks/useTranslation";
import { RoundTransferVerticalBold } from "solar-icon-set";

export function Translator() {
  const { languages, loading, error, translateWithDebounce, cancelPendingTranslation } = useTranslation();
  
  const [sourceLanguage, setSourceLanguage] = useState("auto-detect");
  const [isAutoDetectMode, setIsAutoDetectMode] = useState(true);
  const [targetLanguage, setTargetLanguage] = useState("en");
  const [sourceText, setSourceText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [isSourceRecording, setIsSourceRecording] = useState(false);
  const [isSourcePlaying, setIsSourcePlaying] = useState(false);
  const [isTargetPlaying, setIsTargetPlaying] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [detectedLanguage, setDetectedLanguage] = useState<string | null>(null);
  const translationRequestIdRef = useRef(0);
  const sourceRecognizerRef = useRef<SpeechSDK.SpeechRecognizer | null>(null);
  const activeSynthesizerRef = useRef<SpeechSDK.SpeechSynthesizer | null>(null);
  const speechTokenRef = useRef<{ token: string; region: string; expiresAt: number } | null>(null);
  const parsedMaxChars = Number(import.meta.env.VITE_MAX_INPUT_CHARS);
  const maxChars = Number.isFinite(parsedMaxChars) && parsedMaxChars > 0 ? parsedMaxChars : 5000;
  const speechTokenUrl =
    import.meta.env.VITE_AZURE_SPEECH_TOKEN_URL ||
    "http://localhost:3000/api/speech/token";

  const azureSpeechSupportedLanguages = new Set([
    "es",
    "en",
    "fr",
    "de",
    "it",
    "pt",
    "pt-pt",
    "zh",
    "zh-Hans",
    "zh-Hant",
    "ja",
    "ko",
    "ar",
    "ru",
    "hi",
    "tr",
    "nl",
    "pl",
    "cs",
    "fi",
    "sv",
    "da",
    "no",
    "th",
    "vi",
  ]);

  const speechLanguageMap: Record<string, string> = {
    "auto-detect": navigator.language || "es-MX",
    es: "es-MX",
    en: "en-US",
    fr: "fr-FR",
    de: "de-DE",
    it: "it-IT",
    pt: "pt-PT",
    "pt-pt": "pt-PT",
    zh: "zh-CN",
    "zh-Hans": "zh-CN",
    "zh-Hant": "zh-TW",
    ja: "ja-JP",
    ko: "ko-KR",
    ar: "ar-SA",
    ru: "ru-RU",
    hi: "hi-IN",
    tr: "tr-TR",
    nl: "nl-NL",
    pl: "pl-PL",
    cs: "cs-CZ",
    fi: "fi-FI",
    sv: "sv-SE",
    da: "da-DK",
    no: "nb-NO",
    th: "th-TH",
    vi: "vi-VN",
  };

  const getRecognitionLanguage = () => {
    if (!isAutoDetectMode) {
      return speechLanguageMap[sourceLanguage] || sourceLanguage;
    }

    if (detectedLanguage) {
      return speechLanguageMap[detectedLanguage] || detectedLanguage;
    }

    return speechLanguageMap["auto-detect"];
  };

  const getSpeechVoiceLanguage = (code: string) => {
    return speechLanguageMap[code] || code;
  };

  const getBrowserSpeechLanguage = (code: string) => {
    return speechLanguageMap[code] || navigator.language || "es-MX";
  };

  const isAzureSpeechLanguage = (code: string) => {
    const normalizedCode = code.toLowerCase();
    const baseCode = normalizedCode.split("-")[0];
    return azureSpeechSupportedLanguages.has(normalizedCode) || azureSpeechSupportedLanguages.has(baseCode);
  };

  const getSpeechCredentials = async () => {
    const now = Date.now();
    if (speechTokenRef.current && speechTokenRef.current.expiresAt > now + 30_000) {
      return speechTokenRef.current;
    }

    const response = await fetch(speechTokenUrl);
    const payload = await response.json();

    if (!response.ok || !payload?.success || !payload?.data?.token || !payload?.data?.region) {
      throw new Error(payload?.error || "No se pudo obtener token de Azure Speech");
    }

    const credentials = {
      token: payload.data.token,
      region: payload.data.region,
      expiresAt: now + (payload.data.expiresInSeconds || 540) * 1000,
    };

    speechTokenRef.current = credentials;
    return credentials;
  };

  const createSpeechConfig = async () => {
    const credentials = await getSpeechCredentials();
    return SpeechSDK.SpeechConfig.fromAuthorizationToken(credentials.token, credentials.region);
  };

  const stopAllSpeechPlayback = () => {
    if (activeSynthesizerRef.current) {
      activeSynthesizerRef.current.close();
      activeSynthesizerRef.current = null;
    }
    setIsSourcePlaying(false);
    setIsTargetPlaying(false);
  };

  const speakText = (
    text: string,
    languageCode: string,
    setPlayingState: (value: boolean) => void,
    stopPreviousState?: () => void,
  ) => {
    if (!text.trim()) {
      return;
    }

    stopAllSpeechPlayback();
    stopPreviousState?.();

    if (!isAzureSpeechLanguage(languageCode)) {
      if (!window.speechSynthesis) {
        console.error("El navegador no soporta síntesis de voz");
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = getBrowserSpeechLanguage(languageCode);

      utterance.onstart = () => setPlayingState(true);
      utterance.onend = () => setPlayingState(false);
      utterance.onerror = () => setPlayingState(false);

      const voices = window.speechSynthesis.getVoices();
      const selectedVoice =
        voices.find((voice) => voice.lang?.toLowerCase() === utterance.lang.toLowerCase()) ||
        voices.find((voice) => voice.lang?.toLowerCase().startsWith(utterance.lang.slice(0, 2).toLowerCase()));

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      window.speechSynthesis.speak(utterance);
      return;
    }

    void (async () => {
      try {
        const speechConfig = await createSpeechConfig();
        speechConfig.speechSynthesisLanguage = getSpeechVoiceLanguage(languageCode);
        speechConfig.speechSynthesisOutputFormat =
          SpeechSDK.SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3;

        const synthesizer = new SpeechSDK.SpeechSynthesizer(speechConfig);
        activeSynthesizerRef.current = synthesizer;
        setPlayingState(true);

        synthesizer.speakTextAsync(
          text,
          () => {
            setPlayingState(false);
            synthesizer.close();
            if (activeSynthesizerRef.current === synthesizer) {
              activeSynthesizerRef.current = null;
            }
          },
          (synthesisError) => {
            console.error("Error en síntesis Azure Speech:", synthesisError);
            setPlayingState(false);
            synthesizer.close();
            if (activeSynthesizerRef.current === synthesizer) {
              activeSynthesizerRef.current = null;
            }
          },
        );
      } catch (speechError) {
        console.error("Error configurando Azure Speech TTS:", speechError);
        setPlayingState(false);
      }
    })();
  };

  const resolveTargetLanguage = (source: string, target: string) => {
    if (!source || !target) {
      return target || "en";
    }

    return source === target ? "en" : target;
  };

  const isPendingAutoDetect = sourceLanguage === "auto-detect" && !detectedLanguage;

  // Cuando languages cargue, establecer el idioma de destino por defecto
  useEffect(() => {
    if (languages.length > 0 && targetLanguage === "en") {
      const enLanguage = languages.find((lang) => lang.code === "en");
      if (enLanguage) {
        setTargetLanguage("en");
      }
    }
  }, [languages]);

  // Prefetch del token de Azure Speech al montar el componente
  // Esto optimiza la primera petición al hacer click en "escuchar"
  useEffect(() => {
    getSpeechCredentials().catch((error) => {
      console.warn("Prefetch de token falló (se intentará de nuevo al usar voz):", error);
    });
  }, []);

  const handleSwapLanguages = async () => {
    if (isPendingAutoDetect) {
      return;
    }

    translationRequestIdRef.current += 1;
    cancelPendingTranslation();

    const nextSourceText = (translatedText || sourceText).trim();
    const nextSourceLanguage = targetLanguage;
    const nextTargetLanguage = isAutoDetectMode
      ? (detectedLanguage || sourceLanguage)
      : sourceLanguage;
    const safeTargetLanguage = resolveTargetLanguage(nextSourceLanguage, nextTargetLanguage);

    setSourceLanguage(nextSourceLanguage);
    setTargetLanguage(safeTargetLanguage);
    setDetectedLanguage(null);
    setIsAutoDetectMode(false);
    setSourceText(nextSourceText);
    setTranslatedText("");

    if (nextSourceText) {
      void handleTranslate(nextSourceText, nextSourceLanguage, false, safeTargetLanguage);
    }
  };

  const handleSourceLanguageChange = (value: string) => {
    translationRequestIdRef.current += 1;
    cancelPendingTranslation();

    const nextIsAutoDetectMode = value === "auto-detect";
    const safeTargetLanguage = resolveTargetLanguage(value, targetLanguage);
    setDetectedLanguage(null);
    setIsAutoDetectMode(nextIsAutoDetectMode);
    setSourceLanguage(value);
    setTargetLanguage(safeTargetLanguage);

    if (sourceText.trim()) {
      void handleTranslate(sourceText, value, nextIsAutoDetectMode, safeTargetLanguage);
    }
  };

  const handleTargetLanguageChange = (value: string) => {
    const safeTargetLanguage = resolveTargetLanguage(sourceLanguage, value);
    setTargetLanguage(safeTargetLanguage);

    if (sourceText.trim()) {
      void handleTranslate(sourceText, sourceLanguage, isAutoDetectMode, safeTargetLanguage);
    }
  };

  const handleRecord = () => {
    if (isSourceRecording && sourceRecognizerRef.current) {
      sourceRecognizerRef.current.close();
      sourceRecognizerRef.current = null;
      setIsSourceRecording(false);
      return;
    }

    cancelPendingTranslation();

    void (async () => {
      try {
        if (!isAzureSpeechLanguage(sourceLanguage) && !isAzureSpeechLanguage(detectedLanguage || sourceLanguage)) {
          const BrowserSpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

          if (!BrowserSpeechRecognition) {
            console.error("El navegador no soporta reconocimiento de voz");
            setIsSourceRecording(false);
            return;
          }

          const browserRecognition = new BrowserSpeechRecognition();
          browserRecognition.lang = getRecognitionLanguage();
          browserRecognition.interimResults = true;
          browserRecognition.continuous = false;
          browserRecognition.maxAlternatives = 1;

          sourceRecognizerRef.current = browserRecognition;
          setIsSourceRecording(true);

          browserRecognition.onresult = (event: any) => {
            const transcript = Array.from(event.results)
              .map((result: any) => result[0]?.transcript || "")
              .join("")
              .trim();

            if (transcript) {
              setSourceText(transcript);
              void handleTranslate(transcript);
            }
          };

          browserRecognition.onerror = (event: any) => {
            console.error("Error en reconocimiento del navegador:", event.error);
            setIsSourceRecording(false);
            sourceRecognizerRef.current = null;
          };

          browserRecognition.onend = () => {
            setIsSourceRecording(false);
            sourceRecognizerRef.current = null;
          };

          browserRecognition.start();
          return;
        }

        const speechConfig = await createSpeechConfig();
        speechConfig.speechRecognitionLanguage = getRecognitionLanguage();

        const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
        const recognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);
        sourceRecognizerRef.current = recognizer;
        setIsSourceRecording(true);

        recognizer.recognizeOnceAsync(
          (result) => {
            if (result.reason === SpeechSDK.ResultReason.RecognizedSpeech && result.text?.trim()) {
              const transcript = result.text.trim();
              setSourceText(transcript);
              void handleTranslate(transcript);
            }

            setIsSourceRecording(false);
            recognizer.close();
            if (sourceRecognizerRef.current === recognizer) {
              sourceRecognizerRef.current = null;
            }
          },
          (recognitionError) => {
            console.error("Error en reconocimiento Azure Speech:", recognitionError);
            setIsSourceRecording(false);
            recognizer.close();
            if (sourceRecognizerRef.current === recognizer) {
              sourceRecognizerRef.current = null;
            }
          },
        );
      } catch (speechError) {
        console.error("Error configurando Azure Speech STT:", speechError);
        setIsSourceRecording(false);
      }
    })();
  };

  const handlePlayAudio = () => {
    speakText(translatedText, targetLanguage, setIsTargetPlaying, () => setIsSourcePlaying(false));
  };

  const handlePlaySourceAudio = () => {
    const sourceVoiceLanguage = isAutoDetectMode && detectedLanguage ? detectedLanguage : sourceLanguage;
    speakText(sourceText, sourceVoiceLanguage, setIsSourcePlaying, () => setIsTargetPlaying(false));
  };

  const handleTranslate = async (
    text: string,
    sourceLanguageOverride?: string,
    autoDetectModeOverride?: boolean,
    targetLanguageOverride?: string
  ) => {
    const requestId = ++translationRequestIdRef.current;

    if (!text.trim()) {
      cancelPendingTranslation();
      setTranslatedText("");
      setDetectedLanguage(null);
      if (isAutoDetectMode || autoDetectModeOverride) {
        setSourceLanguage("auto-detect");
      }
      setIsTranslating(false);
      return;
    }

    try {
      setIsTranslating(true);
      const isAutoMode = autoDetectModeOverride ?? isAutoDetectMode;
      const toLanguage = targetLanguageOverride ?? targetLanguage;
      const fromLanguage = isAutoMode
        ? "auto-detect"
        : (sourceLanguageOverride ?? sourceLanguage);
      const result = await translateWithDebounce(text, fromLanguage, toLanguage);

      if (requestId !== translationRequestIdRef.current) {
        return;
      }
      
      if (result) {
        setTranslatedText(result.translatedText);
        
        // Si fue detección automática, guardar el idioma detectado
        if (isAutoMode && result.detectedLanguage) {
          setDetectedLanguage(result.detectedLanguage);
          setSourceLanguage(result.detectedLanguage);
          setTargetLanguage((currentTargetLanguage) => resolveTargetLanguage(result.detectedLanguage as string, currentTargetLanguage));
        } else {
          setDetectedLanguage(null);
        }
      }
    } catch (error) {
      if (requestId !== translationRequestIdRef.current) {
        return;
      }
      console.error("Error en la traducción:", error);
      // No mostrar el texto de error, solo evitar que se bloquee
      setTranslatedText("");
    } finally {
      if (requestId === translationRequestIdRef.current) {
        setIsTranslating(false);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (sourceRecognizerRef.current) {
        sourceRecognizerRef.current.close();
        sourceRecognizerRef.current = null;
      }

      if (activeSynthesizerRef.current) {
        activeSynthesizerRef.current.close();
        activeSynthesizerRef.current = null;
      }

      setIsSourcePlaying(false);
      setIsTargetPlaying(false);
      setIsSourceRecording(false);
    };
  }, []);

  // Obtener el nombre del idioma por su código
  const getLanguageName = (code: string) => {
    const lang = languages.find((l) => l.code === code);
    return lang?.nativeName || code;
  };

  const sourceSelectedLabel = isAutoDetectMode && detectedLanguage
    ? `${getLanguageName(detectedLanguage)} detectado`
    : undefined;

  return (
    <div className="flex h-full w-full flex-col items-center gap-6 p-4 py-6 md:gap-8 md:p-6 md:py-12">
      <div className="w-full max-w-5xl">
        <ErrorNotification error={error} />
        {/* Translation Panel */}
        <div
          className="animate-fade-in-up flex flex-col gap-0 overflow-hidden rounded-2xl border-2 border-border bg-card shadow-lg transition-shadow hover:shadow-xl md:flex-row"
          role="region"
          aria-label="Panel de traducción"
        >
          {/* Source Panel */}
          <div className="flex flex-1 flex-col" role="group" aria-label="Texto origen">
            <div className="border-b-2 border-border px-4 py-3 md:px-6">
              {loading ? (
                <div className="text-sm text-muted-foreground">Cargando idiomas...</div>
              ) : (
                <LanguageSelector
                  value={sourceLanguage}
                  onChange={handleSourceLanguageChange}
                  languages={languages}
                  disabled={isTranslating}
                  selectedLabel={sourceSelectedLabel}
                />
              )}
            </div>
            <div className="relative flex-1">
              <Textarea
                value={sourceText}
                onChange={(e) => {
                  const text = e.target.value;
                  if (text.length <= maxChars) {
                    setSourceText(text);
                    handleTranslate(text);
                  }
                }}
                placeholder="Escribe o habla para traducir..."
                className="min-h-[200px] resize-none border-0 bg-transparent px-4 py-4 text-base leading-relaxed focus-visible:ring-0 md:min-h-[300px] md:px-6"
                maxLength={maxChars}
                disabled={loading}
              />
              {sourceText.length > 0 && (
                <div
                  className={`absolute bottom-4 left-4 text-xs ${sourceText.length > maxChars * 0.9
                    ? "font-medium text-primary"
                    : "text-muted-foreground"
                    }`}
                >
                  {sourceText.length} / {maxChars}
                </div>
              )}
              <SpeechControls
                showRecord
                showPlay={Boolean(sourceText.trim())}
                isRecording={isSourceRecording}
                isPlaying={isSourcePlaying}
                onRecord={handleRecord}
                onPlay={handlePlaySourceAudio}
                disabled={isTranslating || loading}
                recordLabel="Grabar voz"
                playLabel="Escuchar entrada"
              />
            </div>
          </div>

          {/* Swap Button */}
          <div className="relative flex items-center justify-center md:flex-col">
            <div className="absolute left-0 top-0 hidden h-full w-px bg-border md:block" />
            <div className="absolute left-0 top-0 h-px w-full bg-border md:hidden" />
            <Button
              size="icon"
              variant="ghost"
              onClick={handleSwapLanguages}
              className="m-3 rounded-full border-2 border-transparent text-muted-foreground transition-transform hover:rotate-180 hover:border-primary hover:bg-primary/5 hover:text-primary md:m-2"
              title="Intercambiar idiomas"
              disabled={isTranslating || loading || isPendingAutoDetect}
            >
              <RoundTransferVerticalBold size={20} className="md:rotate-0" />
            </Button>
            <div className="absolute right-0 top-0 hidden h-full w-px bg-border md:block" />
            <div className="absolute bottom-0 left-0 h-px w-full bg-border md:hidden" />
          </div>

          {/* Target Panel */}
          <div className="flex flex-1 flex-col bg-muted/50" role="group" aria-label="Texto traducido">
            <div className="border-b-2 border-border px-4 py-3 md:px-6">
              {loading ? (
                <div className="text-sm text-muted-foreground">Cargando idiomas...</div>
              ) : (
                <LanguageSelector
                  value={targetLanguage}
                  onChange={handleTargetLanguageChange}
                  languages={languages}
                  disabled={isTranslating}
                />
              )}
            </div>
            <div className="relative flex-1">
              <div className="min-h-[200px] px-4 py-4 md:min-h-[300px] md:px-6">
                {isTranslating ? (
                  <p className="text-base leading-relaxed text-muted-foreground animate-pulse">
                    Traduciendo...
                  </p>
                ) : (
                  <p className="text-base leading-relaxed text-foreground/90">
                    {translatedText || (
                      <span className="text-muted-foreground">
                        La traducción aparecerá aquí...
                      </span>
                    )}
                  </p>
                )}
              </div>
              {translatedText.trim() ? (
                <SpeechControls
                  isPlaying={isTargetPlaying}
                  onPlay={handlePlayAudio}
                  disabled={isTranslating || loading}
                  playLabel="Reproducir traducción"
                />
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
