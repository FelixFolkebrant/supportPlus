import React, {
  useState,
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
  useCallback
} from 'react'
import type { Mail } from '../../hooks/GmailContextValue'
import { SendButton } from './SendButton'
import { useEmail } from '../../hooks/useEmail'
import LoadingSpinner from '../ui/LoadingSpinner'
import { generateAutoDraft } from '../../api/openai'

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
  const [autoDrafting, setAutoDrafting] = useState(false)
  const [autoDraftError, setAutoDraftError] = useState<string | null>(null)
  const [editorContentVersion, setEditorContentVersion] = useState(0)
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
        setEditorContentVersion((v) => v + 1)
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

  // Handler for auto-draft button
  const handleAutoDraft = async (): Promise<void> => {
    setAutoDrafting(true)
    setLocalIsAiEditing(true)
    setAutoDraftError(null) // Clear any previous errors
    try {
      // Get the original email content for context
      const originalEmailContent = `
        From: ${mail.from}
        Subject: ${mail.subject}
        Date: ${mail.date}
        
        ${mail.body || mail.snippet}
      `

      const draftContent = await generateAutoDraft(originalEmailContent)

      // Update the editor with the generated content
      if (editorRef.current) {
        editorRef.current.innerHTML = draftContent
        localStorage.setItem(storageKey, draftContent)
        setEditorContentVersion((v) => v + 1)
      }
    } catch (error) {
      console.error('Auto-draft error:', error)
      setAutoDraftError(error instanceof Error ? error.message : 'Failed to generate auto-draft')
    } finally {
      setAutoDrafting(false)
      setLocalIsAiEditing(false)
    }
  }

  // Reset sendStatus when mail changes
  useEffect(() => {
    setSendStatus('idle')
  }, [mail.id])

  return (
    <div className="pt-8">
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
            <div className="flex items-center justify-center min-h-[200px]">
              <div className="flex flex-col items-center space-y-3">
                <LoadingSpinner size="md" color="blue" type="circular" />
                <span className="font-medium text-blue-600">Sending message...</span>
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
              {/* Auto-draft Error Display */}
              {autoDraftError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="font-medium">Auto-draft failed:</span>
                    <span>{autoDraftError}</span>
                    <button
                      onClick={() => setAutoDraftError(null)}
                      className="ml-auto text-red-500 hover:text-red-700"
                      title="Dismiss error"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

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
                {!getEditorText() && !isFocused && !isAiEditing && editorContentVersion >= 0 && (
                  <div className="absolute top-4 left-4 text-gray-400 pointer-events-none">
                    Type your reply here...
                  </div>
                )}

                {isAiEditing && (
                  <div className="absolute inset-0 bg-blue-50 bg-opacity-95 flex items-center justify-center rounded-lg border-2 border-blue-200">
                    <div className="flex flex-col items-center space-y-4 text-blue-700">
                      <LoadingSpinner size="lg" color="blue" type="circular" />
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
                  onAutoDraft={handleAutoDraft}
                  disabled={isAiEditing || !getEditorText()}
                  autoDraftDisabled={isAiEditing}
                  loading={sendingReply}
                  autoDrafting={autoDrafting}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
})
