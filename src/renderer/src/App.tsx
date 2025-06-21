import React from 'react'
import { GmailProvider } from './hooks/GmailContext'
import { AppLayout } from './components/layout'
import LoadingScreen from './components/ui/LoadingScreen'
import WelcomeScreen from './components/ui/WelcomeScreen'
import { useGmail } from './hooks/useGmail'

function MailAppContent(): React.JSX.Element {
  const { loading, needsLogin, login, loginInProgress, logout } = useGmail()

  if (loading) return <LoadingScreen />
  if (needsLogin) return <WelcomeScreen onLogin={login} loginInProgress={loginInProgress} />

  return <AppLayout onLogout={logout} />
}

function App(): React.JSX.Element {
  return (
    <GmailProvider>
      <MailAppContent />
    </GmailProvider>
  )
}

export default App
