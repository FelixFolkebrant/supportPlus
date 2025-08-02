import React, { useState, useRef, useEffect } from 'react'
import { useGmail } from '../../hooks/useGmail'

interface ProfileIconProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  onLogout?: () => void
  showDropdown?: boolean
  showUserName?: boolean
}

export default function ProfileIcon({
  size = 'md',
  className = '',
  onLogout,
  showDropdown = false,
  showUserName = false
}: ProfileIconProps): React.ReactElement {
  const { userProfile } = useGmail()
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

  const handleLogout = (): void => {
    setIsDropdownOpen(false)
    onLogout?.()
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
        <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors duration-150 text-sm"
          >
            Log out
          </button>
        </div>
      )}
    </div>
  )
}
