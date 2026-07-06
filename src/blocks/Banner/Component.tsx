import type { BannerBlock as BannerBlockProps } from 'src/payload-types'

import { cn } from '@/utilities/ui'
import React from 'react'
import RichText from '@/components/RichText'

type Props = {
  className?: string
} & BannerBlockProps

// A quiet aside in the notebook: a fern rule down the left, no fill.
// The style variants share one treatment — the palette has one accent family.
export const BannerBlock: React.FC<Props> = ({ className, content }) => {
  return (
    <div className={cn('mx-auto my-8 w-full', className)}>
      <div className="border-l-2 border-fern py-1 pl-6 text-haze">
        <RichText data={content} enableGutter={false} enableProse={false} />
      </div>
    </div>
  )
}
