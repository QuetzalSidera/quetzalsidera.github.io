import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import { Footer } from '@/components/layout/Footer'
import { Navbar } from '@/components/layout/Navbar'
import { BlogRuntimeProvider } from '@/components/runtime/BlogRuntime'
import { RuntimeShell } from '@/components/runtime/RuntimeShell'
import { siteMeta } from '@/lib/site'
import 'normalize.css'
import '@fontsource/jetbrains-mono'
import 'katex/dist/katex.min.css'
import '@/styles/icons.css'
import '@/styles/globals.scss'

export const metadata: Metadata = {
  metadataBase: new URL(siteMeta.hostname),
  title: {
    default: siteMeta.title,
    template: `%s | ${siteMeta.title}`,
  },
  description: siteMeta.description,
  applicationName: siteMeta.title,
  authors: [{ name: siteMeta.author, url: siteMeta.hostname }],
  creator: siteMeta.author,
  publisher: siteMeta.author,
  keywords: [...siteMeta.defaultKeywords],
  robots: 'index, follow',
  icons: {
    icon: '/favicon.webp',
    shortcut: '/favicon.webp',
  },
  openGraph: {
    type: 'website',
    title: siteMeta.title,
    description: siteMeta.description,
    url: siteMeta.hostname,
    siteName: siteMeta.title,
    locale: siteMeta.lang.replace('-', '_'),
    images: [{ url: siteMeta.defaultOgImage, alt: siteMeta.title }],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteMeta.title,
    description: siteMeta.description,
    images: [{ url: siteMeta.defaultOgImage, alt: siteMeta.title }],
  },
  other: {
    'google-adsense-account': 'ca-pub-3737797471305738',
  },
}

export const viewport: Viewport = {
  themeColor: siteMeta.themeColor,
}

const themeInitializer = `
(() => {
  try {
    const storedTheme = window.localStorage.getItem('darkMode') || 'system'
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    const theme = storedTheme === 'system' ? systemTheme : storedTheme
    document.documentElement.setAttribute('theme', theme === 'dark' ? 'dark' : 'light')
  } catch {
    document.documentElement.setAttribute('theme', 'light')
  }
})()
`

const devRuntimeRecoveryScript = `
(() => {
  const targetMessage = "Cannot read properties of undefined (reading 'call')"
  const recoveryKey = 'blog-dev-webpack-recovery'
  const skipSplashKey = 'blog-dev-skip-splash-once'
  const skipPageMotionKey = 'blog-dev-skip-page-motion-once'
  const skipSplashStyleId = 'blog-dev-skip-splash-style'
  const skipPageMotionStyleId = 'blog-dev-skip-page-motion-style'
  const recoveryWindowMs = 8000
  const maxRecoveries = 3

  try {
    if (window.sessionStorage.getItem(skipSplashKey) === '1') {
      document.documentElement.setAttribute('data-skip-dev-splash', '1')
      const style = document.createElement('style')
      style.id = skipSplashStyleId
      style.textContent = "html[data-skip-dev-splash='1'] [class*='splashContainer']{display:none!important}"
      document.head.appendChild(style)
    }

    if (window.sessionStorage.getItem(skipPageMotionKey) === '1') {
      window.sessionStorage.removeItem(skipPageMotionKey)
      document.documentElement.setAttribute('data-skip-dev-page-motion', '1')
      const style = document.createElement('style')
      style.id = skipPageMotionStyleId
      style.textContent = [
        "html[data-skip-dev-page-motion='1'] body main",
        "html[data-skip-dev-page-motion='1'] [class*='PostViewer_postViewer']",
        "html[data-skip-dev-page-motion='1'] [class*='PostViewer_viewBox']",
        "html[data-skip-dev-page-motion='1'] [class*='PostViewer_content']",
      ].join(',') +
        "{animation:none!important;transition:none!important;opacity:1!important;filter:none!important;transform:none!important}"
      document.head.appendChild(style)
    }
  } catch {
    // sessionStorage may be blocked; keeping the normal Splash is the safe fallback.
  }

  function isWebpackRuntimeRace(message, stack, source) {
    return (
      message.includes(targetMessage) &&
      (
        source.includes('/_next/static/chunks/webpack.js') ||
        stack.includes('webpack.js') ||
        stack.includes('__webpack_require__') ||
        stack.includes('options.factory')
      )
    )
  }

  function readRecoveryState() {
    try {
      return JSON.parse(window.sessionStorage.getItem(recoveryKey) || 'null') || {}
    } catch {
      return {}
    }
  }

  function writeRecoveryState(startedAt, count) {
    try {
      window.sessionStorage.setItem(recoveryKey, JSON.stringify({ startedAt, count }))
    } catch {
      // sessionStorage may be blocked; the reload recovery can still proceed.
    }
  }

  function requestReload(event) {
    event.preventDefault()
    event.stopImmediatePropagation()

    const now = Date.now()
    const state = readRecoveryState()
    const startedAt = typeof state.startedAt === 'number' ? state.startedAt : now
    const count = now - startedAt < recoveryWindowMs && typeof state.count === 'number' ? state.count : 0
    if (count >= maxRecoveries) {
      return
    }

    writeRecoveryState(count === 0 ? now : startedAt, count + 1)
    try {
      window.sessionStorage.setItem(skipSplashKey, '1')
      window.sessionStorage.setItem(skipPageMotionKey, '1')
    } catch {}
    window.setTimeout(() => window.location.reload(), 60)
  }

  window.addEventListener(
    'error',
    (event) => {
      const message = String(event.message || event.error?.message || '')
      const stack = String(event.error?.stack || '')
      const source = String(event.filename || '')
      if (isWebpackRuntimeRace(message, stack, source)) {
        requestReload(event)
      }
    },
    true,
  )

  window.addEventListener(
    'unhandledrejection',
    (event) => {
      const reason = event.reason || {}
      const message = String(reason.message || reason || '')
      const stack = String(reason.stack || '')
      if (isWebpackRuntimeRace(message, stack, '')) {
        requestReload(event)
      }
    },
    true,
  )

  window.addEventListener(
    'load',
    () => {
      window.setTimeout(() => {
        try {
          window.sessionStorage.removeItem(recoveryKey)
        } catch {}
      }, recoveryWindowMs)
    },
    { once: true },
  )
})()
`

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang={siteMeta.lang} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitializer }} />
        {process.env.NODE_ENV === 'development' ? (
          <script dangerouslySetInnerHTML={{ __html: devRuntimeRecoveryScript }} />
        ) : null}
        <link rel="stylesheet" href="/font/Blueaka/Blueaka.css" />
        <link rel="stylesheet" href="/font/Blueaka_Bold/Blueaka_Bold.css" />
        <link rel="stylesheet" href="/styles/fancybox.css" />
      </head>
      <body>
        <BlogRuntimeProvider>
          <Navbar />
          {children}
          <Footer />
          <RuntimeShell />
        </BlogRuntimeProvider>
      </body>
    </html>
  )
}
