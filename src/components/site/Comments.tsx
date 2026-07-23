'use client'

import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react'

import { useTheme } from '@/providers/Theme'

const GISCUS_ORIGIN = 'https://giscus.app'

// Public giscus wiring (repo/category GraphQL ids are config, not secrets).
// Comments live as GitHub Discussions in the Announcement-type "Comments"
// category, mapped by pathname, so only giscus opens threads.
const GISCUS_CONFIG = {
  'data-repo': 'richardkern/richardkern-nz',
  'data-repo-id': 'R_kgDOTGjPAw',
  'data-category': 'Comments',
  'data-category-id': 'DIC_kwDOTGjPA84DByzl',
  'data-mapping': 'pathname',
  'data-strict': '0',
  'data-reactions-enabled': '0',
  'data-emit-metadata': '0',
  'data-input-position': 'bottom',
  'data-lang': 'en',
} as const

// OS colour-scheme preference as an external store (SSR snapshot: light).
const osDarkQuery = () => window.matchMedia('(prefers-color-scheme: dark)')
const subscribeOsDark = (onChange: () => void) => {
  const query = osDarkQuery()
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}
const useOsDark = () =>
  useSyncExternalStore(
    subscribeOsDark,
    () => osDarkQuery().matches,
    () => false,
  )

// Resolve the site's three-way theme (light / dark / auto) to a giscus theme.
// The noborder variants have transparent backgrounds, so the widget sits on
// the paper (or dark cover) surface instead of a white GitHub box.
const useGiscusTheme = (): 'noborder_light' | 'noborder_dark' => {
  const { theme } = useTheme()
  const osDark = useOsDark()
  const dark = theme === 'dark' || (theme === 'auto' && osDark)
  return dark ? 'noborder_dark' : 'noborder_light'
}

/**
 * Giscus comments, mounted below a post. The script only loads once the
 * section approaches the viewport, so readers who never scroll this far never
 * run any GitHub code (commenting itself requires a GitHub login — noted for
 * the privacy policy).
 */
export const Comments: React.FC = () => {
  const containerRef = useRef<HTMLElement>(null)
  const [nearViewport, setNearViewport] = useState(false)
  const giscusTheme = useGiscusTheme()

  useEffect(() => {
    const el = containerRef.current
    if (!el || nearViewport) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) setNearViewport(true)
      },
      { rootMargin: '400px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [nearViewport])

  // Inject once when the section nears the viewport. giscusTheme is a dep only
  // to satisfy the initial data-theme; the querySelector guard makes re-runs
  // from later theme flips no-ops (those flips reach the iframe below).
  useEffect(() => {
    const el = containerRef.current
    if (!nearViewport || !el || el.querySelector('script, iframe.giscus-frame')) return
    const script = document.createElement('script')
    script.src = `${GISCUS_ORIGIN}/client.js`
    script.async = true
    script.crossOrigin = 'anonymous'
    for (const [key, value] of Object.entries(GISCUS_CONFIG)) {
      script.setAttribute(key, value)
    }
    script.setAttribute('data-theme', giscusTheme)
    el.appendChild(script)
  }, [nearViewport, giscusTheme])

  // Follow the site's theme toggle (and OS changes in auto) after load.
  useEffect(() => {
    const iframe = containerRef.current?.querySelector<HTMLIFrameElement>('iframe.giscus-frame')
    iframe?.contentWindow?.postMessage(
      { giscus: { setConfig: { theme: giscusTheme } } },
      GISCUS_ORIGIN,
    )
  }, [giscusTheme])

  return (
    <section ref={containerRef} aria-label="Comments" className="mt-12 md:mt-16">
      <p className="font-mono text-[12px] tracking-[0.04em] text-muted uppercase">Comments</p>
      <div className="giscus mt-6" />
    </section>
  )
}
