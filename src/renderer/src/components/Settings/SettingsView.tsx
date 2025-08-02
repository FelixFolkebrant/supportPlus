import React from 'react'
import { SETTINGS_ITEMS } from './types'
import { ChatSettings } from './ChatSettings'
import { GoogleDriveSettings } from './GoogleDriveSettings'
import { GeneralSettings } from './GeneralSettings'

interface SettingsViewProps {
  selectedSettingId: string | null
}

export function SettingsView({ selectedSettingId }: SettingsViewProps): React.ReactElement {
  const selectedSetting = SETTINGS_ITEMS.find((item) => item.id === selectedSettingId)

  const renderSettingPanel = (): React.ReactElement => {
    switch (selectedSettingId) {
      case 'chat':
        return <ChatSettings />
      case 'google':
        return <GoogleDriveSettings />
      case 'general':
        return <GeneralSettings />
      default:
        return (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Settings Category</h3>
              <p className="text-gray-600">
                Choose a category from the left panel to configure your preferences.
              </p>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="flex-1 h-full min-w-0 flex flex-col bg-white shadow-lg border-l border-gray-200">
      {selectedSetting && (
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h1 className="text-xl font-semibold text-gray-900">{selectedSetting.name}</h1>
          {selectedSetting.description && (
            <p className="text-sm text-gray-600 mt-1">{selectedSetting.description}</p>
          )}
        </div>
      )}
      
      {renderSettingPanel()}
    </div>
  )
}
