'use client'
import type { PrismTheme } from 'prism-react-renderer'
import { Highlight } from 'prism-react-renderer'
import React from 'react'

// Bush Charcoal surface with an in-family syntax palette: moss keywords,
// warm-sand strings, grey-green comments — no acid green (Design Spec §3).
const bushCharcoal: PrismTheme = {
  plain: {
    color: '#E9E7E0',
    backgroundColor: '#171B16',
  },
  styles: [
    {
      types: ['keyword', 'builtin', 'important'],
      style: { color: '#8FB8A5' },
    },
    {
      types: ['string', 'char', 'attr-value', 'inserted', 'number', 'boolean', 'constant'],
      style: { color: '#D9C79E' },
    },
    {
      types: ['comment', 'prolog', 'doctype', 'cdata', 'deleted'],
      style: { color: '#98A19B' },
    },
    {
      types: ['punctuation', 'operator'],
      style: { color: 'rgba(233, 231, 224, 0.75)' },
    },
    {
      types: ['function', 'class-name', 'tag', 'selector', 'attr-name', 'property', 'variable'],
      style: { color: '#E9E7E0' },
    },
  ],
}

type Props = {
  code: string
  language?: string
  filename?: string
}

export const Code: React.FC<Props> = ({ code, language = '', filename }) => {
  if (!code) return null

  return (
    <div data-surface="charcoal" className="rounded-md bg-charcoal px-7 py-6">
      {filename && (
        <p className="mb-3.5 font-mono text-[10.5px] tracking-[0.08em] text-paper-faint">
          {filename}
        </p>
      )}
      <Highlight code={code} language={language} theme={bushCharcoal}>
        {({ getLineProps, getTokenProps, tokens }) => (
          <pre className="overflow-x-auto font-mono text-[14px] leading-[1.75]">
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line })}>
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token })} />
                ))}
              </div>
            ))}
          </pre>
        )}
      </Highlight>
    </div>
  )
}
