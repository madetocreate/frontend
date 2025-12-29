'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

export function ThemeProvider({ children, ...props }: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider 
      attribute="class" 
      defaultTheme="system" 
      enableSystem={true}
      value={{
        light: 'ak-theme-light',
        dark: 'ak-theme-dark'
      }}
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}

