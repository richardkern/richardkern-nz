import type { Metadata } from 'next/types'

import React from 'react'

import { PostsIndex } from './PostsIndex'

type Args = {
  searchParams: Promise<{
    tag?: string
  }>
}

export default async function Page({ searchParams }: Args) {
  const { tag } = await searchParams

  return <PostsIndex tag={tag} />
}

export function generateMetadata(): Metadata {
  return {
    title: 'Posts',
    description:
      'Notes and essays from Richard Kern on homelab and self-hosting, AI agents, web development, and the occasional detour into running or aviation.',
  }
}
