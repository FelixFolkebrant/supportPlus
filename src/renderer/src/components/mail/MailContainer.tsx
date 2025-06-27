import type React from 'react'
import MailSelectWindow from './MailSelectWindow'
import FullMail from './FullMail'
import { ResponseMail } from './ResponseMail'
import type { Mail } from '../../hooks/GmailContextValue'
import { useGmail } from '../../hooks/useGmail'
import { AnimatePresence, motion } from './framerMotion'

// Extend Window interface for our global function
declare global {
  interface Window {
    responseMailUpdate?: (mailId: string, content: string) => void
  }
}

interface MailContainerProps {
  selectedMail: Mail | null
  setSelectedMail: (mail: Mail | null) => void
  onUpdateResponseMail?: (mailId: string, content: string) => void
  onRegisterMailEditingState?: (setEditingState: (isEditing: boolean) => void) => void
}

export function MailContainer({
  selectedMail,
  setSelectedMail,
  onUpdateResponseMail,
  onRegisterMailEditingState
}: MailContainerProps): React.JSX.Element {
  const { removeUnansweredMail } = useGmail() // <-- Use the hook

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
  const handleMailSent = () => {
    if (selectedMail && selectedMail.id) {
      removeUnansweredMail(selectedMail.id)
      setSelectedMail(null)
    }
  }

  return (
    <div className="flex h-screen w-full">
      {/* Left: MailWindow grows to content */}
      <div
        className="flex-none xl:flex hidden bg-white h-full z-10 px-4 py-2"
      >
        <MailSelectWindow selectedMail={selectedMail} setSelectedMail={setSelectedMail} />
      </div>

      {/* Middle: FullMail takes remaining space */}
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
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  )
}
