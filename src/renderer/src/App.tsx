import React from 'react'
import { GmailProvider } from './hooks/GmailContext'
import { DriveProvider } from './hooks/DriveContext'
import { AppLayout } from './components/layout'
import { ToastProvider } from './components/ui/Toast/ToastProvider'
import WelcomeScreen from './components/ui/WelcomeScreen'
import { useGmail } from './hooks/useGmail'
import { useZoomKeyboardShortcuts } from './hooks/useZoomKeyboardShortcuts'

function MailAppContent(): React.JSX.Element {
  const { needsLogin, login, loginInProgress, logout } = useGmail()

  // Enable zoom keyboard shortcuts
  useZoomKeyboardShortcuts()

  if (needsLogin) return <WelcomeScreen onLogin={login} loginInProgress={loginInProgress} />

  return <AppLayout onLogout={logout} />
}

function App(): React.JSX.Element {
  return (
    <GmailProvider>
      <DriveProvider>
        <ToastProvider>
          <MailAppContent />
        </ToastProvider>
      </DriveProvider>
    </GmailProvider>
  )
}

export default App
