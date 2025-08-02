import React from 'react'
import { useZoom } from '../../hooks/useZoom'

interface ZoomControlsProps {
  className?: string
  showPercentage?: boolean
}

export function ZoomControls({
  className = '',
  showPercentage = true
}: ZoomControlsProps): React.ReactElement {
  const { zoomPercentage, isLoading, zoomIn, zoomOut, resetZoom } = useZoom()

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        onClick={zoomOut}
        disabled={isLoading}
        className="px-2 py-1 text-sm bg-gray-200 hover:bg-gray-300 disabled:opacity-50 rounded transition-colors"
        title="Zoom Out (Ctrl+-)"
      >
        −
      </button>

      {showPercentage && (
        <button
          onClick={resetZoom}
          disabled={isLoading}
          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 disabled:opacity-50 rounded transition-colors min-w-[60px]"
          title="Reset Zoom (Ctrl+0)"
        >
          {zoomPercentage}%
        </button>
      )}

      <button
        onClick={zoomIn}
        disabled={isLoading}
        className="px-2 py-1 text-sm bg-gray-200 hover:bg-gray-300 disabled:opacity-50 rounded transition-colors"
        title="Zoom In (Ctrl++)"
      >
        +
      </button>
    </div>
  )
}
