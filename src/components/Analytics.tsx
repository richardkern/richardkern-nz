import Script from 'next/script'
import React from 'react'

/**
 * Umami analytics (self-hosted, cookieless — no consent banner needed), served
 * first-party.
 *
 * The tracker script and its /api/send beacon are proxied under our own origin via
 * the `/stats` rewrite in next.config, so ad-blocker filter lists (which key on the
 * analytics hostname) can't drop them. Renders nothing unless BOTH the proxy target
 * (UMAMI_HOST_URL — build-time, server-only) and the site id
 * (NEXT_PUBLIC_UMAMI_WEBSITE_ID) are set, so dev and staging stay untracked and we
 * never emit a script tag that would 404 when the proxy isn't configured.
 *
 * This is a Server Component (rendered in the server layout), which is why it can
 * read the non-public UMAMI_HOST_URL. Both vars are baked at build time — set them
 * as Docker build args, like NEXT_PUBLIC_SERVER_URL.
 */
export function Analytics() {
  const proxyConfigured = process.env.UMAMI_HOST_URL
  const websiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID

  if (!proxyConfigured || !websiteId) return null

  // Loaded from our own origin; the tracker derives its /api/send endpoint from this
  // script's directory, so the beacon stays first-party too (see next.config).
  return <Script src="/stats/script.js" data-website-id={websiteId} strategy="afterInteractive" />
}
