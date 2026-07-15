import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)
import { redirects } from './redirects'

// Prefer the explicit per-environment NEXT_PUBLIC_SERVER_URL (set in Coolify) so the
// production host lands in images.remotePatterns. The localhost fallback below only
// applies when it is unset. Mirrors getServerSideURL() in src/utilities/getURL.ts.
// NOTE: NEXT_PUBLIC_SERVER_URL must be a build-time var in Coolify, since remotePatterns
// is baked at build; a runtime-only value leaves the optimizer allowlisting localhost.
const NEXT_PUBLIC_SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL ||
  process.env.__NEXT_PRIVATE_ORIGIN ||
  `http://localhost:${process.env.PORT || 3000}`

const nextConfig: NextConfig = {
  // Temporarily required on Windows until Next.js fixes Turbopack Sass resolution.
  // See: https://github.com/vercel/next.js/issues/86431
  sassOptions: {
    loadPaths: ['./node_modules/@payloadcms/ui/dist/scss/'],
  },
  images: {
    localPatterns: [
      {
        pathname: '/api/media/file/**',
      },
    ],
    // 75 is the default the Media component requests; 100 stays allowed for any
    // caller that opts into near-lossless output. Next 16 rejects a quality not
    // in this list.
    qualities: [75, 100],
    remotePatterns: [
      ...[NEXT_PUBLIC_SERVER_URL /* 'https://example.com' */].map((item) => {
        const url = new URL(item)

        return {
          hostname: url.hostname,
          protocol: url.protocol.replace(':', '') as 'http' | 'https',
        }
      }),
    ],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  logging: {
    browserToTerminal: true,
  },
  reactStrictMode: true,
  redirects,
  // First-party Umami proxy (issue #44). Serve the tracker script and its collect
  // beacon under our own origin so ad-blocker filter lists (which key on the
  // analytics hostname) can't drop them and undercount blocker-running visitors.
  // The tracker derives its /api/send endpoint from the script's own directory, so
  // proxying both under /stats/* is enough — no data-host-url needed. Gated on
  // UMAMI_HOST_URL, which is BUILD-TIME (rewrites bake into the routes manifest at
  // build): set it as a Docker build arg alongside NEXT_PUBLIC_UMAMI_WEBSITE_ID, or
  // /stats/script.js 404s and analytics silently stop. `/stats` is the one filter-
  // evasion knob — rename it here and in components/Analytics.tsx together if a list
  // ever catches it.
  async rewrites() {
    const umamiHost = process.env.UMAMI_HOST_URL?.replace(/\/$/, '')
    if (!umamiHost) return []
    return [
      { source: '/stats/script.js', destination: `${umamiHost}/script.js` },
      { source: '/stats/api/send', destination: `${umamiHost}/api/send` },
    ]
  },
  // Baseline security headers. CSP is deliberately omitted — it needs its own
  // careful pass (Payload admin, next/image, inline theme script). HSTS
  // includeSubDomains is safe here: every richardkern.nz subdomain is HTTPS
  // (Cloudflare / the homelab tunnel). SAMEORIGIN keeps the admin live-preview
  // iframe (same origin) working.
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        ],
      },
    ]
  },
  turbopack: {
    root: path.resolve(dirname),
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
