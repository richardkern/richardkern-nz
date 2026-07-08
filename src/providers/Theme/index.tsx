'use client'

import { useCallback, useSyncExternalStore } from 'react'

export type Theme = 'light' | 'dark' | 'auto'

const STORAGE_KEY = 'theme'

/** Runs before paint (injected in the root layout <head>). Applies the stored
 *  choice to <html> so the first paint is already correct — no flash. */
export const themeInitScript = `(function(){try{var t=localStorage.getItem('${STORAGE_KEY}');if(t==='dark'||t==='light'){document.documentElement.setAttribute('data-theme',t);}}catch(e){}})();`

// The DOM attribute (set by the inline script) is the source of truth; a small
// listener registry lets React subscribe via useSyncExternalStore, so there is
// no setState-in-effect and no hydration mismatch (server always reads 'auto').
const listeners = new Set<() => void>()

const readTheme = (): Theme => {
  const attr = document.documentElement.getAttribute('data-theme')
  return attr === 'dark' || attr === 'light' ? attr : 'auto'
}

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

const setThemeAttr = (theme: Theme) => {
  const root = document.documentElement
  try {
    if (theme === 'auto') {
      root.removeAttribute('data-theme')
      localStorage.removeItem(STORAGE_KEY)
    } else {
      root.setAttribute('data-theme', theme)
      localStorage.setItem(STORAGE_KEY, theme)
    }
  } catch {
    // Private mode / storage disabled: still apply the attribute for this session.
    if (theme === 'auto') root.removeAttribute('data-theme')
    else root.setAttribute('data-theme', theme)
  }
  listeners.forEach((l) => l())
}

export const useTheme = () => {
  const theme = useSyncExternalStore(
    subscribe,
    readTheme,
    () => 'auto' as Theme,
  )
  const setTheme = useCallback((next: Theme) => setThemeAttr(next), [])
  return { theme, setTheme }
}
