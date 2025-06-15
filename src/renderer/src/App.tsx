import { useState, useEffect, useContext } from 'react'
import { GmailProvider, GmailContext } from './hooks/GmailContext'
import MailWindow from './components/MailWindow'
import FullMail from './components/FullMail'
import type { Mail } from './hooks/GmailContext'

function MailAppContent() {
  const { unansweredMails } = useContext(GmailContext) ?? { unansweredMails: [] }
  const [selectedMail, setSelectedMail] = useState<Mail | null>(null)

  useEffect(() => {
    if (unansweredMails.length > 0) {
      setSelectedMail((prev) => {
        // If prev is not in the new list, select the first
        if (!prev || !unansweredMails.some((m) => m.id === prev.id)) {
          return unansweredMails[0]
        }
        return prev
      })
    } else {
      setSelectedMail(null)
    }
  }, [unansweredMails])

  return (
    <div className="flex h-screen w-screen gap-8">
      <MailWindow selectedMail={selectedMail} setSelectedMail={setSelectedMail} />
      {selectedMail ? <FullMail {...selectedMail} /> : null}
    </div>
  )
}

function App(): React.JSX.Element {
  return (
    <GmailProvider>
      <MailAppContent />
    </GmailProvider>
  )
}

export default App
