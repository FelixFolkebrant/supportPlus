import React from 'react'
import { SettingsItem } from './types'

interface SettingsPreviewProps {
  item: SettingsItem
  active: boolean
}

export function SettingsPreview({ item, active }: SettingsPreviewProps): React.ReactElement {
  return (
    <div
      className={`px-6 py-4 border-b border-gray-100 ${active ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
    >
      <div className="flex items-center">
        <div className="flex-1">
          <h3 className={`text-sm font-medium ${active ? 'text-blue-900' : 'text-gray-900'}`}>
            {item.name}
          </h3>
          {item.description && (
            <p className={`text-xs mt-1 ${active ? 'text-blue-700' : 'text-gray-500'}`}>
              {item.description}
            </p>
          )}
        </div>
        {active && (
          <div className="ml-2">
            <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 111.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}
      </div>
    </div>
  )
}
