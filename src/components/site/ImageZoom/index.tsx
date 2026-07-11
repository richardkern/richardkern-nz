'use client'

import { cn } from '@/utilities/ui'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

/**
 * Wraps a thumbnail (typically a <Media>) in a button that opens an enlarged,
 * full-resolution version in a charcoal lightbox. Understated to match the
 * site: dark scrim, one paper-dim close control, click-anywhere / Esc to close.
 *
 * The overlay uses a plain <img> pointing at the original media URL rather than
 * the Next optimizer: the lightbox wants the full-res file, and the raw
 * same-origin request carries the browser session (so it clears the pre-launch
 * auth gate that blocks the optimizer's credential-less loopback).
 */
export const ImageZoom: React.FC<{
  src: string
  alt: string
  className?: string
  children: React.ReactNode
}> = ({ src, alt, className, children }) => {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  const close = useCallback(() => setOpen(false), [])

  useEffect(() => {
    if (!open) return

    // Capture the thumbnail so we can restore focus to it on close.
    const trigger = triggerRef.current

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('keydown', onKey)

    // Lock body scroll while the lightbox is open.
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()

    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
      trigger?.focus()
    }
  }, [open, close])

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-label={alt ? `Enlarge image: ${alt}` : 'Enlarge image'}
        className={cn('block w-full cursor-zoom-in', className)}
      >
        {children}
      </button>

      {open &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={alt || 'Enlarged image'}
            onClick={close}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-charcoal/90 p-6 md:p-10"
          >
            <button
              ref={closeRef}
              type="button"
              onClick={close}
              aria-label="Close enlarged image"
              className="absolute top-5 right-5 flex size-9 items-center justify-center rounded-full border border-paper-border text-paper-dim transition-colors hover:border-moss hover:text-paper"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>

            {/* eslint-disable-next-line @next/next/no-img-element -- lightbox wants the full-res original, unoptimized */}
            <img
              src={src}
              alt={alt}
              className="max-h-[92vh] max-w-[92vw] cursor-zoom-out object-contain"
            />
          </div>,
          document.body,
        )}
    </>
  )
}
