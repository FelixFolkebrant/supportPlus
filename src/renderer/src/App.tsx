import { useState, useEffect } from 'react'
import { GmailProvider } from './hooks/GmailContext'
import MailWindow from './components/MailWindow'
import FullMail from './components/FullMail'
import LoadingScreen from './components/LoadingScreen'
import LoginScreen from './components/LoginScreen'
import type { Mail } from './hooks/GmailContextValue'
import { useGmail } from './hooks/useGmail'
import type React from 'react'

function MailAppContent(): React.JSX.Element {
  const { unansweredMails, loading, needsLogin, login, loginInProgress, logout } = useGmail()
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

  if (loading) return <LoadingScreen />
  if (needsLogin) return <LoginScreen onLogin={login} loginInProgress={loginInProgress} />

  return (
    <div className="flex-col h-screen w-screen">
      <div className="flex h-14 items-center justify-between bg-blue-500 text-white text-xl font-bold px-8">
        <span>Navbar?</span>
        <button
          className="px-4 py-2 bg-white text-blue-500 rounded hover:bg-blue-100 font-semibold text-base"
          onClick={logout}
        >
          Log out
        </button>
      </div>
      <div className="flex h-full w-full">
        <MailWindow selectedMail={selectedMail} setSelectedMail={setSelectedMail} />
        {selectedMail ? <FullMail {...selectedMail} /> : null}
      </div>
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
