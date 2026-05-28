'use client'

import anime from 'animejs'
import { useEffect, useRef } from 'react'
import { useBlogRuntime } from '@/components/runtime/BlogRuntime'
import styles from './Fireworks.module.css'

type Particle = {
  x: number
  y: number
  color?: string
  radius?: number
  alpha?: number
  angle?: number
  lineWidth?: number
  endPos?: { x: number; y: number }
  draw?: () => void
}

export function Fireworks() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const { effectiveTheme } = useBlogRuntime()

  useEffect(() => {
    const canvasElement = canvasRef.current
    const canvasContext = canvasElement?.getContext('2d')
    if (!canvasElement || !canvasContext) return undefined

    const canvas = canvasElement
    const ctx = canvasContext

    const colors =
      effectiveTheme === 'dark'
        ? ['252, 146, 174', '202, 180, 190', '207, 198, 255']
        : ['102, 167, 221', '62, 131, 225', '33, 78, 194']
    let pointerX = 0
    let pointerY = 0

    function setCanvasSize() {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
    }

    function setParticleDirection(particle: Particle) {
      const angle = (anime.random(0, 360) * Math.PI) / 180
      const radius = [-1, 1][anime.random(0, 1)] * anime.random(50, 100)
      return {
        x: particle.x + radius * Math.cos(angle),
        y: particle.y + radius * Math.sin(angle),
      }
    }

    function createParticle(x: number, y: number): Particle {
      const particle: Particle = {
        x,
        y,
        color: `rgba(${colors[anime.random(0, colors.length - 1)]},${anime.random(0.2, 0.8)})`,
        radius: anime.random(10, 20),
        angle: anime.random(0, 360),
        endPos: setParticleDirection({ x, y }),
        draw() {
          ctx.save()
          ctx.translate(this.x, this.y)
          ctx.rotate(((this.angle ?? 0) * Math.PI) / 180)
          ctx.beginPath()
          ctx.moveTo(0, -(this.radius ?? 0))
          ctx.lineTo((this.radius ?? 0) * Math.sin(Math.PI / 3), (this.radius ?? 0) * Math.cos(Math.PI / 3))
          ctx.lineTo(-(this.radius ?? 0) * Math.sin(Math.PI / 3), (this.radius ?? 0) * Math.cos(Math.PI / 3))
          ctx.closePath()
          ctx.fillStyle = this.color ?? ''
          ctx.fill()
          ctx.restore()
        },
      }
      return particle
    }

    function createCircle(x: number, y: number): Particle {
      return {
        x,
        y,
        color: effectiveTheme === 'dark' ? 'rgb(233, 179, 237)' : 'rgb(106, 159, 255)',
        radius: 0.1,
        alpha: 0.5,
        lineWidth: 6,
        draw() {
          ctx.globalAlpha = this.alpha ?? 1
          ctx.beginPath()
          ctx.arc(this.x, this.y, this.radius ?? 0, 0, 2 * Math.PI, true)
          ctx.lineWidth = this.lineWidth ?? 0
          ctx.strokeStyle = this.color ?? ''
          ctx.stroke()
          ctx.globalAlpha = 1
        },
      }
    }

    function renderParticle(animation: anime.AnimeInstance) {
      animation.animatables.forEach((animatable) => {
        const particle = animatable.target as unknown as Particle
        particle.draw?.()
      })
    }

    function animateParticles(x: number, y: number) {
      const circle = createCircle(x, y)
      const particles = Array.from({ length: 20 }, () => createParticle(x, y))

      anime
        .timeline()
        .add({
          targets: particles,
          x: (particle: Particle) => particle.endPos?.x,
          y: (particle: Particle) => particle.endPos?.y,
          radius: 0,
          duration: anime.random(900, 1500),
          easing: 'easeOutExpo',
          update: renderParticle,
        })
        .add(
          {
            targets: circle,
            radius: anime.random(50, 100),
            lineWidth: 0,
            alpha: {
              value: 0,
              easing: 'linear',
              duration: anime.random(600, 800),
            },
            duration: anime.random(1200, 1800),
            easing: 'easeOutExpo',
            update: renderParticle,
          },
          0,
        )
    }

    const render = anime({
      duration: Number.POSITIVE_INFINITY,
      update: () => ctx.clearRect(0, 0, canvas.width, canvas.height),
    })

    function handleMouseDown(event: MouseEvent) {
      render.play()
      pointerX = event.clientX
      pointerY = event.clientY
      animateParticles(pointerX, pointerY)
    }

    setCanvasSize()
    document.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('resize', setCanvasSize)

    return () => {
      document.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('resize', setCanvasSize)
      render.pause()
    }
  }, [effectiveTheme])

  return <canvas ref={canvasRef} className={styles.fireworks} />
}
