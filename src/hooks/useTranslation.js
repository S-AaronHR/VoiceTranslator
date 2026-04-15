import { useState, useEffect, useRef } from 'react';

const API_BASE_URL =
  import.meta.env.VITE_TRANSLATION_API_BASE_URL ||
  'http://localhost:3000/api/translation';
const parsedDebounce = Number(import.meta.env.VITE_TRANSLATION_DEBOUNCE_MS);
const DEFAULT_TRANSLATION_DEBOUNCE_MS =
  Number.isFinite(parsedDebounce) && parsedDebounce > 0 ? parsedDebounce : 500;

export const useTranslation = () => {
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const debounceTimerRef = useRef(null);
  const activeControllerRef = useRef(null);

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
   * @param {string} text - Texto a traducir
   * @param {string} fromLanguage - Código del idioma de origen
   * @param {string} toLanguage - Código del idioma destino
   * @returns {Promise} Resultado de la traducción
   */
  const translate = async (text, fromLanguage = 'auto-detect', toLanguage = 'en') => {
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
    } catch (err) {
      if (err.name === 'AbortError') {
        return null;
      }
      console.error('Error en traducción:', err.message);
      setError(err.message);
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
    text,
    fromLanguage = 'auto-detect',
    toLanguage = 'en',
    delay = DEFAULT_TRANSLATION_DEBOUNCE_MS,
  ) => {
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
   * @param {string} text - Texto actual
   * @param {string} currentFrom - Idioma actual de origen
   * @param {string} currentTo - Idioma actual destino
   * @returns {Promise} Resultado del intercambio
   */
  const swapLanguages = async (text, currentFrom, currentTo) => {
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
    } catch (err) {
      console.error('Error al intercambiar idiomas:', err.message);
      setError(err.message);
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
