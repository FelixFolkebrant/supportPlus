import type React from 'react'
import { MailContainer } from '../mail/MailContainer'
import { ChatContainer } from '../containers/ChatContainer'
import { useMailSelection } from '../../hooks/useMailSelection'
import { useGmail } from '../../hooks/useGmail'

export function MainContent(): React.JSX.Element {
  const { unansweredMails } = useGmail()
  const { selectedMail, setSelectedMail } = useMailSelection(unansweredMails)

  return (
    <div className="flex pl-2 flex-1 h-[calc(100%-3.5rem)] w-full overflow-hidden">
      <MailContainer selectedMail={selectedMail} setSelectedMail={setSelectedMail} />
      <ChatContainer />
    </div>
  )
}
