'use client'

import { useEffect, useMemo, useRef, useState, type SyntheticEvent } from 'react'
import { useBlogRuntime } from '@/components/runtime/BlogRuntime'
import { blogThemeConfig } from '@/lib/site'
import styles from './SpinePlayer.module.css'

type VoiceConfig = {
  audio: string
  animation: string
  text: string
}

type SpineAssetConfig = {
  skelUrl: string
  atlasUrl: string
  idleAnimationName: string
  eyeCloseAnimationName: string
  rightEyeBone: string
  leftEyeBone: string
  frontHeadBone: string
  backHeadBone: string
  eyeRotationAngle: number
  voiceConfig: VoiceConfig[]
}

type SpineBone = {
  data: {
    x: number
    y: number
  }
  x: number
  y: number
}

type SpineSkeleton = {
  findBone: (name: string) => SpineBone | null
  updateWorldTransform: () => void
}

type SpineAnimationState = {
  setAnimation: (trackIndex: number, animationName: string, loop: boolean) => void
  addAnimation: (trackIndex: number, animationName: string, loop: boolean, delay: number) => void
  setEmptyAnimation: (trackIndex: number, mixDuration: number) => void
}

type SpinePlayerInstance = {
  setAnimation: (animationName: string, loop: boolean) => void
  skeleton: SpineSkeleton
  animationState: SpineAnimationState
  dispose?: () => void
  stopRendering?: () => void
}

type SpineRuntimeModule = {
  spine: {
    SpinePlayer: new (
      parent: HTMLElement,
      config: {
        skelUrl: string
        atlasUrl: string
        premultipliedAlpha: boolean
        backgroundColor: string
        alpha: boolean
        showControls: boolean
        animation: string
        success: (player: SpinePlayerInstance) => void
        error: (player: SpinePlayerInstance, reason: string) => void
      },
    ) => SpinePlayerInstance
  }
}

type AudioContextConstructor = new () => AudioContext

const spineVoiceLang = blogThemeConfig.spineVoiceLang

const spineAssets: Record<'arona' | 'plana', SpineAssetConfig> = {
  arona: {
    skelUrl: '/spine_assets/arona/arona_spr.skel',
    atlasUrl: '/spine_assets/arona/arona_spr.atlas',
    idleAnimationName: 'Idle_01',
    eyeCloseAnimationName: 'Eye_Close_01',
    rightEyeBone: 'R_Eye_01',
    leftEyeBone: 'L_Eye_01',
    frontHeadBone: 'Head_01',
    backHeadBone: 'Head_Back',
    eyeRotationAngle: 76.307,
    voiceConfig: [
      {
        audio: `/spine_assets/arona/audio/${spineVoiceLang}/arona_01.ogg`,
        animation: '12',
        text: '您回来了？我等您很久啦！',
      },
      {
        audio: `/spine_assets/arona/audio/${spineVoiceLang}/arona_02.ogg`,
        animation: '03',
        text: '嗯，不错，今天也是个好天气。',
      },
      {
        audio: `/spine_assets/arona/audio/${spineVoiceLang}/arona_03.ogg`,
        animation: '02',
        text: '天空真是广啊……\n另一边会有些什么呢？',
      },
      {
        audio: `/spine_assets/arona/audio/${spineVoiceLang}/arona_04.ogg`,
        animation: '18',
        text: '偶尔也要为自己的健康着想啊，\n老师，我会很担心的。',
      },
      {
        audio: `/spine_assets/arona/audio/${spineVoiceLang}/arona_05.ogg`,
        animation: '25',
        text: '来，加油吧，老师！',
      },
      {
        audio: `/spine_assets/arona/audio/${spineVoiceLang}/arona_06.ogg`,
        animation: '11',
        text: '今天又会有什么事情在等着我呢？',
      },
    ],
  },
  plana: {
    skelUrl: '/spine_assets/plana/plana_spr.skel',
    atlasUrl: '/spine_assets/plana/plana_spr.atlas',
    idleAnimationName: 'Idle_01',
    eyeCloseAnimationName: 'Eye_Close_01',
    rightEyeBone: 'R_Eye_01',
    leftEyeBone: 'L_Eye_01',
    frontHeadBone: 'Head_Rot',
    backHeadBone: 'Head_Back',
    eyeRotationAngle: 97.331,
    voiceConfig: [
      {
        audio: `/spine_assets/plana/audio/${spineVoiceLang}/plana_02.ogg`,
        animation: '06',
        text: '我明白了，\n老师现在无事可做，很无聊。',
      },
      {
        audio: `/spine_assets/plana/audio/${spineVoiceLang}/plana_01.ogg`,
        animation: '13',
        text: '混乱，该行动无法理解。\n请不要戳我，会出现故障。',
      },
      {
        audio: `/spine_assets/plana/audio/${spineVoiceLang}/plana_03.ogg`,
        animation: '15',
        text: '确认连接。',
      },
      {
        audio: `/spine_assets/plana/audio/${spineVoiceLang}/plana_04.ogg`,
        animation: '99',
        text: '正在待命，\n需要解决的任务还有很多。',
      },
      {
        audio: `/spine_assets/plana/audio/${spineVoiceLang}/plana_05.ogg`,
        animation: '17',
        text: '等您很久了。',
      },
    ],
  },
}

