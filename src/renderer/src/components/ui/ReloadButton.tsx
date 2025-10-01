import React from 'react'
import IconReload from './icons/IconReload'

interface ReloadButtonProps {
  onClick: () => void
  disabled?: boolean
  isLoading?: boolean
  size?: number
  className?: string
  title?: string
}

const ReloadButton: React.FC<ReloadButtonProps> = ({
  onClick,
  disabled = false,
  isLoading = false,
  size = 20,
  className = '',
  title = 'Reload'
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`p-2 rounded-lg transition-colors hover:bg-gray-100 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      title={title}
    >
      <IconReload
        size={size}
        className={`transition-transform duration-700 ease-in-out ${
          isLoading ? 'animate-spin' : ''
        }`}
      />
    </button>
  )
}

export default ReloadButton
