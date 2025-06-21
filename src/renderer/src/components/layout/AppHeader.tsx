import type React from 'react'
import { useState, useRef, useEffect } from 'react'
import Logo from '../ui/Logo'

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
    <div className="flex h-14 items-center justify-between bg-white text-black text-xl font-bold">
      <Logo className="h-full" />
      <div className="relative pr-4" ref={dropdownRef}>
        <button
          onClick={toggleDropdown}
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 focus:outline-none"
        >
          <span className="text-base font-normal">{userName}</span>
          <div className="relative w-8 h-8">
            <img
              src={profilePicUrl}
              alt="Profile"
              className="w-8 h-8 rounded-full border-2 border-white object-cover"
              onError={handleImageError}
            />
            <div
              className="w-8 h-8 rounded-full border-2 border-white bg-blue-600 items-center justify-center text-xs font-semibold"
              style={{ display: 'none' }}
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
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
    </div>
  )
}
