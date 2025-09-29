import React from 'react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  className?: string
  color?: 'blue' | 'white' | 'gray'
  type?: 'svg' | 'circular'
}

export default function LoadingSpinner({
  size = 'md',
  text,
  className = '',
  color = 'blue',
  type = 'svg'
}: LoadingSpinnerProps): React.ReactElement {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  const colorClasses = {
    blue: 'text-blue-500',
    white: 'text-white',
    gray: 'text-gray-600'
  }

  const borderColorClasses = {
    blue: 'border-blue-500 border-t-transparent',
    white: 'border-white border-t-transparent',
    gray: 'border-gray-600 border-t-transparent'
  }

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {type === 'circular' ? (
        <div
          className={`${sizeClasses[size]} animate-spin border-2 ${borderColorClasses[color]} rounded-full`}
        />
      ) : (
        <svg
          className={`${sizeClasses[size]} animate-spin ${colorClasses[color]}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      )}
      {text && <span className={`${textSizeClasses[size]} ${colorClasses[color]}`}>{text}</span>}
    </div>
  )
}
