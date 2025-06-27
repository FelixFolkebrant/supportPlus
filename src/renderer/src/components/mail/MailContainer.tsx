import type React from 'react'
import MailWindow from './MailWindow'
import FullMail from './FullMail'
import { ResponseMail } from './ResponseMail'
import type { Mail } from '../../hooks/GmailContextValue'
import { useGmail } from '../../hooks/useGmail'

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
        className="flex-none pt-12 xl:flex hidden bg-white h-full z-10 px-4 py-2 border-r border-gray-50"
        style={{ boxShadow: '4px 0 8px -2px rgba(0,0,0,0.10)' }}
      >
        <MailWindow selectedMail={selectedMail} setSelectedMail={setSelectedMail} />
      </div>

      {/* Middle: FullMail takes remaining space */}
      <div className="flex-1 px-12 pt-10 bg-white overflow-auto">
        {selectedMail ? (
          <>
            <FullMail {...selectedMail} />
            <ResponseMail
              mail={selectedMail}
              onRegisterUpdate={handleRegisterUpdate}
              onRegisterEditingState={handleRegisterEditingState}
              onSent={handleMailSent} // <-- Pass the handler
            />
          </>
        ) : null}
      </div>
    </div>
  )
}
