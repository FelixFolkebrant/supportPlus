import type React from 'react'
import { AppHeader } from './AppHeader'
import { MainContent } from './MainContent'
import { useGmail } from '../../hooks/useGmail'

interface AppLayoutProps {
  onLogout: () => void
}

export function AppLayout({ onLogout }: AppLayoutProps): React.JSX.Element {
  const { userProfile } = useGmail()

  return (
    <div className="h-screen w-screen">
      <AppHeader
        onLogout={onLogout}
        userName={userProfile?.name || 'User'}
        profilePicUrl={userProfile?.picture || ''}
      />
      <MainContent />
    </div>
  )
}
