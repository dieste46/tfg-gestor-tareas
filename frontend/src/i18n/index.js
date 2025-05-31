// src/i18n/index.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Importar traducciones
import es from './es.json';
import en from './en.json';

// Configuración de i18n
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      es: { translation: es },
      en: { translation: en }
    },
    
    // Idioma por defecto
    fallbackLng: 'es',
    
    // Detectar idioma del navegador
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage']
    },
    
    // Opciones de interpolación
    interpolation: {
      escapeValue: false
    },
    
    // Debug solo en desarrollo
    debug: process.env.NODE_ENV === 'development'
  });

export default i18n;