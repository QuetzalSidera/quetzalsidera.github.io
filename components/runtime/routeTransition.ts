import type { MouseEvent } from 'react'

function normalizePath(href: string) {
  const url = new URL(href, window.location.href)
  const pathname = url.pathname === '/' ? '/' : url.pathname.replace(/\/$/, '')
  return `${pathname}${url.search}${url.hash}`
}

function isSameDocument(href: string) {
  const currentUrl = new URL(window.location.href)
  const nextUrl = new URL(href, currentUrl)
  return currentUrl.pathname === nextUrl.pathname && currentUrl.search === nextUrl.search
}

export function navigateWithRouteTransition(
  event: MouseEvent<HTMLAnchorElement>,
  href: string,
  push: (href: string) => void,
) {
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey ||
    event.currentTarget.hasAttribute('download') ||
    (event.currentTarget.target && event.currentTarget.target !== '_self')
  ) {
    return
  }

  if (isSameDocument(href) && new URL(href, window.location.href).hash) {
    return
  }

  const currentPath = normalizePath(window.location.href)
  const nextPath = normalizePath(href)
  if (currentPath === nextPath) {
    event.preventDefault()
    document.body.classList.remove('page-exiting', 'page-settling')
    window.dispatchEvent(new CustomEvent('blog-route-loading-stop'))
    window.scrollTo({ top: 0, behavior: 'smooth' })
    return
  }

  event.preventDefault()
  document.body.classList.remove('page-settling')
  document.body.classList.add('page-exiting')
  window.scrollTo({ top: 0, behavior: 'smooth' })
  window.dispatchEvent(new CustomEvent('blog-route-loading-start'))

  window.setTimeout(() => {
    push(href)
  }, 100)
}
