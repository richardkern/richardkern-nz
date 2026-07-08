import type { Metadata } from 'next'

import { cn } from '@/utilities/ui'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import { Schibsted_Grotesk, Source_Serif_4 } from 'next/font/google'
import { draftMode } from 'next/headers'
import React from 'react'

import { AdminBar } from '@/components/AdminBar'
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
    >
      <head>
        <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
        <link href="/favicon.png" rel="icon" type="image/png" sizes="32x32" />
      </head>
      <body>
        <AdminBar
          adminBarProps={{
            preview: isEnabled,
          }}
        />
        {children}
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
}
