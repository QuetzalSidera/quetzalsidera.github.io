'use client'

import { useEffect, useRef, useState } from 'react'
import { Motion, spring } from 'react-motion'
import type { CSSProperties } from 'react'
import { useBlogRuntime } from '@/components/runtime/BlogRuntime'
import styles from './Splash.module.css'

// Splash animation knobs are intentionally kept here for debugging.
// Set SPLASH_ANIMATION_ENABLED to false to skip the opening mask entirely.
// Set SPLASH_BREATHING_ENABLED to false to keep the logo fully bright while preserving the fade-out.
const SPLASH_ANIMATION_ENABLED = true
const SPLASH_BREATHING_ENABLED = true
const SPLASH_BLOCK_WHEEL_WHILE_VISIBLE = true
const SPLASH_HOLD_MIN_MS = 1500
const SPLASH_HOLD_JITTER_MS = 300
const SPLASH_FADE_MS = 500
const SPLASH_BREATHING_MS = 500
const SPLASH_BREATHING_DIM_OPACITY = 0.7
const SPLASH_BREATHING_BRIGHT_OPACITY = 1
const DEV_SKIP_SPLASH_STORAGE_KEY = 'blog-dev-skip-splash-once'
const DEV_SKIP_SPLASH_STYLE_ID = 'blog-dev-skip-splash-style'
const fadeSpring = { stiffness: 100, damping: 22, precision: 0.01 }
const breathingSpring = { stiffness: 220, damping: 24, precision: 0.01 }

const svgContent = `<svg viewBox="0 0 1728 1117" preserveAspectRatio="xMinYMin slice" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_2_5)">
<g class="triangle-group">
<path d="M606 -123L1061 666H151L606 -123Z"/>
<path d="M190.15 144L67.3 -68.94L313 -68.94L190.15 144Z"/>
<path d="M1424.17 339L1249.35 35.97L1599 35.97L1424.17 339Z"/>
<path d="M-96.7 513.333L-216.4 305.853H23L-96.7 513.333Z"/>
<path d="M502.825 603.83L391 410L614.65 410L502.825 603.83Z"/>
<path d="M1228.45 648.333L1048.9 337.113L1408 337.113L1228.45 648.333Z"/>
<path d="M246.375 925.667L96.75 666.317H396L246.375 925.667Z"/>
<path d="M606.375 1048.45L504 871L708.75 871L606.375 1048.45Z"/>
<path d="M1376.5 960L1219 687H1534L1376.5 960Z"/>
<path d="M365.395 170L503.791 409.885H227L365.395 170Z"/>
<path d="M1049.36 337L1198.71 595.886H900L1049.36 337Z"/>
<path d="M1248.81 36L1340.61 195.132H1157L1248.81 36Z"/>
<path d="M503.99 680.333L614.981 872.716H393L503.99 680.333Z"/>
<path d="M870.433 698.333L997.866 919.218H743L870.433 698.333Z"/>
<path d="M1419.1 487L1534.2 686.508H1304L1419.1 487Z"/>
<path d="M312.914 809L445.828 1039.38H180L312.914 809Z"/>
<path d="M1225.51 1053.67L1368.01 1300.68H1083L1225.51 1053.67Z"/>
<path d="M1550.51 792L1693.01 1039.01H1408L1550.51 792Z"/>
</g>
<g id="breathingParts">
<path class="circle-path" fill-rule="evenodd" clip-rule="evenodd" d="M864 769C979.98 769 1074 674.98 1074 559C1074 443.02 979.98 349 864 349C748.02 349 654 443.02 654 559C654 674.98 748.02 769 864 769ZM864 749.909C969.436 749.909 1054.91 664.436 1054.91 559C1054.91 453.564 969.436 368.091 864 368.091C758.564 368.091 673.091 453.564 673.091 559C673.091 664.436 758.564 749.909 864 749.909Z"/>
<path class="led-path" d="M934.636 392.273H792.727L757.091 447H970.909L934.636 392.273Z"/>
<path class="led-path" d="M969.636 450.182H897.727L934.636 504.273L969.636 450.182Z"/>
<path class="led-path" d="M792.091 500.455L828.364 447L900.909 555.182L863.364 609.273L792.091 500.455Z"/>
<path class="led-path" d="M900.909 667.182L865.909 612.455L903.5 558.364L973.455 667.182L937.818 721.909H796.545L760.273 667.182L796.545 612.455L832.818 667.182H900.909Z"/>
</g>
<defs>
  <filter id="glow">
    <feGaussianBlur stdDeviation="4" result="blur"/>
    <feFlood class="glow-color" flood-opacity="2.5"/>
    <feComposite in2="blur" operator="in"/>
    <feComposite in="SourceGraphic"/>
  </filter>
</defs>
</svg>`