function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  )
}

function createAudioManager() {
  let context: AudioContext | null = null
  let gainNode: GainNode | null = null
  let currentSource: AudioBufferSourceNode | null = null
  const buffers = new Map<string, { buffer: AudioBuffer; lastUsed: number }>()

  function initialize() {
    if (context) return context

    const AudioContextCtor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: AudioContextConstructor }).webkitAudioContext

    if (!AudioContextCtor) {
      return null
    }

    context = new AudioContextCtor()
    gainNode = context.createGain()
    gainNode.gain.value = 0.5
    gainNode.connect(context.destination)
    return context
  }

  async function loadAudioFile(url: string) {
    const audioContext = initialize()
    if (!audioContext) return null

    const cached = buffers.get(url)
    if (cached) {
      cached.lastUsed = Date.now()
      return cached.buffer
    }

    try {
      const response = await fetch(url)
      const arrayBuffer = await response.arrayBuffer()
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
      buffers.set(url, { buffer: audioBuffer, lastUsed: Date.now() })
      return audioBuffer
    } catch (error) {
      console.error('音频加载失败:', error)
      return null
    }
  }

  async function playAudio(buffer: AudioBuffer) {
    const audioContext = initialize()
    if (!audioContext || !gainNode) return

    if (audioContext.state === 'suspended') {
      await audioContext.resume()
    }

    const targetGainNode = gainNode
    if (!targetGainNode) return

    if (currentSource) {
      currentSource.stop()
    }

    await new Promise<void>((resolve) => {
      const source = audioContext.createBufferSource()
      source.buffer = buffer
      source.connect(targetGainNode)
      source.onended = () => {
        if (currentSource === source) {
          currentSource = null
        }
        resolve()
      }
      currentSource = source
      source.start()
    })
  }

  function clear() {
    if (currentSource) {
      currentSource.stop()
      currentSource = null
    }
    buffers.clear()
  }

  function gc() {
    const now = Date.now()
    for (const [url, entry] of buffers.entries()) {
      if (now - entry.lastUsed > 300000) {
        buffers.delete(url)
      }
    }
  }

  return {
    clear,
    gc,
    loadAudioFile,
    playAudio,
  }
}

