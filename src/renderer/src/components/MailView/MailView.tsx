import React from 'react'
import FullMail from './FullMail'
import { ResponseMail } from './ResponseMail'
import type { Mail } from '../../hooks/GmailContextValue'
import { useGmail } from '../../hooks/useGmail'
import { AnimatePresence, motion } from 'framer-motion'
import IconArchive from '../ui/icons/IconArchive'

// Extend Window interface for our global function
declare global {
  interface Window {
    responseMailUpdate?: (mailId: string, content: string) => void
  }
}

interface MailViewProps {
  selectedMail: Mail | null
  setSelectedMail: (mail: Mail | null) => void
  onRegisterMailEditingState?: (setEditingState: (isEditing: boolean) => void) => void
}

export function MailView({
  selectedMail,
  setSelectedMail,
  onRegisterMailEditingState
}: MailViewProps): React.JSX.Element {
  const { removeUnansweredMail, currentView, archiveThread, unarchiveThread } = useGmail()
  const [archiving, setArchiving] = React.useState(false)

  const handleRegisterUpdate = (updateFn: (mailId: string, content: string) => void): void => {
    // Store this update function globally so the chat can call it
    window.responseMailUpdate = updateFn
  }

  const handleRegisterEditingState = (setEditingState: (isEditing: boolean) => void): void => {
    // Register this with the parent so it can be passed to chat
    if (onRegisterMailEditingState) {
      onRegisterMailEditingState(setEditingState)
    }
  }

  // Remove mail from list and clear selection after send
  const handleMailSent = (): void => {
    if (selectedMail && selectedMail.id) {
      removeUnansweredMail(selectedMail.id)
      setSelectedMail(null)
    }
  }

  // Handle archiving/unarchiving a thread
  const handleArchiveToggle = async (): Promise<void> => {
    if (!selectedMail?.threadId) return

    try {
      if (archiving) return
      setArchiving(true)
      if (currentView === 'archived') {
        await unarchiveThread(selectedMail.threadId)
      } else {
        await archiveThread(selectedMail.threadId)
      }
      setSelectedMail(null)
    } catch (error) {
      console.error('Error toggling archive status:', error)
    } finally {
      setArchiving(false)
    }
  }

  return (
    <div className="flex-1 h-full bg-white overflow-hidden flex flex-col">
      <AnimatePresence mode="wait">
        {selectedMail ? (
          <motion.div
            key={selectedMail.id}
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 5 }}
            transition={{ duration: 0, ease: 'easeOut' }}
            className="flex flex-col h-full"
          >
            {/* Sticky Header with Title and Sender */}
            <div className="sticky top-0 bg-white z-10 px-12 pt-16 pb-4 border-b border-gray-100">
              <div className="flex justify-between items-start mb-1.5">
                <h2 className="font-bold text-secondary text-3xl select-text">
                  {selectedMail.subject}
                </h2>
                {currentView === 'archived' ? (
                  <button
                    onClick={handleArchiveToggle}
                    className={`ml-4 px-4 py-2 bg-gray-100 ${archiving ? '' : 'hover:bg-gray-200'} text-gray-700 text-sm font-medium rounded-lg transition-colors ${archiving ? 'opacity-60 cursor-not-allowed' : ''}`}
                    title="Unarchive thread"
                    disabled={archiving}
                  >
                    Unarchive
                  </button>
                ) : (
                  <button
                    onClick={handleArchiveToggle}
                    className={`ml-4 p-3 rounded-lg transition-colors ${archiving ? '' : 'hover:bg-gray-100'} text-gray-600 ${archiving ? '' : 'hover:text-prim'} ${archiving ? 'opacity-60 cursor-not-allowed' : ''}`}
                    title="Archive thread"
                    disabled={archiving}
                  >
                    <IconArchive filled={false} size={24} />
                  </button>
                )}
              </div>
              <div className="text-lg text-third mb-3">
                {selectedMail.from?.replace(/\s*<[^>]+>/, '').trim()}
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-12">
              <FullMail {...selectedMail} />
              <ResponseMail
                mail={selectedMail}
                onRegisterUpdate={handleRegisterUpdate}
                onRegisterEditingState={handleRegisterEditingState}
                onSent={handleMailSent}
              />
              <div className="pb-8" />
            </div>
          </motion.div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <svg
                className="w-16 h-16 mx-auto mb-4 opacity-50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <p className="text-lg">Select a mail to view and respond</p>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