function consumeDevSplashSkip() {
  if (process.env.NODE_ENV !== 'development' || typeof window === 'undefined') {
    return false
  }

  try {
    const shouldSkip = window.sessionStorage.getItem(DEV_SKIP_SPLASH_STORAGE_KEY) === '1'
    if (shouldSkip) {
      window.sessionStorage.removeItem(DEV_SKIP_SPLASH_STORAGE_KEY)
    }

    return shouldSkip
  } catch {
    return false
  }
}

function clearDevSplashSkipMask() {
  document.documentElement.removeAttribute('data-skip-dev-splash')
  document.getElementById(DEV_SKIP_SPLASH_STYLE_ID)?.remove()
}

export function Splash() {
  const [isVisible, setIsVisible] = useState(true)
  const [isFading, setIsFading] = useState(false)
  const [breathingBright, setBreathingBright] = useState(true)
  const splashRef = useRef<HTMLDivElement | null>(null)
  const { setSplashLoading } = useBlogRuntime()

  useEffect(() => {
    if (consumeDevSplashSkip()) {
      setSplashLoading(false)
      setIsVisible(false)
      const cleanupTimer = window.setTimeout(clearDevSplashSkipMask, 250)
      return () => window.clearTimeout(cleanupTimer)
    }

    if (!SPLASH_ANIMATION_ENABLED) {
      setSplashLoading(false)
      setIsVisible(false)
      return undefined
    }

    const preventDefault = (event: WheelEvent) => event.preventDefault()
    if (SPLASH_BLOCK_WHEEL_WHILE_VISIBLE) {
      window.addEventListener('wheel', preventDefault, { passive: false })
    }

    const splashElement = splashRef.current
    if (!splashElement) {
      setSplashLoading(false)
      return () => {
        if (SPLASH_BLOCK_WHEEL_WHILE_VISIBLE) {
          window.removeEventListener('wheel', preventDefault)
        }
      }
    }

    const holdDuration = Math.floor(Math.random() * SPLASH_HOLD_JITTER_MS) + SPLASH_HOLD_MIN_MS
    const breathingTimer = SPLASH_BREATHING_ENABLED
      ? window.setInterval(() => {
          setBreathingBright((current) => !current)
        }, SPLASH_BREATHING_MS)
      : undefined

    const timer = window.setTimeout(
      () => {
        setIsFading(true)
        setSplashLoading(false)
        if (SPLASH_BLOCK_WHEEL_WHILE_VISIBLE) {
          window.removeEventListener('wheel', preventDefault)
        }
      },
      holdDuration,
    )

    const removeTimer = window.setTimeout(() => {
      if (breathingTimer) {
        window.clearInterval(breathingTimer)
      }
      setIsVisible(false)
    }, holdDuration + SPLASH_FADE_MS)

    return () => {
      window.clearTimeout(timer)
      window.clearTimeout(removeTimer)
      if (breathingTimer) {
        window.clearInterval(breathingTimer)
      }
      if (SPLASH_BLOCK_WHEEL_WHILE_VISIBLE) {
        window.removeEventListener('wheel', preventDefault)
      }
    }
  }, [setSplashLoading])

  if (!isVisible) return null

  return (
    <Motion
      defaultStyle={{ splashOpacity: 1, breathingOpacity: 1 }}
      style={{
        splashOpacity: spring(isFading ? 0 : 1, fadeSpring),
        breathingOpacity: spring(
          !SPLASH_BREATHING_ENABLED || breathingBright
            ? SPLASH_BREATHING_BRIGHT_OPACITY
            : SPLASH_BREATHING_DIM_OPACITY,
          breathingSpring,
        ),
      }}
    >
      {(motionStyle) => (
        <div
          ref={splashRef}
          className={styles.splashContainer}
          style={
            {
              opacity: motionStyle.splashOpacity,
              '--splash-breathing-opacity': motionStyle.breathingOpacity,
            } as CSSProperties
          }
          dangerouslySetInnerHTML={{ __html: svgContent }}
        />
      )}
    </Motion>
  )
}
