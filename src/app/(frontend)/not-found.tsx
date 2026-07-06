import Link from 'next/link'
import React from 'react'

import { SiteHeader } from '@/components/site/SiteHeader'

// Header only, no footer — a page missing from the log (mock 5f)
export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-220 flex-1 flex-col justify-center px-6 py-16">
        <p className="font-mono text-[12px] text-haze">N°404 &nbsp;·&nbsp; entry not found</p>
        <h1 className="mt-3.5 font-display text-[40px] leading-[1.02] font-bold tracking-[-0.03em] text-ink md:text-[64px]">
          This page isn&rsquo;t in the log.
        </h1>
        <p className="mt-5 font-serif text-[17px] leading-[1.6] text-haze">
          Torn out, never written, or filed somewhere else.
        </p>
        <div className="mt-7.5 flex gap-6">
          <Link
            href="/posts"
            className="font-sans text-[13.5px] font-medium text-fern hover:underline"
          >
            Browse posts →
          </Link>
          <Link
            href="/work"
            className="font-sans text-[13.5px] font-medium text-fern hover:underline"
          >
            See work →
          </Link>
        </div>
      </main>
    </div>
  )
}
