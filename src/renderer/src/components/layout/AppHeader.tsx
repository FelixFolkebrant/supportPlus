import React from 'react'
import { ZoomControls } from '../ui/ZoomControls'
import ReloadButton from '../ui/ReloadButton'

export function AppHeader(): React.JSX.Element {
  const handleReload = (): void => {
    window.location.reload()
  }

  return (
    <div
      className="flex h-14 pointer-events-none absolute bg-transparent w-full z-100 items-center justify-between text-black text-xl font-bold"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      <div className="h-full flex items-center pointer-events-auto">
        {/* <Logo className="h-full w-auto" /> */}
      </div>
      <div
        className="flex items-center gap-2 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-auto"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        {/* Zoom controls */}
        <ZoomControls className="mr-2" showPercentage={true} />

        {/* Reload button */}
        <ReloadButton onClick={handleReload} size={16} title="Reload page (Ctrl+R)" />

        {/* Window control buttons */}
        <button
          aria-label="Minimize"
          className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-200 transition"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
          onClick={() => window.api?.minimize?.()}
        >
          <svg width="12" height="2" viewBox="0 0 12 2" fill="none">
            <rect width="12" height="2" rx="1" fill="#333" />
          </svg>
        </button>
        <button
          aria-label="Maximize"
          className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-200 transition"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
          onClick={() => window.api?.maximize?.()}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <rect x="1" y="1" width="10" height="10" rx="2" stroke="#333" strokeWidth="2" />
          </svg>
        </button>
        <button
          aria-label="Close"
          className="w-8 h-8 flex items-center justify-center rounded hover:bg-red-500 hover:text-white transition"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
          onClick={() => window.api?.close?.()}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M2 2L10 10M10 2L2 10"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}
