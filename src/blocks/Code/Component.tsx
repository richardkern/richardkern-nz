import React from 'react'

import { Code } from './Component.client'

export type CodeBlockProps = {
  code: string
  language?: string
  filename?: string
  blockType: 'code'
}

type Props = CodeBlockProps & {
  className?: string
}

export const CodeBlock: React.FC<Props> = ({ className, code, language, filename }) => {
  return (
    <div className={[className, 'not-prose my-9'].filter(Boolean).join(' ')}>
      <Code code={code} language={language} filename={filename} />
    </div>
  )
}
