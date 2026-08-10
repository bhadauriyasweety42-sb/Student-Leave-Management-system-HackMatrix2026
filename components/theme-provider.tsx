'use client'

import * as React from 'react'
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes'
import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => setMounted(true), [])

  if (!mounted) return null

  const current = resolvedTheme || theme

  return (
    <button
      onClick={() => setTheme(current === 'dark' ? 'light' : 'dark')}
      aria-label="Toggle theme"
      className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 dark:bg-[var(--color-sidebar)]/80 border border-border text-sm shadow-sm backdrop-blur"
    >
      {current === 'dark' ? (
        <>
          <Sun className="w-4 h-4 text-yellow-400" />
          <span className="hidden sm:inline">Light</span>
        </>
      ) : (
        <>
          <Moon className="w-4 h-4 text-blue-600" />
          <span className="hidden sm:inline">Dark</span>
        </>
      )}
    </button>
  )
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="light" enableSystem={false} {...props}>
      {children}
    </NextThemesProvider>
  )
}
