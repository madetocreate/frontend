'use client'

import { ReactNode } from 'react'
import { I18nProvider } from '@/i18n/I18nContext'

export function Providers({ children }: { children: ReactNode }) {
  return <I18nProvider>{children}</I18nProvider>
}
