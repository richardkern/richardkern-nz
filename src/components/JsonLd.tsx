import React from 'react'

/**
 * Renders a schema.org JSON-LD document as a <script> tag. The `<` escape stops
 * any string value from breaking out of the script element (e.g. a "</script>"
 * inside a title or description).
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  )
}
