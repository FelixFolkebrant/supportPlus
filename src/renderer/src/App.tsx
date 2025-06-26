import React from 'react'
import { GmailProvider } from './hooks/GmailContext'
import { DriveProvider } from './hooks/DriveContext'
import { AppLayout } from './components/layout'
import WelcomeScreen from './components/ui/WelcomeScreen'
import { useGmail } from './hooks/useGmail'

function MailAppContent(): React.JSX.Element {
  const { needsLogin, login, loginInProgress, logout } = useGmail()

  if (needsLogin) return <WelcomeScreen onLogin={login} loginInProgress={loginInProgress} />

  return <AppLayout onLogout={logout} />
}

function App(): React.JSX.Element {
  return (
    <GmailProvider>
      <DriveProvider>
        <MailAppContent />
      </DriveProvider>
    </GmailProvider>
  )
}

export default App
