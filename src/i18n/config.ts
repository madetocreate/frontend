"use client";

/**
 * i18n Configuration
 * Setup for react-i18next
 */

import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import de from './locales/de.json'
import en from './locales/en.json'
import es from './locales/es.json'
import fr from './locales/fr.json'
import it from './locales/it.json'

const resources = {
  de: { translation: de },
  en: { translation: en },
  es: { translation: es },
  fr: { translation: fr },
  it: { translation: it }
}

// Load language from localStorage or use browser language, fallback to 'de'
const getInitialLanguage = (): string => {
  if (typeof window === 'undefined') return 'de'
  
  const stored = localStorage.getItem('language')
  if (stored && ['de', 'en', 'es', 'fr', 'it'].includes(stored)) {
    return stored
  }
  
  // Try browser language
  const browserLang = navigator.language.split('-')[0]
  if (['de', 'en', 'es', 'fr', 'it'].includes(browserLang)) {
    return browserLang
  }
  
  return 'de'
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getInitialLanguage(),
    fallbackLng: {
      'fr': ['en', 'de'],
      'it': ['en', 'de'],
      'es': ['en', 'de'],
      'en': ['de'],
      'de': ['en'],
      'default': ['en', 'de']
    },
    interpolation: {
      escapeValue: false // React already escapes values
    },
    react: {
      useSuspense: false
    }
  })

export default i18n
