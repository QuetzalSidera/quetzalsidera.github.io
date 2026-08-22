'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { AnchorHTMLAttributes, MouseEvent } from 'react'
import { navigateWithRouteTransition } from '@/components/runtime/routeTransition'

type PostContentLinkProps = AnchorHTMLAttributes<HTMLAnchorElement>

function isInternalRoute(href: string) {
  return href.startsWith('/') && !href.startsWith('//')
}

export function PostContentLink({ href, onClick, ...props }: PostContentLinkProps) {
  const router = useRouter()

  if (!href || href.startsWith('#') || !isInternalRoute(href)) {
    return <a {...props} href={href} onClick={onClick} />
  }

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event)
    navigateWithRouteTransition(event, href as string, router.push)
  }

  return <Link {...props} href={href} onClick={handleClick} />
}
