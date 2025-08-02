import type React from 'react'
import { AppHeader } from './AppHeader'
import { MainContent } from './MainContent'

interface AppLayoutProps {
  onLogout: () => void
}

export function AppLayout({ onLogout }: AppLayoutProps): React.JSX.Element {
  return (
    <div className="h-screen w-screen">
      <AppHeader />
      <MainContent onLogout={onLogout} />
    </div>
  )
}
