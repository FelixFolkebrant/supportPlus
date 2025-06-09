import axios from 'axios'

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions'

export async function getHorrorStory(prompt: string): Promise<string> {
  try {
    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 400
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`
        }
      }
    )
    return response.data.choices[0].message.content
  } catch {
    return 'Error fetching story.'
  }
}

export async function getHorrorStoryStream(
  prompt: string,
  onToken: (token: string) => void
): Promise<void> {
  const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: prompt }
      ],
      stream: true,
      max_tokens: 400
    })
  })

  if (!response.body) throw new Error('No response body')

  const reader = response.body.getReader()
  const decoder = new TextDecoder('utf-8')
  let done = false
  let buffer = ''

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
          } catch {
            // ignore malformed lines
          }
        }
      }
    }
  }
}
