import React from 'react'
import LoadingSpinner from '../ui/LoadingSpinner'

interface SendButtonProps {
  onSend: () => void
  onAutoDraft?: () => void
  disabled: boolean
  loading: boolean
  autoDrafting?: boolean
  autoDraftDisabled?: boolean
}

export const SendButton: React.FC<SendButtonProps> = ({
  onSend,
  onAutoDraft,
  disabled,
  loading,
  autoDrafting = false,
  autoDraftDisabled = false
}) => {
  return (
    <div className="flex items-center space-x-3">
      {onAutoDraft && (
        <button
          onClick={onAutoDraft}
          disabled={autoDraftDisabled || loading || autoDrafting}
          className={`
            px-4 py-2.5 rounded-md font-medium transition-all duration-200 shadow-sm
            ${
              autoDraftDisabled || loading || autoDrafting
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-200'
                : 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800 border border-green-600 hover:shadow-md'
            }
          `}
        >
          {autoDrafting ? (
            <LoadingSpinner size="sm" text="Auto-drafting..." color="white" type="circular" />
          ) : (
            'Auto-draft'
          )}
        </button>
      )}

      <button
        onClick={onSend}
        disabled={disabled || loading || autoDrafting}
        className={`
          px-6 py-2.5 rounded-md font-medium transition-all duration-200 shadow-sm
          ${
            disabled || loading || autoDrafting
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-200'
              : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 border border-blue-600 hover:shadow-md'
          }
        `}
      >
        {loading ? (
          <LoadingSpinner size="sm" text="Sending..." color="white" type="circular" />
        ) : (
          'Send Reply'
        )}
      </button>
    </div>
  )
}
