import React, { useState, useCallback } from 'react'
import { useGmail } from '../../hooks/useGmail'
import LoadingSpinner from '../ui/LoadingSpinner'

interface SearchInputProps {
  placeholder?: string
}

export default function SearchInput({
  placeholder = 'Search emails...'
}: SearchInputProps): React.ReactElement {
  const { searchState, setSearchQuery, loading } = useGmail()
  const [inputValue, setInputValue] = useState(searchState.query)

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        // Reset to normal if searching for empty string, otherwise set the search query
        setSearchQuery(inputValue.trim())
      }
    },
    [inputValue, setSearchQuery]
  )

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }, [])

  const handleClear = useCallback(() => {
    setInputValue('')
    setSearchQuery('')
  }, [setSearchQuery])

  return (
    <div className="relative w-full h-12 bg-bg rounded-20 flex items-center px-6">
      {/* Search icon or loading spinner */}
      {searchState.isActive && loading ? (
        <LoadingSpinner size="sm" color="gray" className="mr-3 flex-shrink-0" />
      ) : (
        <svg
          className="w-4 h-4 text-third mr-3 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      )}

      {/* Search input */}
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        className="flex-1 bg-transparent text-black placeholder-third outline-none"
      />

      {/* Clear button */}
      {inputValue && (
        <button
          onClick={handleClear}
          className="ml-2 p-1 text-third hover:text-secondary transition-colors flex-shrink-0"
          title="Clear search"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}

      {/* Active search indicator */}
      {searchState.isActive && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
          <div className="w-1.5 h-1.5 bg-white rounded-full" />
        </div>
      )}
    </div>
  )
}
