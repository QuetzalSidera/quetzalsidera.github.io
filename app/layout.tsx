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

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang={siteMeta.lang} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitializer }} />
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
