'use client'

import { useEffect, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPause, faPlay } from '@fortawesome/free-solid-svg-icons'
import styles from './NavControls.module.css'

export function MusicControl() {
  const [isPlaying, setIsPlaying] = useState(false)
  const musicRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const music = document.getElementById('background-music') as HTMLAudioElement | null
    musicRef.current = music
    if (music) {
      music.volume = 0.3
      music.pause()
    }
  }, [])

  function toggleMusic() {
    const music = musicRef.current
    if (!music) return

    if (isPlaying) {
      music.pause()
      setIsPlaying(false)
      return
    }

    music
      .play()
      .then(() => setIsPlaying(true))
      .catch((error) => console.log('播放失败: ', error))
  }

  return (
    <button type="button" className={styles.iconButton} onClick={toggleMusic} aria-label="背景音乐">
      <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} className={styles.icon} />
    </button>
  )
}
