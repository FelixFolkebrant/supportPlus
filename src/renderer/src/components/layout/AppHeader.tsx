import React, { useState, useRef, useEffect } from 'react'

interface AppHeaderProps {
  onLogout: () => void
  userName: string
  profilePicUrl: string
}

export function AppHeader({
  onLogout,
  userName,
  profilePicUrl
}: AppHeaderProps): React.JSX.Element {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2)
  }

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>): void => {
    e.currentTarget.style.display = 'none'
    const fallback = e.currentTarget.nextElementSibling as HTMLElement
    if (fallback) {
      fallback.style.display = 'flex'
    }
  }

  const toggleDropdown = (): void => {
    setIsDropdownOpen(!isDropdownOpen)
  }

  const handleLogout = (): void => {
    setIsDropdownOpen(false)
    onLogout()
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div
      className="flex h-14 pointer-events-none absolute bg-transparent w-full z-100 items-center justify-between text-black text-xl font-bold"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      <div className="h-full flex items-center pointer-events-auto">
        {/* <Logo className="h-full w-auto" /> */}
      </div>
      <div
        className="flex items-center gap-2 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-auto"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        {/* Profile section moved here */}
        <div
          className="relative pointer-events-auto pr-2"
          ref={dropdownRef}
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          <button
            onClick={toggleDropdown}
            className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors duration-200 focus:outline-none"
          >
            <span className="text-base font-normal">{userName}</span>
            <div className="relative w-8 h-8">
              {profilePicUrl ? (
                <img
                  src={profilePicUrl}
                  alt="Profile"
                  className="w-8 h-8 rounded-full border-2 border-white object-cover"
                  onError={handleImageError}
                />
              ) : null}
              <div
                className="w-8 h-8 rounded-full border-2 border-white bg-blue-600 items-center justify-center text-xs font-semibold"
                style={{ display: profilePicUrl ? 'none' : 'flex' }}
              >
                {getInitials(userName)}
              </div>
            </div>
            <svg
              className={`w-4 h-4 transition-transform duration-200 ${
                isDropdownOpen ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors duration-150 text-sm"
              >
                Log out
              </button>
            </div>
          )}
        </div>
        {/* Window control buttons */}
        <button
          aria-label="Minimize"
          className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-200 transition"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
          onClick={() => window.api?.minimize?.()}
        >
          <svg width="12" height="2" viewBox="0 0 12 2" fill="none">
            <rect width="12" height="2" rx="1" fill="#333" />
          </svg>
        </button>
        <button
          aria-label="Maximize"
          className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-200 transition"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
          onClick={() => window.api?.maximize?.()}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <rect x="1" y="1" width="10" height="10" rx="2" stroke="#333" strokeWidth="2" />
          </svg>
        </button>
        <button
          aria-label="Close"
          className="w-8 h-8 flex items-center justify-center rounded hover:bg-red-500 hover:text-white transition"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
          onClick={() => window.api?.close?.()}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M2 2L10 10M10 2L2 10"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}
