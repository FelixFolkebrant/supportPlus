import * as React from 'react'

interface SendButtonProps {
  onSend: () => void
  disabled: boolean
  loading: boolean
}

export const SendButton: React.FC<SendButtonProps> = ({ onSend, disabled, loading }) => {
  return (
    <button
      onClick={onSend}
      disabled={disabled || loading}
      className={`
        px-4 py-2 rounded-md font-medium transition-colors
        ${
          disabled || loading
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
        }
      `}
    >
      {loading ? 'Sending...' : 'Send Reply'}
    </button>
  )
}