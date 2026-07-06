import type { Metadata } from 'next'

const defaultOpenGraph: Metadata['openGraph'] = {
  type: 'website',
  description:
    'Richard Kern writes about homelab, AI agents, web development, and running — a notebook in public.',
  siteName: 'richardkern.nz',
  title: 'richardkern.nz',
}

export const mergeOpenGraph = (og?: Metadata['openGraph']): Metadata['openGraph'] => {
  return {
    ...defaultOpenGraph,
    ...og,
    images: og?.images ? og.images : undefined,
  }
}
