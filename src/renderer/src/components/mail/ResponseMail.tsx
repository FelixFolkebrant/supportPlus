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
  onSent?: () => void // <-- Add this prop
}

export const ResponseMail = forwardRef<ResponseMailRef, ResponseMailProps>(function ResponseMail(
  { mail, onRegisterUpdate, onRegisterEditingState, isAiEditing: propIsAiEditing, onSent }, // <-- Add onSent
  ref
): React.JSX.Element {
  const storageKey = `responseMail:${mail.id}`

  // Simple rich text editor using contentEditable div
  const [isFocused, setIsFocused] = useState(false)
  const [formatVersion, setFormatVersion] = useState(0)
  const [localIsAiEditing, setLocalIsAiEditing] = useState(false)
  const [sendStatus, setSendStatus] = useState<'idle' | 'sending' | 'sent'>('idle')
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
  const handleSend = async (): Promise<void> => {
    setSendStatus('sending')
    const html = editorRef.current?.innerHTML || ''
    try {
      await sendReplyEmail(html)
      setSendStatus('sent')
      if (onSent) onSent() // <-- Call onSent after successful send
    } catch {
      setSendStatus('idle')
      // Optionally handle error here
    }
  }

  // Reset sendStatus when mail changes
  useEffect(() => {
    setSendStatus('idle')
  }, [mail.id])

  return (
    <div className="px-4">
      <div className="bg-gray-50 rounded-lg shadow-sm border border-gray-200 w-full">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Reply:</h3>
          </div>
        </div>

        {/* Content */}
        <div className="py-2 px-4">
          {sendStatus === 'sending' && (
            <div className="flex items-center justify-center min-h-[200px] text-blue-600">
              <div className="flex flex-col items-center space-y-3">
                <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                <span className="font-medium">Sending message...</span>
              </div>
            </div>
          )}

          {sendStatus === 'sent' && (
            <div className="flex items-center justify-center min-h-[200px] text-green-600">
              <div className="flex flex-col items-center space-y-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <span className="font-semibold text-lg">Message sent successfully!</span>
              </div>
            </div>
          )}

          {sendStatus === 'idle' && (
            <div className="space-y-4">
              {/* Formatting Toolbar */}
              <div
                className="flex items-center gap-1 p-2 bg-gray-50 rounded-lg border"
                key={formatVersion}
              >
                <button
                  type="button"
                  disabled={isAiEditing}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    isFormatActive('bold')
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-100 border border-transparent'
                  } ${isAiEditing ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-sm'}`}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    format('bold')
                  }}
                  title="Bold"
                >
                  <span className="font-bold">B</span>
                </button>
                <button
                  type="button"
                  disabled={isAiEditing}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    isFormatActive('italic')
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-100 border border-transparent'
                  } ${isAiEditing ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-sm'}`}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    format('italic')
                  }}
                  title="Italic"
                >
                  <span className="italic">I</span>
                </button>
                <button
                  type="button"
                  disabled={isAiEditing}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    isFormatActive('underline')
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-100 border border-transparent'
                  } ${isAiEditing ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-sm'}`}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    format('underline')
                  }}
                  title="Underline"
                >
                  <span className="underline">U</span>
                </button>
              </div>

              {/* Editor Container */}
              <div className="relative text-black">
                <div
                  ref={editorRef}
                  className={`w-full p-4 border border-gray-200 rounded-lg min-h-[200px] bg-gray-50 focus:outline-none transition-all ${
                    isFocused ? 'ring-2 ring-blue-500 border-blue-500' : 'hover:border-gray-300'
                  } ${isAiEditing ? 'pointer-events-none opacity-70' : ''}`}
                  contentEditable={!isAiEditing}
                  suppressContentEditableWarning
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  onInput={handleInput}
                  style={{
                    minHeight: 200,
                    lineHeight: '1.6',
                    fontSize: '14px'
                  }}
                />

                {/* Custom placeholder */}
                {!getEditorText() && !isFocused && !isAiEditing && (
                  <div className="absolute top-4 left-4 text-gray-400 pointer-events-none">
                    Type your reply here...
                  </div>
                )}

                {isAiEditing && (
                  <div className="absolute inset-0 bg-blue-50 bg-opacity-95 flex items-center justify-center rounded-lg border-2 border-blue-200">
                    <div className="flex flex-col items-center space-y-4 text-blue-700">
                      <div className="animate-spin h-10 w-10 border-3 border-blue-600 border-t-transparent rounded-full"></div>
                      <div className="text-center">
                        <div className="font-semibold text-lg">AI Assistant is editing...</div>
                        <div className="text-sm text-blue-600 mt-1">
                          Please wait while your email is being improved
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Send Button Container */}
              <div className="flex justify-end pt-2">
                <SendButton
                  onSend={handleSend}
                  disabled={isAiEditing || !getEditorText()}
                  loading={sendingReply}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
})
