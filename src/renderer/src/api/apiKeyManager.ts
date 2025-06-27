// API Key management utility
const OPENAI_API_KEY_STORAGE_KEY = 'supportplus_openai_api_key'

export function getOpenAIApiKey(): string | null {
  // First check if user has provided their own API key
  const userApiKey = localStorage.getItem(OPENAI_API_KEY_STORAGE_KEY)
  console.log(
    'User API key from localStorage:',
    userApiKey ? 'sk-...' + userApiKey.slice(-4) : 'null'
  )
  if (userApiKey && userApiKey.startsWith('sk-')) {
    return userApiKey
  }

  // Fall back to environment variable (for development) - but only if it's a valid OpenAI key
  const envApiKey = import.meta.env.VITE_OPENAI_API_KEY
  console.log('Environment API key:', envApiKey ? 'sk-...' + envApiKey.slice(-4) : 'null')
  if (envApiKey && envApiKey.startsWith('sk-')) {
    return envApiKey
  }

  return null
}

export function setUserOpenAIApiKey(apiKey: string): void {
  if (apiKey.trim() && apiKey.trim().startsWith('sk-')) {
    localStorage.setItem(OPENAI_API_KEY_STORAGE_KEY, apiKey.trim())
  } else {
    localStorage.removeItem(OPENAI_API_KEY_STORAGE_KEY)
    if (apiKey.trim() && !apiKey.trim().startsWith('sk-')) {
      throw new Error('Invalid OpenAI API key format. API keys should start with "sk-"')
    }
  }
}

export function getUserOpenAIApiKey(): string | null {
  return localStorage.getItem(OPENAI_API_KEY_STORAGE_KEY)
}

export function clearUserOpenAIApiKey(): void {
  localStorage.removeItem(OPENAI_API_KEY_STORAGE_KEY)
}

export function hasValidOpenAIApiKey(): boolean {
  const apiKey = getOpenAIApiKey()
  return !!apiKey && apiKey.startsWith('sk-')
}
