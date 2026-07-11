import type { Metadata } from 'next'

import { getServerSideURL } from './getURL'

const defaultOpenGraph: Metadata['openGraph'] = {
  type: 'website',
  description:
    'Notes, projects and writing from Richard Kern, a product manager in New Zealand telecommunications who builds things and writes down what he learns.',
  siteName: 'richardkern.nz',
  title: 'Richard Kern · Projects, notes and writing',
}

const defaultImages = [{ url: `${getServerSideURL()}/og-default.png`, width: 1200, height: 630 }]

export const mergeOpenGraph = (og?: Metadata['openGraph']): Metadata['openGraph'] => {
  return {
    ...defaultOpenGraph,
    ...og,
    images: og?.images ?? defaultImages,
  }
}
