import React, { useState } from 'react'
import { Chat } from '../ChatPanel/Chat'
import { MailView } from '../MailView'
import { MailSelector } from '../MailSelector'
import { SettingsSelector, SettingsView } from '../Settings'
import { useMailSelection } from '../../hooks/useMailSelection'
import { useGmail } from '../../hooks/useGmail'
import Navbar from '../Navbar/Navbar'

// Extend Window interface for our global function
declare global {
  interface Window {
    responseMailUpdate?: (mailId: string, content: string) => void
  }
}

interface MainContentProps {
  onLogout?: () => void
}

export function MainContent({ onLogout }: MainContentProps): React.JSX.Element {
  const { getCurrentMails, currentView } = useGmail()
  const currentMails = getCurrentMails()
  const { selectedMail, setSelectedMail } = useMailSelection(currentMails)
  const [mailEditingState, setMailEditingState] = useState<(isEditing: boolean) => void>()
  const [selectedSettingId, setSelectedSettingId] = useState<string | null>('chat') // Default to chat settings
  const [inboxCollapsed, setInboxCollapsed] = useState(false)

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
      <Navbar onLogout={onLogout} onActiveNavClick={() => setInboxCollapsed((v) => !v)} />

      {currentView === 'settings' ? (
        <>
          {/* Settings Selector - Left Panel */}
          <div className="flex-none w-[500px] h-full min-w-0 overflow-hidden">
            <SettingsSelector
              selectedSettingId={selectedSettingId}
              setSelectedSettingId={setSelectedSettingId}
            />
          </div>

          {/* Settings View - Right Panel */}
          <div className="flex-1 h-full min-w-0 overflow-hidden">
            <SettingsView selectedSettingId={selectedSettingId} />
          </div>
        </>
      ) : (
        <>
          {/* Mail Selector - Left Panel */}
          {!inboxCollapsed && (
            <div className="flex-none w-[500px] h-full min-w-0 overflow-hidden">
              <MailSelector selectedMail={selectedMail} setSelectedMail={setSelectedMail} />
            </div>
          )}

          {/* Mail View - Center Panel */}
          <div className="flex-1 h-full min-w-0 overflow-hidden">
            <MailView
              selectedMail={selectedMail}
              setSelectedMail={setSelectedMail}
              onRegisterMailEditingState={handleRegisterMailEditingState}
              inboxCollapsed={inboxCollapsed}
              onToggleInbox={() => setInboxCollapsed((v) => !v)}
            />
          </div>

          {/* Chat Panel - Right Panel */}
          <div className="flex-none w-[500px] h-full min-w-0 overflow-hidden">
            <Chat
              selectedMail={selectedMail}
              updateResponseMail={updateResponseMail}
              setMailEditingState={mailEditingState}
            />
          </div>
        </>
      )}
    </div>
  )
}
