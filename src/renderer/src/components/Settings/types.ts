export interface SettingsItem {
  id: string
  name: string
  description?: string
}

export const SETTINGS_ITEMS: SettingsItem[] = [
  {
    id: 'chat',
    name: 'Chat',
    description: 'OpenAI API and chat configuration'
  },
  {
    id: 'google',
    name: 'Google Drive',
    description: 'Knowledge base and document integration'
  },
  {
    id: 'general',
    name: 'General',
    description: 'Application preferences'
  }
]
