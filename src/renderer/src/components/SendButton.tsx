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
        px-6 py-2.5 rounded-md font-medium transition-all duration-200 shadow-sm
        ${
          disabled || loading
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-200'
            : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 border border-blue-600 hover:shadow-md'
        }
      `}
    >
      {loading ? (
        <div className="flex items-center space-x-2">
          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
          <span>Sending...</span>
        </div>
      ) : (
        'Send Reply'
      )}
    </button>
  )
}