export function SpinePlayer() {
  const { effectiveTheme, spinePlayerEnabled } = useBlogRuntime()
  const [showDialog, setShowDialog] = useState(false)
  const [currentDialog, setCurrentDialog] = useState('')
  const [mobileShifted, setMobileShifted] = useState(false)
  const [isPlayerReady, setIsPlayerReady] = useState(false)
  const playerContainerRef = useRef<HTMLDivElement | null>(null)
  const playerRef = useRef<SpinePlayerInstance | null>(null)
  const animationStateRef = useRef<SpineAnimationState | null>(null)
  const resetBonesRef = useRef<(() => void) | null>(null)
  const moveBonesRef = useRef<((event: MouseEvent) => void) | null>(null)
  const blinkTimerRef = useRef<number | null>(null)
  const isPlayingRef = useRef(false)
  const lastPlayedIndexRef = useRef(-1)
  const audioManagerRef = useRef<ReturnType<typeof createAudioManager> | null>(null)

  const currentCharacter = effectiveTheme === 'dark' ? 'plana' : 'arona'
  const currentAssets = useMemo(() => spineAssets[currentCharacter], [currentCharacter])

  useEffect(() => {
    audioManagerRef.current ??= createAudioManager()
  }, [])

  useEffect(() => {
    const audioManager = audioManagerRef.current

    function cleanup() {
      if (blinkTimerRef.current !== null) {
        window.clearTimeout(blinkTimerRef.current)
        blinkTimerRef.current = null
      }

      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('scroll', handleScroll)
      moveBonesRef.current = null
      resetBonesRef.current = null
      animationStateRef.current = null

      if (playerRef.current?.dispose) {
        playerRef.current.dispose()
      }
      if (playerRef.current?.stopRendering) {
        playerRef.current.stopRendering()
      }
      playerRef.current = null

      if (playerContainerRef.current) {
        playerContainerRef.current.innerHTML = ''
      }

      audioManager?.clear()
      isPlayingRef.current = false
      setShowDialog(false)
      setCurrentDialog('')
      setMobileShifted(false)
      setIsPlayerReady(false)
    }

    function handleScroll() {
      if (!playerContainerRef.current || !isMobileDevice()) return

      const bottomReached = window.innerHeight + window.scrollY + 1 >= document.body.offsetHeight
      setMobileShifted(bottomReached)
    }

    function handleMouseMove(event: MouseEvent) {
      moveBonesRef.current?.(event)
    }

    function playBlinkAnimation(assets: SpineAssetConfig, animationState: SpineAnimationState) {
      const randomTime = Math.random() * 3 + 3
      const shouldDoubleBlink = Math.random() > 0.5

      animationState.setAnimation(1, assets.eyeCloseAnimationName, false)

      if (shouldDoubleBlink) {
        animationState.addAnimation(1, assets.eyeCloseAnimationName, false, 0.1)
      }

      blinkTimerRef.current = window.setTimeout(
        () => playBlinkAnimation(assets, animationState),
        randomTime * 1000,
      )
    }

    function attachBoneControls(assets: SpineAssetConfig, playerInstance: SpinePlayerInstance) {
      const skeleton = playerInstance.skeleton
      const animationState = playerInstance.animationState
      animationStateRef.current = animationState

      const rightEyeBone = skeleton.findBone(assets.rightEyeBone)
      const leftEyeBone = skeleton.findBone(assets.leftEyeBone)
      const frontHeadBone = skeleton.findBone(assets.frontHeadBone)
      const backHeadBone = skeleton.findBone(assets.backHeadBone)

      const rightEyeCenterX = rightEyeBone ? rightEyeBone.data.x : 0
      const rightEyeCenterY = rightEyeBone ? rightEyeBone.data.y : 0
      const leftEyeCenterX = leftEyeBone ? leftEyeBone.data.x : 0
      const leftEyeCenterY = leftEyeBone ? leftEyeBone.data.y : 0
      const frontHeadCenterX = frontHeadBone ? frontHeadBone.data.x : 0
      const frontHeadCenterY = frontHeadBone ? frontHeadBone.data.y : 0
      const backHeadCenterX = backHeadBone ? backHeadBone.data.x : 0
      const backHeadCenterY = backHeadBone ? backHeadBone.data.y : 0
      const maxRadius = 15
      const frontHeadMaxRadius = 2
      const backHeadMaxRadius = 1

      function rotateVector(x: number, y: number, angle: number) {
        const cos = Math.cos(angle)
        const sin = Math.sin(angle)
        return {
          x: x * cos - y * sin,
          y: x * sin + y * cos,
        }
      }

      function resetBones() {
        if (rightEyeBone) {
          rightEyeBone.x = rightEyeCenterX
          rightEyeBone.y = rightEyeCenterY
        }

        if (leftEyeBone) {
          leftEyeBone.x = leftEyeCenterX
          leftEyeBone.y = leftEyeCenterY
        }

        if (frontHeadBone) {
          frontHeadBone.x = frontHeadCenterX
          frontHeadBone.y = frontHeadCenterY
        }

        if (backHeadBone) {
          backHeadBone.x = backHeadCenterX
          backHeadBone.y = backHeadCenterY
        }

        skeleton.updateWorldTransform()
      }

      resetBonesRef.current = resetBones

      moveBonesRef.current = (event: MouseEvent) => {
        if (isPlayingRef.current || !playerContainerRef.current) return

        const containerRect = playerContainerRef.current.getBoundingClientRect()
        const mouseX = event.clientX - (containerRect.right - containerRect.width / 2)
        const mouseY = event.clientY - (containerRect.bottom - (containerRect.height * 4) / 5)
        const eyeRotation = assets.eyeRotationAngle * (Math.PI / 180)
        const rotatedMouse = rotateVector(mouseX, mouseY, -eyeRotation)
        const offsetX = rotatedMouse.x
        const offsetY = rotatedMouse.y
        const distance = Math.sqrt(offsetX * offsetX + offsetY * offsetY)
        const angle = Math.atan2(offsetY, offsetX)
        const maxDistance = Math.min(distance, maxRadius)
        const dx = -maxDistance * Math.cos(angle)
        const dy = maxDistance * Math.sin(angle)

        if (rightEyeBone) {
          rightEyeBone.x = rightEyeCenterX + dx
          rightEyeBone.y = rightEyeCenterY + dy
        }

        if (leftEyeBone) {
          leftEyeBone.x = leftEyeCenterX + dx
          leftEyeBone.y = leftEyeCenterY + dy
        }

        const frontHeadDx = Math.min(distance, frontHeadMaxRadius) * Math.cos(angle)
        const frontHeadDy = Math.min(distance, frontHeadMaxRadius) * Math.sin(angle)
        const backHeadDx = Math.min(distance, backHeadMaxRadius) * Math.cos(angle)
        const backHeadDy = Math.min(distance, backHeadMaxRadius) * Math.sin(angle)

        if (frontHeadBone) {
          frontHeadBone.x = frontHeadCenterX - frontHeadDx
          frontHeadBone.y = frontHeadCenterY + frontHeadDy
        }

        if (backHeadBone) {
          backHeadBone.x = backHeadCenterX + backHeadDx
          backHeadBone.y = backHeadCenterY - backHeadDy
        }

        skeleton.updateWorldTransform()
      }

      if (!isMobileDevice()) {
        window.addEventListener('mousemove', handleMouseMove, { passive: true })
      }

      playBlinkAnimation(assets, animationState)
    }

    async function preloadAudio(assets: SpineAssetConfig) {
      audioManager?.gc()
      await Promise.all(assets.voiceConfig.map((pair) => audioManager?.loadAudioFile(pair.audio)))
    }

    async function initialize() {
      const container = playerContainerRef.current
      if (!container || !spinePlayerEnabled) return

      setIsPlayerReady(false)
      container.innerHTML = ''

      try {
        const runtime = (await import('./spine-runtime/spine-player.js')) as SpineRuntimeModule

        await preloadAudio(currentAssets)

        if (cancelled || !playerContainerRef.current || playerContainerRef.current !== container) {
          return
        }

        playerRef.current = new runtime.spine.SpinePlayer(container, {
          skelUrl: currentAssets.skelUrl,
          atlasUrl: currentAssets.atlasUrl,
          premultipliedAlpha: true,
          backgroundColor: '#00000000',
          alpha: true,
          showControls: false,
          animation: currentAssets.idleAnimationName,
          success: (playerInstance) => {
            if (cancelled || playerContainerRef.current !== container) {
              playerInstance.stopRendering?.()
              playerInstance.dispose?.()
              container.innerHTML = ''
              return
            }

            window.requestAnimationFrame(() => attachBoneControls(currentAssets, playerInstance))
            setIsPlayerReady(true)
          },
          error: (_playerInstance, reason) => {
            console.error(`Spine加载失败: ${reason}`)
          },
        })
      } catch (error) {
        console.error('Failed to initialize spine player:', error)
      }
    }

    let cancelled = false
    const initializeTimer = window.setTimeout(initialize, 300)

    cleanup()

    if (!spinePlayerEnabled) {
      window.clearTimeout(initializeTimer)
      return cleanup
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      cancelled = true
      window.clearTimeout(initializeTimer)
      cleanup()
    }
  }, [currentAssets, spinePlayerEnabled])

  async function handlePlayerClick(event: SyntheticEvent) {
    event.preventDefault()
    event.stopPropagation()

    const audioManager = audioManagerRef.current
    const animationState = animationStateRef.current

    if (!audioManager || !animationState || isPlayingRef.current) return

    isPlayingRef.current = true
    resetBonesRef.current?.()

    const currentConfig = currentAssets.voiceConfig
    let randomIndex = 0

    do {
      randomIndex = Math.floor(Math.random() * currentConfig.length)
    } while (randomIndex === lastPlayedIndexRef.current && currentConfig.length > 1)

    lastPlayedIndexRef.current = randomIndex
    const selectedPair = currentConfig[randomIndex]

    try {
      const buffer = await audioManager.loadAudioFile(selectedPair.audio)
      if (!buffer) throw new Error('音频加载失败')

      setCurrentDialog(selectedPair.text)
      setShowDialog(true)
      animationState.addAnimation(2, selectedPair.animation, false, 0)
      await audioManager.playAudio(buffer)
      animationState.setEmptyAnimation(2, 0)
    } catch (error) {
      console.error('音频播放失败:', error)
    } finally {
      isPlayingRef.current = false
      setShowDialog(false)
    }
  }

  if (!spinePlayerEnabled) {
    return null
  }

  return (
    <>
      <div
        ref={playerContainerRef}
        className={[
          styles.playerContainer,
          isPlayerReady ? styles.ready : styles.loading,
          mobileShifted ? styles.shifted : '',
        ]
          .filter(Boolean)
          .join(' ')}
        onClick={handlePlayerClick}
        onTouchStart={handlePlayerClick}
      />
      {showDialog ? (
        <div
          className={[styles.chatdialogContainer, mobileShifted ? styles.shifted : '']
            .filter(Boolean)
            .join(' ')}
        >
          <div className={styles.chatdialogTriangle} />
          <div className={styles.chatdialog}>{currentDialog}</div>
        </div>
      ) : null}
    </>
  )
}
