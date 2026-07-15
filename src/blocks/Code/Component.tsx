import type { PrismTheme } from 'prism-react-renderer'
import { Highlight } from 'prism-react-renderer'
import React from 'react'

// Bush Charcoal surface with an in-family syntax palette: moss keywords,
// warm-sand strings, grey-green comments — no acid green (Design Spec §3).
//
// Server component: prism-react-renderer's Highlight is isomorphic and this
// block takes only static props (no hooks, state, or handlers), so it renders
// during SSR/RSC and prism never ships to the client bundle.
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

export type CodeBlockProps = {
  code: string
  language?: string
  filename?: string
  blockType: 'code'
}

type Props = CodeBlockProps & {
  className?: string
}

export const CodeBlock: React.FC<Props> = ({ className, code, language = '', filename }) => {
  if (!code) return null

  return (
    <div className={[className, 'not-prose my-9'].filter(Boolean).join(' ')}>
      <div data-surface="charcoal" className="rounded-md bg-structural px-7 py-6">
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
    </div>
  )
}
