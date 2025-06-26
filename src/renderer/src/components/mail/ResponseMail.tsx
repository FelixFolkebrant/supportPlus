import React, {
  useState,
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
  useCallback
} from 'react'
import type { Mail } from '../../hooks/GmailContextValue'
import { SendButton } from '../SendButton'
import { useEmail } from '../../hooks/useEmail'

interface ResponseMailRef {
  updateContent: (newContent: string) => void
}

interface ResponseMailProps {
  mail: Mail
  onRegisterUpdate?: (updateFn: (mailId: string, content: string) => void) => void
  onRegisterEditingState?: (setEditingState: (isEditing: boolean) => void) => void
  isAiEditing?: boolean
}

export const ResponseMail = forwardRef<ResponseMailRef, ResponseMailProps>(function ResponseMail(
  { mail, onRegisterUpdate, onRegisterEditingState, isAiEditing: propIsAiEditing },
  ref
): React.JSX.Element {
  const storageKey = `responseMail:${mail.id}`
  const title = `RE: ${mail.subject}`

  // Simple rich text editor using contentEditable div
  const [isFocused, setIsFocused] = useState(false)
  const [formatVersion, setFormatVersion] = useState(0)
  const [localIsAiEditing, setLocalIsAiEditing] = useState(false)
  const editorRef = useRef<HTMLDivElement>(null)
  const { sendReplyEmail, sendingReply } = useEmail(mail)

  // Use prop isAiEditing if provided, otherwise use local state
  const isAiEditing = propIsAiEditing !== undefined ? propIsAiEditing : localIsAiEditing

  // Load saved content when mail changes
  useEffect(() => {
    const saved = localStorage.getItem(storageKey)
    if (editorRef.current) {
      editorRef.current.innerHTML = saved || ''
    }
  }, [storageKey])

  // Save content to localStorage on change
  const handleInput = (e: React.FormEvent<HTMLDivElement>): void => {
    const html = (e.target as HTMLDivElement).innerHTML
    localStorage.setItem(storageKey, html)
  }

  // Function to update content from external source (AI assistant)
  const updateContent = useCallback(
    (newContent: string): void => {
      setLocalIsAiEditing(false) // Clear loading state
      localStorage.setItem(storageKey, newContent)
      if (editorRef.current) {
        editorRef.current.innerHTML = newContent
      }
    },
    [storageKey]
  )

  // Register the update function with the parent
  useEffect(() => {
    if (onRegisterUpdate) {
      onRegisterUpdate((mailId: string, newContent: string) => {
        if (mailId === mail.id) {
          setLocalIsAiEditing(true) // Show loading state
          // Small delay to ensure loading state is visible
          setTimeout(() => {
            updateContent(newContent)
          }, 100)
        }
      })
    }
  }, [mail.id, onRegisterUpdate, updateContent])

  // Register the editing state function with the parent
  useEffect(() => {
    if (onRegisterEditingState) {
      onRegisterEditingState(setLocalIsAiEditing)
    }
  }, [onRegisterEditingState])

  // Expose updateContent via ref
  useImperativeHandle(ref, () => ({
    updateContent
  }))

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

  useEffect(() => {
    document.addEventListener('selectionchange', handleSelectionChange)
    return () => document.removeEventListener('selectionchange', handleSelectionChange)
  }, [])

  // Helper to get current editor content as plain text
  const getEditorText = (): string => {
    return editorRef.current?.innerText?.trim() || ''
  }

  // Handler for send button
  const handleSend = (): void => {
    const html = editorRef.current?.innerHTML || ''
    sendReplyEmail(html)
  }

  return (
    <div className="p-4 border-t border-gray-200 text-black bg-gray-50">
      <h3 className="text-2xl font-bold text-secondary mb-2">{title}</h3>
      <div className="flex gap-2 mb-2" key={formatVersion}>
        <button
          type="button"
          disabled={isAiEditing}
          className={`px-2 py-1 border rounded ${isFormatActive('bold') ? 'bg-blue-200' : ''} ${
            isAiEditing ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          onMouseDown={(e) => {
            e.preventDefault()
            format('bold')
          }}
        >
          B
        </button>
        <button
          type="button"
          disabled={isAiEditing}
          className={`px-2 py-1 border rounded ${isFormatActive('italic') ? 'bg-blue-200' : ''} ${
            isAiEditing ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          onMouseDown={(e) => {
            e.preventDefault()
            format('italic')
          }}
        >
          <span style={{ fontStyle: 'italic' }}>I</span>
        </button>
        <button
          type="button"
          disabled={isAiEditing}
          className={`px-2 py-1 border rounded ${isFormatActive('underline') ? 'bg-blue-200' : ''} ${
            isAiEditing ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          onMouseDown={(e) => {
            e.preventDefault()
            format('underline')
          }}
        >
          <span style={{ textDecoration: 'underline' }}>U</span>
        </button>
      </div>
      <div className="relative">
        <div
          ref={editorRef}
          className={`w-full mb-2 p-2 border rounded min-h-[80px] bg-white focus:outline-none ${
            isFocused ? 'ring-2 ring-blue-400' : ''
          } ${isAiEditing ? 'pointer-events-none opacity-70' : ''}`}
          contentEditable={!isAiEditing}
          suppressContentEditableWarning
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onInput={handleInput}
          style={{ minHeight: 80 }}
        />
        {isAiEditing && (
          <div className="absolute inset-0 bg-blue-50 bg-opacity-95 flex items-center justify-center rounded border-2 border-blue-200">
            <div className="flex flex-col items-center space-y-3 text-blue-700">
              <div className="animate-spin h-8 w-8 border-3 border-blue-600 border-t-transparent rounded-full"></div>
              <div className="text-center">
                <div className="font-semibold">AI Assistant is editing...</div>
                <div className="text-sm text-blue-600">
                  Please wait while your email is being improved
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="flex justify-end mt-2">
        <SendButton
          onSend={handleSend}
          disabled={isAiEditing || !getEditorText()}
          loading={sendingReply}
        />
      </div>
    </div>
  )
})
