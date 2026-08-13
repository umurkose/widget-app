"use client"

import * as React from "react"

import {
  applyPreferences,
  DEFAULT_PREFERENCES,
  normalizePreferences,
  PREFS_STORAGE_KEY,
  type Preferences,
} from "@/lib/preferences"

type PreferencesContextValue = {
  prefs: Preferences
  setPreference: <K extends keyof Preferences>(
    key: K,
    value: Preferences[K]
  ) => void
}

const PreferencesContext = React.createContext<PreferencesContextValue | null>(
  null
)

function readStoredPreferences(): Preferences {
  if (typeof window === "undefined") return DEFAULT_PREFERENCES
  try {
    return normalizePreferences(
      JSON.parse(localStorage.getItem(PREFS_STORAGE_KEY) ?? "{}")
    )
  } catch {
    return DEFAULT_PREFERENCES
  }
}

/**
 * Lives in the root layout so preferences survive route changes — mounting
 * this per page would reset every value on navigation and flash the defaults.
 * The stored values are read during the first client render (the blocking
 * script in the layout has already applied them to <html>), so nothing is
 * re-applied on hydration.
 */
export function PreferencesProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [prefs, setPrefs] = React.useState<Preferences>(readStoredPreferences)

  const setPreference = React.useCallback(
    <K extends keyof Preferences>(key: K, value: Preferences[K]) => {
      setPrefs((prev) => {
        const next = { ...prev, [key]: value }
        try {
          localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(next))
        } catch {
          // storage unavailable (private mode / quota) — keep the session value
        }
        return next
      })
    },
    []
  )

  React.useEffect(() => {
    applyPreferences(document.documentElement, prefs)
  }, [prefs])

  const value = React.useMemo(
    () => ({ prefs, setPreference }),
    [prefs, setPreference]
  )

  return (
    <PreferencesContext value={value}>{children}</PreferencesContext>
  )
}

export function usePreferences() {
  const context = React.use(PreferencesContext)
  if (!context) {
    throw new Error("usePreferences must be used within a PreferencesProvider")
  }
  return context
}
