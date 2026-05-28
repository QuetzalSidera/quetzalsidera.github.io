'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { MouseEvent } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBilibili, faGithub, faZhihu } from '@fortawesome/free-brands-svg-icons'
import { Banner } from '@/components/shared/Banner'
import { blogThemeConfig } from '@/lib/site'
import styles from './WelcomeBox.module.css'

const socialIconMap = {
  github: faGithub,
  bilibili: faBilibili,
  zhihu: faZhihu,
} as const

const multiple = 30
const maxTilt = 8

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function getMouseAngle(x: number, y: number) {
  const radians = Math.atan2(y, x)
  let angle = radians * (180 / Math.PI)

  if (angle < 0) {
    angle += 360
  }

  return angle
}

export function WelcomeBox() {
  const welcomeBoxRef = useRef<HTMLDivElement | null>(null)
  const pointerRef = useRef<{ x: number; y: number } | null>(null)
  const frameRef = useRef<number | null>(null)
  const [mottoText, setMottoText] = useState('')

  const randomMotto = useMemo(() => {
    const motto = blogThemeConfig.motto
    return motto[Math.floor(Math.random() * motto.length)] || ''
  }, [])

  function setWelcomeMotion(rotateX: number, rotateY: number, angle: number) {
    const welcomeBox = welcomeBoxRef.current
    if (!welcomeBox) {
      return
    }

    welcomeBox.style.setProperty('--welcome-rotate-x', `${rotateX}deg`)
    welcomeBox.style.setProperty('--welcome-rotate-y', `${rotateY}deg`)
    welcomeBox.style.setProperty('--welcome-gradient-angle', `${angle}deg`)
  }

  function updateParallax() {
    frameRef.current = null

    const welcomeBox = welcomeBoxRef.current
    const pointer = pointerRef.current
    if (!welcomeBox || !pointer) {
      return
    }

    const box = welcomeBox.getBoundingClientRect()
    const offsetX = pointer.x - box.x - box.width / 2
    const offsetY = pointer.y - box.y - box.height / 2
    const rotateY = clamp(offsetX / multiple, -maxTilt, maxTilt)
    const rotateX = clamp(-offsetY / multiple, -maxTilt, maxTilt)

    setWelcomeMotion(rotateX, rotateY, Math.floor(getMouseAngle(offsetY, offsetX)))
  }

  function parallax(event: MouseEvent<HTMLDivElement>) {
    pointerRef.current = { x: event.clientX, y: event.clientY }

    if (frameRef.current === null) {
      frameRef.current = window.requestAnimationFrame(updateParallax)
    }
  }

  function reset() {
    pointerRef.current = null

    if (frameRef.current !== null) {
      window.cancelAnimationFrame(frameRef.current)
      frameRef.current = null
    }

    setWelcomeMotion(0, 0, 0)
  }

  useEffect(() => {
    let timeout: number | undefined
    let nextLength = 0

    function addNextCharacter() {
      if (nextLength < randomMotto.length) {
        nextLength += 1
        setMottoText(randomMotto.slice(0, nextLength))
        timeout = window.setTimeout(addNextCharacter, Math.random() * 150 + 50)
      }
    }

    setMottoText('')
    addNextCharacter()

    return () => {
      window.clearTimeout(timeout)
    }
  }, [randomMotto])

  useEffect(() => {
    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current)
      }
    }
  }, [])

  return (
    <div
      className={styles.welcomeBox}
      ref={welcomeBoxRef}
      onMouseMove={parallax}
      onMouseLeave={reset}
    >
      <div className={styles.welcomeText}>
        <Banner title={blogThemeConfig.welcomeText} />
      </div>
      <div className={styles.infoBox}>
        <img src="/assets/banner/avatar.webp" alt="" className={styles.avatar} draggable={false} />
        <span className={styles.name}>{blogThemeConfig.name}</span>
        <span className={styles.motto}>
          {mottoText}
          <span className={styles.pointer} />
        </span>
        <ul>
          {blogThemeConfig.social.map((item) => (
            <li key={item.url}>
              <a href={item.url} target="_blank" rel="noopener noreferrer">
                <FontAwesomeIcon icon={socialIconMap[item.icon]} className={styles.social} />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
