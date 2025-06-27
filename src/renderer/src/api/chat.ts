import { Personality } from '../api/personalities'
import { generateAutoDraft } from './openai'

export type ChatMessage = {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export type ResponseMailUpdateFunction = (mailId: string, newContent: string) => void
export type MailEditingStateFunction = (isEditing: boolean) => void

// Function definitions for OpenAI function calling
const RESPONSE_MAIL_FUNCTIONS = [
  {
    name: 'update_response_mail',
    description: 'Update the content of the response mail being composed',
    parameters: {
      type: 'object',
      properties: {
        content: {
          type: 'string',
          description: 'The new HTML content for the response mail'
        },
        explanation: {
          type: 'string',
          description: 'A brief explanation of what changes were made'
        }
      },
      required: ['content', 'explanation']
    }
  },
  {
    name: 'generate_auto_draft',
    description:
      'Generate a professional email response draft based on the original email content and user instructions',
    parameters: {
      type: 'object',
      properties: {
        userInstructions: {
          type: 'string',
          description:
            'The user\'s specific instructions for the email draft (e.g., "polite response", "formal reply", "request more information")'
        },
        explanation: {
          type: 'string',
          description: 'A brief explanation of what type of draft was generated'
        }
      },
      required: ['userInstructions', 'explanation']
    }
  }
]

export async function chatWithOpenAI(
  messages: ChatMessage[],
  personality: Personality,
  onToken: (token: string) => void,
  selectedMailId?: string,
  updateResponseMail?: ResponseMailUpdateFunction,
  setMailEditingState?: MailEditingStateFunction,
  originalEmailContent?: string
): Promise<void> {
  const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY

  if (!OPENAI_API_KEY) {
    console.error('VITE_OPENAI_API_KEY environment variable is not set')
    throw new Error('OpenAI API key is not configured')
  }

  const systemMessage = { role: 'system', content: personality.systemPrompt }
  const openaiMessages = [systemMessage, ...messages]

  console.log('Sending request to OpenAI with', openaiMessages.length, 'messages')

  const hasMailContext = selectedMailId && updateResponseMail

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
      max_tokens: 400,
      ...(hasMailContext && {
        functions: RESPONSE_MAIL_FUNCTIONS,
        function_call: 'auto'
      })
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
  const functionCall: { name?: string; arguments?: string } = {}

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
            if (data === '[DONE]') {
              // Handle completed function call
              if (
                functionCall.name === 'update_response_mail' &&
                functionCall.arguments &&
                updateResponseMail &&
                selectedMailId
              ) {
                try {
                  const args = JSON.parse(functionCall.arguments)
                  updateResponseMail(selectedMailId, args.content)
                  onToken(`\n\n✅ **Mail updated:** ${args.explanation}`)
                  // Clear editing state after the update is complete
                  if (setMailEditingState) {
                    setMailEditingState(false)
                  }
                } catch (e) {
                  console.error('Error parsing function arguments:', e)
                  // Clear editing state on error too
                  if (setMailEditingState) {
                    setMailEditingState(false)
                  }
                }
              } else if (
                functionCall.name === 'generate_auto_draft' &&
                functionCall.arguments &&
                updateResponseMail &&
                selectedMailId &&
                originalEmailContent
              ) {
                try {
                  const args = JSON.parse(functionCall.arguments)
                  // Set editing state when generating auto-draft
                  if (setMailEditingState) {
                    setMailEditingState(true)
                  }
                  // Generate the auto-draft using the original email content
                  const draftContent = await generateAutoDraft(
                    originalEmailContent,
                    args.userInstructions
                  )
                  updateResponseMail(selectedMailId, draftContent)
                  onToken(`\n\n✨ **Auto-draft generated:** ${args.explanation}`)
                  // Clear editing state after the draft is complete
                  if (setMailEditingState) {
                    setMailEditingState(false)
                  }
                } catch (e) {
                  console.error('Error generating auto-draft:', e)
                  onToken('\n\n❌ **Failed to generate auto-draft.** Please try again.')
                  // Clear editing state on error too
                  if (setMailEditingState) {
                    setMailEditingState(false)
                  }
                }
              }
              return
            }
            try {
              const json = JSON.parse(data)
              const delta = json.choices?.[0]?.delta

              // Handle function call
              if (delta?.function_call) {
                if (delta.function_call.name) {
                  functionCall.name = delta.function_call.name
                  // Set editing state when we start receiving a function call for updating mail or generating auto-draft
                  if (
                    (delta.function_call.name === 'update_response_mail' ||
                      delta.function_call.name === 'generate_auto_draft') &&
                    setMailEditingState
                  ) {
                    setMailEditingState(true)
                  }
                }
                if (delta.function_call.arguments) {
                  functionCall.arguments =
                    (functionCall.arguments || '') + delta.function_call.arguments
                }
              }

              // Handle regular content
              const token = delta?.content
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
