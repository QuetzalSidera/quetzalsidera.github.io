'use client'

import { useEffect, useRef } from 'react'
import { useBlogRuntime } from '@/components/runtime/BlogRuntime'
import { blogThemeConfig } from '@/lib/site'
import styles from './BannerHero.module.css'

type BannerHeroProps = {
  children: React.ReactNode
  isPostViewer?: boolean
  loadingComplete?: boolean
}

class SiriWave {
  K: number
  F: number
  speed: number
  noise: number
  phase: number
  devicePixelRatio: number
  width: number
  height: number
  MAX: number
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  run: boolean
  animationFrameID: number | null

  constructor(canvas: HTMLCanvasElement) {
    this.K = 1
    this.F = 15
    this.speed = 0.1
    this.noise = 30
    this.phase = 0
    this.devicePixelRatio = window.devicePixelRatio || 1
    this.width = this.devicePixelRatio * window.innerWidth
    this.height = this.devicePixelRatio * 100
    this.MAX = this.height / 2
    this.canvas = canvas
    this.canvas.width = this.width
    this.canvas.height = this.height
    this.canvas.style.width = this.width / this.devicePixelRatio + 'px'
    this.canvas.style.height = this.height / this.devicePixelRatio + 'px'
    this.ctx = this.canvas.getContext('2d')!
    this.run = false
    this.animationFrameID = null
  }

  _drawLine(attenuation: number, color: string, width: number, noise: number, F: number) {
    this.ctx.moveTo(0, 0)
    this.ctx.beginPath()
    this.ctx.strokeStyle = color
    this.ctx.lineWidth = width || 1
    F = F || this.F
    noise = noise * this.MAX || this.noise
    for (let i = -this.K; i <= this.K; i += 0.01) {
      i = parseFloat(i.toFixed(2))
      const x = this.width * ((i + this.K) / (this.K * 2))
      const y =
        this.height / 2 +
        noise * Math.pow(Math.sin(i * 10 * attenuation), 1) * Math.sin(F * i - this.phase)
      this.ctx.lineTo(x, y)
    }
    this.ctx.lineTo(this.width, this.height)
    this.ctx.lineTo(0, this.height)
    this.ctx.fillStyle = color
    this.ctx.fill()
  }

  _clear() {
    this.ctx.globalCompositeOperation = 'destination-out'
    this.ctx.fillRect(0, 0, this.width, this.height)
    this.ctx.globalCompositeOperation = 'source-over'
  }

  _draw() {
    if (!this.run) {
      return
    }
    this.phase = (this.phase + this.speed) % (Math.PI * 64)
    this._clear()
    const wave1Color = getComputedStyle(document.documentElement)
      .getPropertyValue('--wave-color1')
      .trim()
    const wave2Color = getComputedStyle(document.documentElement)
      .getPropertyValue('--wave-color2')
      .trim()

    this._drawLine(0.5, wave1Color, 1, 0.35, 6)
    this._drawLine(1, wave2Color, 1, 0.25, 6)
    this.animationFrameID = requestAnimationFrame(this._draw.bind(this))
  }

  start() {
    this.phase = 0
    this.run = true
    this._draw()
  }

  stop() {
    this.run = false
    this._clear()
    if (this.animationFrameID !== null) {
      cancelAnimationFrame(this.animationFrameID)
      this.animationFrameID = null
    }
  }

  setNoise(v: number) {
    this.noise = Math.min(v, 1) * this.MAX
  }

  setSpeed(v: number) {
    this.speed = v
  }

  set(noise: number, speed: number) {
    this.setNoise(noise)
    this.setSpeed(speed)
  }
}

function debounce(func: () => void, wait: number) {
  let timeout: number | undefined
  return function debounced() {
    window.clearTimeout(timeout)
    timeout = window.setTimeout(() => {
      func()
    }, wait)
  }
}

export function BannerHero({
  children,
  isPostViewer = false,
  loadingComplete = true,
}: BannerHeroProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const { splashLoading } = useBlogRuntime()
  const isLoadingComplete = loadingComplete && !splashLoading

  useEffect(() => {
    let currentWave: SiriWave | null = null

    function initAll() {
      if (!canvasRef.current) {
        return
      }
      if (currentWave) {
        currentWave.stop()
      }
      currentWave = new SiriWave(canvasRef.current)
      currentWave.setSpeed(0.01)
      currentWave.start()
    }

    initAll()
    const handleResize = debounce(initAll, 100)
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      currentWave?.stop()
    }
  }, [])

  return (
    <div
      className={[
        styles.banner,
        isPostViewer ? styles.postViewer : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className={[styles.heroContent, isLoadingComplete ? styles.contentReady : ''].filter(Boolean).join(' ')}>
        {children}
      </div>
      <canvas ref={canvasRef} id="wave" className={styles.wave} />
      {blogThemeConfig.videoBanner ? (
        <video
          autoPlay
          muted
          loop
          className={[styles.bgVideo, isLoadingComplete ? styles.backgroundReady : '']
            .filter(Boolean)
            .join(' ')}
        >
          <source src="/assets/banner/banner_video.mp4" type="video/mp4" />
        </video>
      ) : (
        <div
          className={[styles.bgImg, isLoadingComplete ? styles.backgroundReady : '']
            .filter(Boolean)
            .join(' ')}
        />
      )}
    </div>
  )
}
