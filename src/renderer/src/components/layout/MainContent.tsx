import React, { useState } from 'react'
import { Chat } from '../ChatPanel/Chat'
import { MailView } from '../MailView'
import { MailSelector } from '../MailSelector'
import { useMailSelection } from '../../hooks/useMailSelection'
import { useGmail } from '../../hooks/useGmail'
import Navbar from '../Navbar/Navbar'

// Extend Window interface for our global function
declare global {
  interface Window {
    responseMailUpdate?: (mailId: string, content: string) => void
  }
}

export function MainContent(): React.JSX.Element {
  const { unansweredMails } = useGmail()
  const { selectedMail, setSelectedMail } = useMailSelection(unansweredMails)
  const [mailEditingState, setMailEditingState] = useState<(isEditing: boolean) => void>()

  // Function to update response mail content (called by AI chat)
  const updateResponseMail = (mailId: string, content: string): void => {
    if (window.responseMailUpdate) {
      window.responseMailUpdate(mailId, content)
    }
  }

  // Function to register mail editing state callback
  const handleRegisterMailEditingState = (setEditingState: (isEditing: boolean) => void): void => {
    setMailEditingState(() => setEditingState)
  }

  return (
    <div className="flex flex-1 h-full w-full overflow-hidden">
      <Navbar />
      {/* Mail Selector - Left Panel */}
      <div className="flex-none w-[500px] h-full min-w-0">
        <MailSelector selectedMail={selectedMail} setSelectedMail={setSelectedMail} />
      </div>

      {/* Mail View - Center Panel */}
      <div className="flex-1 h-full min-w-0">
        <MailView
          selectedMail={selectedMail}
          setSelectedMail={setSelectedMail}
          onRegisterMailEditingState={handleRegisterMailEditingState}
        />
      </div>

      {/* Chat Panel - Right Panel */}
      <div className="flex-none w-[500px] h-full min-w-0">
        <Chat
          selectedMail={selectedMail}
          updateResponseMail={updateResponseMail}
          setMailEditingState={mailEditingState}
        />
      </div>
    </div>
  )
}
