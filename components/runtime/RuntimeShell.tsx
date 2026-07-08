'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Fireworks } from '@/components/fx/Fireworks'
import { Splash } from '@/components/fx/Splash'
import { SpinePlayer } from '@/components/fx/SpinePlayer'
import { SearchDialog } from '@/components/search/SearchDialog'
import { DevContentRefresh } from './DevContentRefresh'
import { useBlogRuntime } from './BlogRuntime'

export function RuntimeShell() {
  const {
    fireworksEnabled,
    searchDialogOpen,
    closeSearchDialog,
    pushBannerMessage,
    removeBannerMessage,
  } = useBlogRuntime()
  const pathname = usePathname()

  useEffect(() => {
    let timer: number | undefined

    function startLoading() {
      window.clearTimeout(timer)
      pushBannerMessage({
        id: 'route-loading',
        type: 'info',
        text: '加载中……',
        duration: 0,
      })
      timer = window.setTimeout(() => removeBannerMessage('route-loading'), 1800)
    }

    function stopLoading() {
      window.clearTimeout(timer)
      removeBannerMessage('route-loading')
    }

    window.addEventListener('blog-route-loading-start', startLoading)
    window.addEventListener('blog-route-loading-stop', stopLoading)
    window.addEventListener('pageshow', stopLoading)

    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('blog-route-loading-start', startLoading)
      window.removeEventListener('blog-route-loading-stop', stopLoading)
      window.removeEventListener('pageshow', stopLoading)
    }
  }, [pushBannerMessage, removeBannerMessage])

  useEffect(() => {
    removeBannerMessage('route-loading')
    document.body.classList.remove('page-exiting', 'page-settling')
    if (
      process.env.NODE_ENV === 'development' &&
      document.documentElement.getAttribute('data-skip-dev-page-motion') === '1'
    ) {
      return undefined
    }

    window.requestAnimationFrame(() => document.body.classList.add('page-settling'))

    const timer = window.setTimeout(() => {
      document.body.classList.remove('page-settling')
    }, 520)

    return () => {
      window.clearTimeout(timer)
      document.body.classList.remove('page-exiting', 'page-settling')
    }
  }, [pathname, removeBannerMessage])

  return (
    <>
      <Splash />
      <DevContentRefresh />
      {searchDialogOpen ? <SearchDialog onClose={closeSearchDialog} /> : null}
      {fireworksEnabled ? <Fireworks /> : null}
      <SpinePlayer />
      <audio id="background-music" loop>
        <source src="/assets/banner/bgm.mp3" type="audio/mpeg" />
      </audio>
    </>
  )
}
