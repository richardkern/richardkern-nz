/**
 * Processes media resource URL to ensure proper formatting
 * @param url The original URL from the resource
 * @param cacheTag Optional cache tag to append to the URL
 * @returns Properly formatted URL with cache tag if provided
 *
 * Media paths must stay relative (e.g. `/api/media/file/image.webp`) so the
 * Next.js image optimizer treats them as local and self-fetches over the
 * internal loopback, rather than routing the absolute public URL back out
 * through the front-door proxy (a wasteful, fragile round-trip from inside the
 * container). Payload emits absolute URLs because `serverURL` is set in the
 * config, so we strip a same-origin origin back off here before optimization.
 */
export const getMediaUrl = (url: string | null | undefined, cacheTag?: string | null): string => {
  if (!url) return ''

  // Reduce an absolute same-origin media URL to a relative path so Next treats
  // it as a local image. Genuinely external images (different host) are left
  // absolute so `remotePatterns` still governs them.
  if (url.startsWith('http')) {
    try {
      const parsed = new URL(url)
      if (parsed.pathname.startsWith('/api/media/') || parsed.pathname.startsWith('/media/')) {
        url = `${parsed.pathname}${parsed.search}`
      }
    } catch {
      // Not a parseable URL; fall through and use it as-is.
    }
  }

  if (cacheTag && cacheTag !== '') {
    cacheTag = encodeURIComponent(cacheTag)
  }

  return cacheTag ? `${url}?${cacheTag}` : url
}
