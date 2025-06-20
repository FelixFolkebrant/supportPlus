import { Personality } from '../api/personalities'

export type ChatMessage = {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export async function chatWithOpenAI(
  messages: ChatMessage[],
  personality: Personality,
  onToken: (token: string) => void
): Promise<void> {
  const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY

  if (!OPENAI_API_KEY) {
    console.error('VITE_OPENAI_API_KEY environment variable is not set')
    throw new Error('OpenAI API key is not configured')
  }

  const systemMessage = { role: 'system', content: personality.systemPrompt }
  const openaiMessages = [systemMessage, ...messages]

  console.log('Sending request to OpenAI with', openaiMessages.length, 'messages')

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: openaiMessages,
      stream: true,
      max_tokens: 400
    })
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('OpenAI API error:', response.status, response.statusText, errorText)
    throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`)
  }

  if (!response.body) throw new Error('No response body')

  const reader = response.body.getReader()
  const decoder = new TextDecoder('utf-8')
  let done = false
  let buffer = ''

  try {
    while (!done) {
      const { value, done: doneReading } = await reader.read()
      done = doneReading
      if (value) {
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''
        for (const line of lines) {
          if (line.trim().startsWith('data:')) {
            const data = line.replace('data: ', '').trim()
            if (data === '[DONE]') return
            try {
              const json = JSON.parse(data)
              const token = json.choices?.[0]?.delta?.content
              if (token) onToken(token)
            } catch (parseError) {
              console.warn('Failed to parse streaming response line:', data, parseError)
              // ignore malformed lines
            }
          }
        }
      }
    }
  } catch (streamError) {
    console.error('Error reading stream:', streamError)
    throw streamError
  } finally {
    reader.releaseLock()
  }
}
