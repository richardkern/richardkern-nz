import type { Metadata } from 'next'

import { cn } from '@/utilities/ui'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import { Schibsted_Grotesk, Source_Serif_4 } from 'next/font/google'
import { draftMode } from 'next/headers'
import React from 'react'

import { AdminBar } from '@/components/AdminBar'
import { Analytics } from '@/components/Analytics'
import { themeInitScript } from '@/providers/Theme'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'

import './globals.css'
import { getServerSideURL } from '@/utilities/getURL'

const schibstedGrotesk = Schibsted_Grotesk({
  subsets: ['latin'],
  variable: '--font-schibsted-grotesk',
  display: 'swap',
})

const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-source-serif',
  display: 'swap',
})

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { isEnabled } = await draftMode()

  return (
    <html
      className={cn(
        GeistSans.variable,
        GeistMono.variable,
        schibstedGrotesk.variable,
        sourceSerif.variable,
      )}
      lang="en"
      suppressHydrationWarning
    >
      <head>
        <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
        <link href="/favicon.png" rel="icon" type="image/png" sizes="32x32" />
        {/* Applies the saved theme synchronously during HTML parse, before
            first paint, so there is no flash. Must be a raw inline script:
            next/script beforeInteractive runs too late in the App Router and
            reintroduces the flash. */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        {/* Only mount the admin bar in draft/preview mode. Entering preview
            requires an authenticated editor (see next/preview), so on an
            anonymous page view AdminBar is never in the tree: its module
            factory never runs and its per-view fetch to /api/users/me never
            fires. (The code still downloads — Turbopack co-bundles it with the
            theme toggle — but nothing executes it, so it costs no main-thread
            time.) A logged-in editor browsing the live, non-preview site no
            longer sees the bar; that convenience is traded for the win. */}
        {isEnabled && (
          <AdminBar
            adminBarProps={{
              preview: isEnabled,
            }}
          />
        )}
        {children}
        <Analytics />
      </body>
    </html>
  )
}

export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  title: {
    default: 'Richard Kern · Projects, notes and writing',
    template: '%s · Richard Kern',
  },
  description:
    'Notes, projects and writing from Richard Kern, a product manager in New Zealand telecommunications who builds things and writes down what he learns.',
  openGraph: mergeOpenGraph(),
  // twitter:site/creator can't be derived from openGraph, so set them here.
  // card/title/description/images are left to Next's inference from the
  // resolved openGraph so each page keeps its own title and image.
  twitter: {
    card: 'summary_large_image',
    site: '@richardkern_nz',
    creator: '@richardkern_nz',
  },
}
