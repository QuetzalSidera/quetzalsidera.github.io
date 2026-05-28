'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'

type ThemeMode = 'light' | 'dark' | 'system'
type EffectiveTheme = 'light' | 'dark'
export type BannerMessageType = 'info' | 'warn' | 'error'

export type BannerMessage = {
  id: string
  type: BannerMessageType
  text: string
}

type PushBannerMessageInput = {
  id?: string
  type?: BannerMessageType
  text: string
  duration?: number
}

type BlogRuntimeContextValue = {
  themeMode: ThemeMode
  effectiveTheme: EffectiveTheme
  setThemeMode: (theme: ThemeMode) => void
  searchDialogOpen: boolean
  openSearchDialog: () => void
  closeSearchDialog: () => void
  fireworksEnabled: boolean
  setFireworksEnabled: (enabled: boolean) => void
  spinePlayerEnabled: boolean
  setSpinePlayerEnabled: (enabled: boolean) => void
  splashLoading: boolean
  setSplashLoading: (loading: boolean) => void
  bannerMessages: BannerMessage[]
  pushBannerMessage: (message: PushBannerMessageInput) => string
  removeBannerMessage: (id: string) => void
}

const BlogRuntimeContext = createContext<BlogRuntimeContextValue | null>(null)

function getSystemTheme(): EffectiveTheme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function getInitialEffectiveTheme(): EffectiveTheme {
  if (typeof document === 'undefined') {
    return 'light'
  }

  return document.documentElement.getAttribute('theme') === 'dark' ? 'dark' : 'light'
}

function readBooleanStorage(key: string, fallback: boolean) {
  const value = window.localStorage.getItem(key)
  return value === null ? fallback : JSON.parse(value)
}

export function BlogRuntimeProvider({ children }: { children: ReactNode }) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system')
  const [effectiveTheme, setEffectiveTheme] = useState<EffectiveTheme>(getInitialEffectiveTheme)
  const [searchDialogOpen, setSearchDialogOpen] = useState(false)
  const [fireworksEnabled, setFireworksEnabledState] = useState(false)
  const [spinePlayerEnabled, setSpinePlayerEnabledState] = useState(false)
  const [splashLoading, setSplashLoading] = useState(true)
  const [bannerMessages, setBannerMessages] = useState<BannerMessage[]>([])
  const bannerTimers = useRef(new Map<string, number>())

  useEffect(() => {
    const storedTheme = window.localStorage.getItem('darkMode') as ThemeMode | null
    const initialTheme = storedTheme ?? 'system'
    setThemeModeState(initialTheme)
    setFireworksEnabledState(readBooleanStorage('fireworksEnabled', false))
    setSpinePlayerEnabledState(readBooleanStorage('spinePlayerEnabled', false))
  }, [])

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')

    function applyTheme() {
      const nextTheme = themeMode === 'system' ? getSystemTheme() : themeMode
      document.documentElement.setAttribute('theme', nextTheme)
      setEffectiveTheme(nextTheme)
    }

    applyTheme()
    if (themeMode === 'system') {
      media.addEventListener('change', applyTheme)
      return () => media.removeEventListener('change', applyTheme)
    }

    return undefined
  }, [themeMode])

  const setThemeMode = useCallback((theme: ThemeMode) => {
    setThemeModeState(theme)
    window.localStorage.setItem('darkMode', theme)
  }, [])

  const setFireworksEnabled = useCallback((enabled: boolean) => {
    setFireworksEnabledState(enabled)
    window.localStorage.setItem('fireworksEnabled', JSON.stringify(enabled))
  }, [])

  const setSpinePlayerEnabled = useCallback((enabled: boolean) => {
    setSpinePlayerEnabledState(enabled)
    window.localStorage.setItem('spinePlayerEnabled', JSON.stringify(enabled))
  }, [])

  const removeBannerMessage = useCallback((id: string) => {
    const timer = bannerTimers.current.get(id)
    if (timer) {
      window.clearTimeout(timer)
      bannerTimers.current.delete(id)
    }

    setBannerMessages((current) => current.filter((message) => message.id !== id))
  }, [])

  const pushBannerMessage = useCallback(
    ({ id, text, type = 'info', duration = 2800 }: PushBannerMessageInput) => {
      const messageId =
        id ?? `banner-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`

      setBannerMessages((current) => {
        const nextMessage: BannerMessage = { id: messageId, text, type }
        const withoutSameId = current.filter((message) => message.id !== messageId)
        return [...withoutSameId, nextMessage].slice(-4)
      })

      const existingTimer = bannerTimers.current.get(messageId)
      if (existingTimer) {
        window.clearTimeout(existingTimer)
        bannerTimers.current.delete(messageId)
      }

      if (duration > 0) {
        const timer = window.setTimeout(() => {
          removeBannerMessage(messageId)
        }, duration)
        bannerTimers.current.set(messageId, timer)
      }

      return messageId
    },
    [removeBannerMessage],
  )

  useEffect(
    () => () => {
      for (const timer of bannerTimers.current.values()) {
        window.clearTimeout(timer)
      }
      bannerTimers.current.clear()
    },
    [],
  )

  const value = useMemo<BlogRuntimeContextValue>(
    () => ({
      themeMode,
      effectiveTheme,
      setThemeMode,
      searchDialogOpen,
      openSearchDialog: () => setSearchDialogOpen(true),
      closeSearchDialog: () => setSearchDialogOpen(false),
      fireworksEnabled,
      setFireworksEnabled,
      spinePlayerEnabled,
      setSpinePlayerEnabled,
      splashLoading,
      setSplashLoading,
      bannerMessages,
      pushBannerMessage,
      removeBannerMessage,
    }),
    [
      bannerMessages,
      effectiveTheme,
      fireworksEnabled,
      pushBannerMessage,
      removeBannerMessage,
      searchDialogOpen,
      setFireworksEnabled,
      setSpinePlayerEnabled,
      setThemeMode,
      spinePlayerEnabled,
      splashLoading,
      themeMode,
    ],
  )

  return <BlogRuntimeContext.Provider value={value}>{children}</BlogRuntimeContext.Provider>
}

export function useBlogRuntime() {
  const context = useContext(BlogRuntimeContext)
  if (!context) {
    throw new Error('useBlogRuntime must be used inside BlogRuntimeProvider')
  }
  return context
}
