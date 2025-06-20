import React, { useState } from 'react'
import type { Mail } from '../../hooks/GmailContextValue'

export function ResponseMail({ mail }: { mail: Mail }): React.JSX.Element {
  const [content, setContent] = useState('')
  const title = `RE: ${mail.subject}`

  // Simple rich text editor using contentEditable div
  const [isFocused, setIsFocused] = useState(false)
  const [formatVersion, setFormatVersion] = useState(0)
  const editorRef = React.useRef<HTMLDivElement>(null)

  // Toolbar actions
  const format = (command: string, value?: string): void => {
    document.execCommand(command, false, value)
    setFormatVersion((v) => v + 1) // force re-render to update button state
  }

  // Helper to check if a format is active
  const isFormatActive = (command: string): boolean => {
    return document.queryCommandState(command)
  }

  // Handler to update formatVersion on selection changes
  const handleSelectionChange = (): void => setFormatVersion((v) => v + 1)

  React.useEffect(() => {
    document.addEventListener('selectionchange', handleSelectionChange)
    return () => document.removeEventListener('selectionchange', handleSelectionChange)
  }, [])

  return (
    <div className="p-4 border-t border-gray-200 text-black bg-gray-50">
      <h3 className="text-2xl font-bold text-secondary mb-2">{title}</h3>
      <div className="flex gap-2 mb-2" key={formatVersion}>
        <button
          type="button"
          className={`px-2 py-1 border rounded ${isFormatActive('bold') ? 'bg-blue-200' : ''}`}
          onMouseDown={(e) => {
            e.preventDefault()
            format('bold')
          }}
        >
          B
        </button>
        <button
          type="button"
          className={`px-2 py-1 border rounded ${isFormatActive('italic') ? 'bg-blue-200' : ''}`}
          onMouseDown={(e) => {
            e.preventDefault()
            format('italic')
          }}
        >
          <span style={{ fontStyle: 'italic' }}>I</span>
        </button>
        <button
          type="button"
          className={`px-2 py-1 border rounded ${isFormatActive('underline') ? 'bg-blue-200' : ''}`}
          onMouseDown={(e) => {
            e.preventDefault()
            format('underline')
          }}
        >
          <span style={{ textDecoration: 'underline' }}>U</span>
        </button>
      </div>
      <div
        ref={editorRef}
        className={`w-full mb-2 p-2 border rounded min-h-[80px] bg-white focus:outline-none ${
          isFocused ? 'ring-2 ring-blue-400' : ''
        }`}
        contentEditable
        suppressContentEditableWarning
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onInput={(e) => setContent((e.target as HTMLDivElement).innerHTML)}
        style={{ minHeight: 80 }}
      />
      {/* You can add a send button or other actions here */}
    </div>
  )
}
