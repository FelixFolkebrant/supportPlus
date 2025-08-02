import type React from 'react'
import FullMail from './FullMail'
import { ResponseMail } from './ResponseMail'
import type { Mail } from '../../hooks/GmailContextValue'
import { useGmail } from '../../hooks/useGmail'
import { AnimatePresence, motion } from 'framer-motion'

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
  const { removeUnansweredMail } = useGmail()

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

  return (
    <div className="flex-1 px-12 pt-4 bg-white overflow-auto">
      <AnimatePresence mode="wait">
        {selectedMail ? (
          <motion.div
            key={selectedMail.id}
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 5 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <FullMail {...selectedMail} />
            <ResponseMail
              mail={selectedMail}
              onRegisterUpdate={handleRegisterUpdate}
              onRegisterEditingState={handleRegisterEditingState}
              onSent={handleMailSent}
            />
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
