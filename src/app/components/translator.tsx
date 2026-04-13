import { useState } from "react";
import { LanguageSelector } from "./language-selector";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Separator } from "./ui/separator";
import { FeatureCard } from "./feature-card";
import {
  MicrophoneBold,
  VolumeLoudBold,
  RoundTransferVerticalBold,
  RoundGraphBold,
} from "solar-icon-set";

export function Translator() {
  const [sourceLanguage, setSourceLanguage] = useState("es");
  const [targetLanguage, setTargetLanguage] = useState("en");
  const [sourceText, setSourceText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const maxChars = 5000;

  const handleSwapLanguages = () => {
    setSourceLanguage(targetLanguage);
    setTargetLanguage(sourceLanguage);
    setSourceText(translatedText);
    setTranslatedText(sourceText);
  };

  const handleRecord = () => {
    setIsRecording(!isRecording);
    // TODO: Implementar Web Speech API para reconocimiento de voz
    if (!isRecording) {
      console.log("Iniciando grabación...");
    } else {
      console.log("Deteniendo grabación...");
    }
  };

  const handlePlayAudio = () => {
    setIsPlaying(true);
    // TODO: Implementar Web Speech API para síntesis de voz
    console.log("Reproduciendo audio...");
    setTimeout(() => setIsPlaying(false), 2000);
  };

  const handleTranslate = () => {
    // TODO: Implementar llamada a API de traducción
    // Simulación de traducción
    if (sourceText.trim()) {
      const mockTranslations: Record<string, Record<string, string>> = {
        es: {
          en: "Hello, this is a mock translation",
          fr: "Bonjour, c'est une traduction simulée",
        },
        en: {
          es: "Hola, esta es una traducción simulada",
          fr: "Bonjour, c'est une traduction simulée",
        },
      };

      const translation =
        mockTranslations[sourceLanguage]?.[targetLanguage] ||
        `[Translation from ${sourceLanguage} to ${targetLanguage}]: ${sourceText}`;

      setTranslatedText(translation);
    }
  };

  return (
    <div className="flex h-full w-full flex-col items-center gap-6 p-4 py-6 md:gap-8 md:p-6 md:py-12">
      <div className="w-full max-w-5xl">
        {/* Translation Panel */}
        <div
          className="animate-fade-in-up flex flex-col gap-0 overflow-hidden rounded-2xl border-2 border-border bg-card shadow-lg transition-shadow hover:shadow-xl md:flex-row"
          role="region"
          aria-label="Panel de traducción"
        >
          {/* Source Panel */}
          <div className="flex flex-1 flex-col" role="group" aria-label="Texto origen">
            <div className="border-b-2 border-border px-4 py-3 md:px-6">
              <LanguageSelector
                value={sourceLanguage}
                onChange={setSourceLanguage}
              />
            </div>
            <div className="relative flex-1">
              <Textarea
                value={sourceText}
                onChange={(e) => {
                  const text = e.target.value;
                  if (text.length <= maxChars) {
                    setSourceText(text);
                    if (text.trim()) {
                      handleTranslate();
                    } else {
                      setTranslatedText("");
                    }
                  }
                }}
                placeholder="Escribe o habla para traducir..."
                className="min-h-[200px] resize-none border-0 bg-transparent px-4 py-4 text-base leading-relaxed focus-visible:ring-0 md:min-h-[300px] md:px-6"
                maxLength={maxChars}
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
              <div className="absolute bottom-4 right-4 flex gap-2">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleRecord}
                  className={
                    isRecording
                      ? "animate-pulse border-2 border-primary bg-primary text-primary-foreground hover:bg-primary/90"
                      : "border-2 border-transparent text-muted-foreground hover:border-primary hover:bg-primary/5 hover:text-primary"
                  }
                  title="Grabar voz"
                >
                  <MicrophoneBold size={20} />
                </Button>
              </div>
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
            >
              <RoundTransferVerticalBold size={20} className="md:rotate-0" />
            </Button>
            <div className="absolute right-0 top-0 hidden h-full w-px bg-border md:block" />
            <div className="absolute bottom-0 left-0 h-px w-full bg-border md:hidden" />
          </div>

          {/* Target Panel */}
          <div className="flex flex-1 flex-col bg-muted/50" role="group" aria-label="Texto traducido">
            <div className="border-b-2 border-border px-4 py-3 md:px-6">
              <LanguageSelector
                value={targetLanguage}
                onChange={setTargetLanguage}
              />
            </div>
            <div className="relative flex-1">
              <div className="min-h-[200px] px-4 py-4 md:min-h-[300px] md:px-6">
                <p className="text-base leading-relaxed text-foreground/90">
                  {translatedText || (
                    <span className="text-muted-foreground">
                      La traducción aparecerá aquí...
                    </span>
                  )}
                </p>
              </div>
              {translatedText && (
                <div className="absolute bottom-4 right-4 flex gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handlePlayAudio}
                    className={
                      isPlaying
                        ? "border-2 border-primary bg-primary text-primary-foreground hover:bg-primary/90"
                        : "border-2 border-transparent text-muted-foreground hover:border-primary hover:bg-primary/5 hover:text-primary"
                    }
                    title="Reproducir audio"
                  >
                    <VolumeLoudBold size={20} />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
