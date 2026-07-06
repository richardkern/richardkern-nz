import { getCachedGlobal } from '@/utilities/getGlobals'
import { navLinksFrom } from '@/utilities/navLinks'
import Link from 'next/link'
import React from 'react'

import { Wordmark } from '@/components/site/Wordmark'
import { HeaderNav } from './Nav.client'

export async function SiteHeader() {
  const header = await getCachedGlobal('header', 1)()

  return (
    <header className="flex items-baseline justify-between border-b border-rule px-6 py-5 sm:px-10 md:py-[26px] lg:px-24">
      <Link href="/" className="inline-block">
        <Wordmark className="text-[16px]" />
      </Link>
      <HeaderNav links={navLinksFrom(header)} />
    </header>
  )
}
