'use client'

import { createContext, useContext, useMemo, useState, ReactNode } from 'react'
import { de } from './de'

type Language = 'de'

const dictionaries: Record<Language, typeof de> = {
  de
}

type I18nContextValue = {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string) => string
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('de')

  const value = useMemo<I18nContextValue>(() => {
    const dict = dictionaries[language]
    const t = (key: string): string => {
      const parts = key.split('.')
      let current: any = dict
      for (const part of parts) {
        if (!current || typeof current !== 'object' || !(part in current)) {
          return key
        }
        current = current[part]
      }
      if (typeof current === 'string') {
        return current
      }
      return key
    }
    return { language, setLanguage, t }
  }, [language])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext)
  if (!ctx) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return ctx
}
