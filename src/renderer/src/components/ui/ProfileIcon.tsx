import React, { useState, useRef, useEffect } from 'react'
import { useGmail } from '../../hooks/useGmail'

interface ProfileIconProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  showDropdown?: boolean
  showUserName?: boolean
}

export default function ProfileIcon({
  size = 'md',
  className = '',
  showDropdown = false,
  showUserName = false
}: ProfileIconProps): React.ReactElement {
  const { userProfile, accounts, activeAccount, switchAccount, addAccount } = useGmail()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  }

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
    if (showDropdown) {
      setIsDropdownOpen(!isDropdownOpen)
    }
  }

  // Logout is only exposed via Settings now

  const handleSwitch = async (email: string): Promise<void> => {
    setIsDropdownOpen(false)
    await switchAccount(email)
  }

  const handleAddAccount = async (): Promise<void> => {
    setIsDropdownOpen(false)
    await addAccount()
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
    return undefined
  }, [showDropdown])

  if (!userProfile) {
    // Fallback when no user profile is available
    return (
      <div
        className={`${sizeClasses[size]} bg-third/20 rounded-full flex items-center justify-center ${className}`}
      >
        <div className="w-1/2 h-1/2 bg-third/40 rounded-full" />
      </div>
    )
  }

  const profileContent = (
    <div className={`relative ${sizeClasses[size]}`}>
      {userProfile.picture ? (
        <img
          src={userProfile.picture}
          alt={`${userProfile.name}'s profile`}
          className="w-full h-full rounded-full object-cover border border-third/20"
          onError={handleImageError}
        />
      ) : null}
      <div
        className={`w-full h-full rounded-full border border-third/20 bg-prim flex items-center justify-center text-xs font-semibold text-white ${
          userProfile.picture ? 'hidden' : 'flex'
        }`}
      >
        {getInitials(userProfile.name)}
      </div>
    </div>
  )

  if (!showDropdown) {
    return <div className={className}>{profileContent}</div>
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className={`flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors duration-200 focus:outline-none ${
          showUserName ? '' : 'p-0'
        }`}
      >
        {showUserName && <span className="text-base font-normal">{userProfile.name}</span>}
        {profileContent}
      </button>

      {isDropdownOpen && (
        <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-white rounded-xl shadow-lg border border-gray-200 p-2 z-50">
          <div className="flex items-center gap-2">
            {accounts.map((acc) => (
              <button
                key={acc.email}
                onClick={() => handleSwitch(acc.email)}
                title={acc.email}
                className={`relative rounded-full p-[2px] transition-shadow ${
                  acc.email === activeAccount ? 'ring-2 ring-blue-500 ring-offset-2' : ''
                }`}
              >
                <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center text-[10px] font-semibold text-gray-700">
                  {acc.picture ? (
                    <img
                      src={acc.picture}
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    (acc.name || acc.email)
                      .split(' ')
                      .map((w) => w.charAt(0).toUpperCase())
                      .join('')
                      .slice(0, 2)
                  )}
                </div>
              </button>
            ))}
            <button
              onClick={handleAddAccount}
              title="Add account"
              className="w-9 h-9 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center border border-dashed border-gray-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="w-4 h-4"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16M4 12h16" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
