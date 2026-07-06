/** @type {import('tailwindcss').Config} */
const config = {
  theme: {
    extend: {
      typography: {
        // Long-form body for posts, projects, and pages — Design Spec §3.
        // Serif at a comfortable measure; headings in the display face;
        // everything *about* the text (inline code, captions) in mono.
        DEFAULT: {
          css: [
            {
              '--tw-prose-body': 'var(--color-ink)',
              '--tw-prose-headings': 'var(--color-ink)',
              '--tw-prose-links': 'var(--color-fern)',
              '--tw-prose-bold': 'var(--color-ink)',
              '--tw-prose-quotes': 'var(--color-haze)',
              '--tw-prose-quote-borders': 'var(--color-rule-strong)',
              '--tw-prose-hr': 'var(--color-rule-strong)',
              '--tw-prose-code': 'var(--color-ink)',
              '--tw-prose-counters': 'var(--color-haze)',
              '--tw-prose-bullets': 'var(--color-haze)',
              '--tw-prose-captions': 'var(--color-haze)',
              fontFamily: 'var(--font-serif)',
              fontSize: '1.1875rem',
              lineHeight: '1.7',
              maxWidth: 'none',
              h2: {
                fontFamily: 'var(--font-display)',
                fontWeight: '600',
                fontSize: '1.625rem',
                lineHeight: '1.25',
                letterSpacing: '-0.02em',
                marginTop: '2.2em',
                marginBottom: '0.7em',
              },
              h3: {
                fontFamily: 'var(--font-display)',
                fontWeight: '600',
                fontSize: '1.25rem',
                lineHeight: '1.3',
                letterSpacing: '-0.02em',
              },
              h4: {
                fontFamily: 'var(--font-display)',
                fontWeight: '600',
                fontSize: '1.0625rem',
              },
              a: {
                fontWeight: '400',
                textDecorationColor: 'rgba(42, 90, 67, 0.4)',
                textUnderlineOffset: '3px',
                '&:hover': {
                  textDecorationColor: 'var(--color-fern)',
                },
              },
              code: {
                fontFamily: 'var(--font-geist-mono)',
                fontSize: '0.85em',
                fontWeight: '400',
                background: 'rgba(34, 38, 31, 0.06)',
                padding: '0.15em 0.35em',
                borderRadius: '0',
              },
              'code::before': { content: 'none' },
              'code::after': { content: 'none' },
              blockquote: {
                fontStyle: 'italic',
                fontWeight: '400',
              },
              hr: {
                marginTop: '2.6em',
                marginBottom: '2.6em',
              },
            },
          ],
        },
      },
    },
  },
}

export default config
