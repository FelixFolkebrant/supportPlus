import React from 'react'
import IconInbox from '../ui/icons/IconInbox'
import IconReply from '../ui/icons/IconReply'
import IconArchive from '../ui/icons/IconArchive'
import NavButton from './NavButton'
import IconSettings from '../ui/icons/IconSettings'
import ProfileIcon from '../ui/ProfileIcon'
import NavDivider from './NavDivider'
import { useGmail } from '../../hooks/useGmail'

interface NavbarProps {
  onLogout?: () => void
  onActiveNavClick?: () => void
}

export default function Navbar({ onLogout, onActiveNavClick }: NavbarProps): React.ReactElement {
  const { currentView, setCurrentView } = useGmail()

  return (
    <div className="w-24 bg-bg gap-2 flex flex-col items-center py-12">
      <div className="mb-4">
        <ProfileIcon size="lg" onLogout={onLogout} showDropdown={true} />
      </div>
      <NavDivider />
      <NavButton
        active={currentView === 'inbox'}
        onClick={() => (currentView === 'inbox' ? onActiveNavClick?.() : setCurrentView('inbox'))}
      >
        <IconInbox />
      </NavButton>
      <NavButton
        active={currentView === 'replied'}
        onClick={() =>
          currentView === 'replied' ? onActiveNavClick?.() : setCurrentView('replied')
        }
      >
        <IconReply />
      </NavButton>
      <NavButton
        active={currentView === 'archived'}
        onClick={() =>
          currentView === 'archived' ? onActiveNavClick?.() : setCurrentView('archived')
        }
      >
        <IconArchive />
      </NavButton>
      <NavDivider />
      <NavButton
        active={currentView === 'settings'}
        onClick={() =>
          currentView === 'settings' ? onActiveNavClick?.() : setCurrentView('settings')
        }
      >
        <IconSettings />
      </NavButton>
    </div>
  )
}
