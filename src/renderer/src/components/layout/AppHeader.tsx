import type React from 'react'

interface AppHeaderProps {
  onLogout: () => void
}

export function AppHeader({ onLogout }: AppHeaderProps): React.JSX.Element {
  return (
    <div className="flex h-14 items-center justify-between bg-blue-500 text-white text-xl font-bold px-8">
      <span>Navbar?</span>
      <button
        className="px-4 py-2 bg-white text-blue-500 rounded hover:bg-blue-100 font-semibold text-base"
        onClick={onLogout}
      >
        Log out
      </button>
    </div>
  )
}
