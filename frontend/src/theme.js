// The site's colour theme: 'dark' (the default) or 'light'.
//
// The choice is stored on <html data-theme="..."> (CSS reads it from there) and in
// localStorage (so it is remembered). index.html applies the saved choice before the
// page first paints, so there is no flash of the wrong theme.

const STORAGE_KEY = 'portfolio-theme'
const THEME_COLORS = { dark: '#0b0b0e', light: '#f3f1ec' } // the browser UI colour on phones

const listeners = new Set()

export function getTheme() {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'
}

export function setTheme(theme) {
  const root = document.documentElement
  root.dataset.theme = theme
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLORS[theme])

  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    // storage blocked (private mode): the choice simply isn't remembered
  }

  listeners.forEach((listener) => listener())
}

// For useSyncExternalStore: lets components re-render when the theme changes.
export function subscribe(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
