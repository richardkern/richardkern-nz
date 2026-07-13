import Script from 'next/script'
import React from 'react'

/**
 * Umami analytics (self-hosted, cookieless — no consent banner needed).
 *
 * Renders nothing unless BOTH env vars are set, so dev and staging stay
 * untracked by default; only production has these baked in. They are
 * NEXT_PUBLIC_* because the script URL + website id ship to the client and
 * are inlined at build — set them as Docker build args, like
 * NEXT_PUBLIC_SERVER_URL.
 */
export function Analytics() {
  const src = process.env.NEXT_PUBLIC_UMAMI_SRC
  const websiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID

  if (!src || !websiteId) return null

  return <Script src={src} data-website-id={websiteId} strategy="afterInteractive" />
}
