import { useState, useEffect, useRef } from 'react';

const API_BASE_URL =
  import.meta.env.VITE_TRANSLATION_API_BASE_URL ||
  'http://localhost:3000/api/translation';
const parsedDebounce = Number(import.meta.env.VITE_TRANSLATION_DEBOUNCE_MS);
const DEFAULT_TRANSLATION_DEBOUNCE_MS =
  Number.isFinite(parsedDebounce) && parsedDebounce > 0 ? parsedDebounce : 500;

export interface Language {
  code: string;
  name: string;
  nativeName: string;
}

export interface TranslationResult {
  translatedText: string;
  detectedLanguage?: string;
}

export const useTranslation = () => {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeControllerRef = useRef<AbortController | null>(null);

  const cancelPendingTranslation = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    if (activeControllerRef.current) {
      activeControllerRef.current.abort();
      activeControllerRef.current = null;
    }
  };

  // Obtener idiomas disponibles al montar el componente
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/languages`);
        const data = await response.json();
        
        if (data.success) {
          setLanguages(data.languages);
        } else {
          setError(data.error);
        }
      } catch (err) {
        setError('Error al obtener los idiomas disponibles');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLanguages();

    return () => {
      cancelPendingTranslation();
    };
  }, []);

  /**
   * Traducir texto
   * @param text - Texto a traducir
   * @param fromLanguage - Código del idioma de origen
   * @param toLanguage - Código del idioma destino
   * @returns Resultado de la traducción
   */
  const translate = async (
    text: string,
    fromLanguage = 'auto-detect',
    toLanguage = 'en',
  ): Promise<TranslationResult | null> => {
    const controller = new AbortController();
    activeControllerRef.current = controller;

    try {
      setError(null);

      const response = await fetch(`${API_BASE_URL}/translate`, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text,
          fromLanguage,
          toLanguage
        })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Error desconocido en la traducción');
      }

      return data.data;
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        return null;
      }
      const message = err instanceof Error ? err.message : 'Error desconocido';
      console.error('Error en traducción:', message);
      setError(message);
      throw err;
    } finally {
      if (activeControllerRef.current === controller) {
        activeControllerRef.current = null;
      }
    }
  };

  /**
   * Traducir con debounce para optimizar llamadas
   */
  const translateWithDebounce = async (
    text: string,
    fromLanguage = 'auto-detect',
    toLanguage = 'en',
    delay = DEFAULT_TRANSLATION_DEBOUNCE_MS,
  ): Promise<TranslationResult | null> => {
    return new Promise((resolve, reject) => {
      // Cancelar timeout anterior si existe
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Si el texto está vacío, resolver inmediatamente
      if (!text.trim()) {
        resolve(null);
        return;
      }

      // Esperar antes de hacer la request
      debounceTimerRef.current = setTimeout(async () => {
        try {
          const result = await translate(text, fromLanguage, toLanguage);
          resolve(result);
        } catch (err) {
          reject(err);
        }
      }, delay);
    });
  };

  /**
   * Intercambiar idiomas y traducir
   * @param text - Texto actual
   * @param currentFrom - Idioma actual de origen
   * @param currentTo - Idioma actual destino
   * @returns Resultado del intercambio
   */
  const swapLanguages = async (text: string, currentFrom: string, currentTo: string) => {
    try {
      setError(null);

      const response = await fetch(`${API_BASE_URL}/swap`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text,
          currentFrom,
          currentTo
        })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Error desconocido al intercambiar idiomas');
      }

      return data.data;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      console.error('Error al intercambiar idiomas:', message);
      setError(message);
      throw err;
    }
  };

  return {
    languages,
    loading,
    error,
    translate,
    translateWithDebounce,
    cancelPendingTranslation,
    swapLanguages
  };
};
