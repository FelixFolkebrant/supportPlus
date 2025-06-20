export type Personality = {
  id: string
  name: string
  systemPrompt: string
}

export const DEFAULT_PERSONALITY: Personality = {
  id: 'default',
  name: 'Default Assistant',
  systemPrompt: 'You are a helpful assistant.'
}

export const PERSONALITIES: Personality[] = [DEFAULT_PERSONALITY]
