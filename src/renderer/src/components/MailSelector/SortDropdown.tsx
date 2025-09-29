import React, { useState } from 'react'
import { SortFilter } from '../../hooks/GmailContextValue'
import { useGmail } from '../../hooks/useGmail'
import LoadingSpinner from '../ui/LoadingSpinner'

interface SortDropdownProps {
  className?: string
}

const SortDropdown: React.FC<SortDropdownProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false)
  const { sortState, setSortFilter, loading } = useGmail()

  const sortOptions = [
    { value: 'all' as SortFilter, label: 'All Mails' },
    { value: 'unread-only' as SortFilter, label: 'Unread Only' },
    { value: 'this-week' as SortFilter, label: 'This Week' }
  ]

  const getCurrentLabel = (): string => {
    const currentOption = sortOptions.find((option) => option.value === sortState.filter)
    return currentOption?.label || 'All Mails'
  }

  const handleOptionSelect = (filter: SortFilter): void => {
    setSortFilter(filter)
    setIsOpen(false)
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors ${
          sortState.isActive
            ? 'bg-prim/10 text-prim border border-prim/20'
            : 'bg-bg text-third hover:bg-gray-100'
        }`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
          />
        </svg>
        <span>{getCurrentLabel()}</span>
        {sortState.isActive && loading ? (
          <LoadingSpinner size="sm" color={sortState.isActive ? 'blue' : 'gray'} />
        ) : (
          <svg
            className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          
          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            <div className="py-2">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleOptionSelect(option.value)}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${
                    sortState.filter === option.value ? 'text-prim bg-prim/5' : 'text-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{option.label}</span>
                    {sortState.filter === option.value && (
                      <svg className="w-4 h-4 text-prim" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default SortDropdown