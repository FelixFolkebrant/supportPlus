import axios from 'axios'
import { getOpenAIApiKey } from './apiKeyManager'

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions'

export async function getHorrorStory(prompt: string): Promise<string> {
  const OPENAI_API_KEY = getOpenAIApiKey()

  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key is not configured. Please add your API key in the settings.')
  }

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
  } catch (error: unknown) {
    console.error('OpenAI API error:', error)

    // Handle quota-specific errors
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as {
        response?: {
          data?: {
            error?: {
              code?: string
              type?: string
              message?: string
            }
          }
        }
      }
      const apiError = axiosError.response?.data?.error
      if (apiError) {
        if (
          apiError.code === 'insufficient_quota' ||
          apiError.type === 'insufficient_quota' ||
          apiError.message?.toLowerCase().includes('quota') ||
          apiError.message?.toLowerCase().includes('billing')
        ) {
          throw new Error(
            `OpenAI API Quota Error: ${apiError.message}\n\nPlease check your OpenAI dashboard at https://platform.openai.com/usage`
          )
        }
        throw new Error(`OpenAI API Error: ${apiError.message}`)
      }
    }

    return 'Error fetching story.'
  }
}

export async function getHorrorStoryStream(
  prompt: string,
  onToken: (token: string) => void
): Promise<void> {
  const OPENAI_API_KEY = getOpenAIApiKey()

  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key is not configured. Please add your API key in the settings.')
  }

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

export async function generateAutoDraft(
  originalEmail: string,
  userInstructions?: string
): Promise<string> {
  const OPENAI_API_KEY = getOpenAIApiKey()

  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key is not configured. Please add your API key in the settings.')
  }

  try {
    const systemPrompt = `You are a professional customer support assistant. Your task is to generate a polite, helpful, and professional email reply based on the original email content.

Guidelines:
- IMPORTANT: Always respond in the SAME LANGUAGE as the original email
- Be courteous and professional
- Address the customer's concerns directly
- Provide helpful solutions or next steps
- Use appropriate email formatting (HTML)
- Keep the tone warm but professional
- If the issue requires escalation or specific expertise, mention that you'll connect them with the right team
- Include appropriate salutations and closings for the language being used
- Use culturally appropriate greetings and sign-offs

The response should be in HTML format suitable for an email editor. Use <p> for paragraphs and <br> for line breaks. Do NOT include any markdown code block markers (such as triple backticks or \`\`\`html). Only return the raw HTML content, not wrapped in any code block.

If the original email is in:
- English: Use professional English business email format
- Spanish: Use formal Spanish business email format (estimado/a, atentamente, etc.)
- French: Use formal French business email format (monsieur/madame, cordialement, etc.)
- German: Use formal German business email format (sehr geehrte/r, mit freundlichen grüßen, etc.)
- Italian: Use formal Italian business email format (egregio/gentile, cordiali saluti, etc.)
- Portuguese: Use formal Portuguese business email format (prezado/a, atenciosamente, etc.)
- And so on for any other language detected

Maintain the same level of formality as the original email.`

    const userPrompt = `Please generate a professional email reply to this customer email:

${originalEmail}

${userInstructions ? `Additional instructions: ${userInstructions}` : ''}

Generate a complete, professional response that addresses their concerns in the SAME LANGUAGE as the original email.`

    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 800,
        temperature: 0.7
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`
        }
      }
    )

    return response.data.choices[0].message.content
  } catch (error: unknown) {
    console.error('Error generating auto-draft:', error)

    // Handle quota-specific errors for auto-draft
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as {
        response?: {
          data?: {
            error?: {
              code?: string
              type?: string
              message?: string
            }
          }
        }
      }
      const apiError = axiosError.response?.data?.error
      if (apiError) {
        if (
          apiError.code === 'insufficient_quota' ||
          apiError.type === 'insufficient_quota' ||
          apiError.message?.toLowerCase().includes('quota') ||
          apiError.message?.toLowerCase().includes('billing')
        ) {
          throw new Error(
            `OpenAI API Quota Error: ${apiError.message}\n\nPlease check your OpenAI dashboard at https://platform.openai.com/usage`
          )
        }
        throw new Error(`OpenAI API Error: ${apiError.message}`)
      }
    }

    throw new Error('Failed to generate auto-draft. Please try again.')
  }
}
