import React from 'react'
import { SETTINGS_ITEMS } from './types'
import { SettingsPreview } from './SettingsPreview'

interface SettingsSelectorProps {
  selectedSettingId: string | null
  setSelectedSettingId: (id: string) => void
}

export function SettingsSelector({
  selectedSettingId,
  setSelectedSettingId
}: SettingsSelectorProps): React.ReactElement {
  return (
    <div className="w-full max-w-xl h-full flex flex-col bg-white shadow-xl border overflow-hidden">
      <div className="flex-col items-center px-8 py-8 border-b border-third/20">
        <div className="w-full pb-4 flex justify-between pt-6">
          <div className="flex items-end gap-4">
            <h2 className="text-2xl text-black">Settings</h2>
            <h3 className="text-sm text-third pb-0.5">{SETTINGS_ITEMS.length} categories</h3>
          </div>
        </div>
        <div className="w-full h-12 bg-bg items-center rounded-20 flex px-6">
          <p className="text-third">Search settings</p>
        </div>
      </div>
      <ul className="flex flex-col flex-1 overflow-y-auto scrollbar-hide bg-white">
        {SETTINGS_ITEMS.map((item) => (
          <li
            key={item.id}
            className={`rounded-lg transition-all opacity-60 hover:opacity-100 ${
              selectedSettingId === item.id ? 'opacity-100' : ''
            }`}
          >
            <div
              onClick={() => setSelectedSettingId(item.id)}
              className="cursor-pointer rounded-lg"
            >
              <SettingsPreview item={item} active={selectedSettingId === item.id} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
