import { getOpenAIApiKey } from './apiKeyManager'

export interface DiagnosticResult {
  success: boolean
  message: string
  details?: unknown
}

export async function testOpenAIConnection(): Promise<DiagnosticResult> {
  const apiKey = getOpenAIApiKey()

  if (!apiKey) {
    return {
      success: false,
      message: 'No API key configured'
    }
  }

  try {
    // Test with a simple, low-cost model first
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 5
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      let errorDetails
      try {
        errorDetails = JSON.parse(errorText)
      } catch {
        errorDetails = { raw: errorText }
      }

      return {
        success: false,
        message: `API Error: ${response.status} ${response.statusText}`,
        details: errorDetails
      }
    }

    const data = await response.json()
    return {
      success: true,
      message: 'API connection successful',
      details: { model: 'gpt-3.5-turbo', response: data }
    }
  } catch (error) {
    return {
      success: false,
      message: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      details: error
    }
  }
}

export async function testGPT4Access(): Promise<DiagnosticResult> {
  const apiKey = getOpenAIApiKey()

  if (!apiKey) {
    return {
      success: false,
      message: 'No API key configured'
    }
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 5
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      let errorDetails
      try {
        errorDetails = JSON.parse(errorText)
      } catch {
        errorDetails = { raw: errorText }
      }

      return {
        success: false,
        message: `GPT-4o Access Error: ${response.status} ${response.statusText}`,
        details: errorDetails
      }
    }

    const data = await response.json()
    return {
      success: true,
      message: 'GPT-4o access successful',
      details: { model: 'gpt-4o', response: data }
    }
  } catch (error) {
    return {
      success: false,
      message: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      details: error
    }
  }
}

export async function checkAccountLimits(): Promise<DiagnosticResult> {
  const apiKey = getOpenAIApiKey()

  if (!apiKey) {
    return {
      success: false,
      message: 'No API key configured'
    }
  }

  try {
    // Check account usage and limits
    const response = await fetch('https://api.openai.com/v1/usage', {
      headers: {
        Authorization: `Bearer ${apiKey}`
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      return {
        success: false,
        message: `Usage API Error: ${response.status} ${response.statusText}`,
        details: { raw: errorText }
      }
    }

    const data = await response.json()
    return {
      success: true,
      message: 'Account limits check successful',
      details: data
    }
  } catch (error) {
    return {
      success: false,
      message: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      details: error
    }
  }
}

export async function runFullDiagnostics(): Promise<{
  connection: DiagnosticResult
  gpt4Access: DiagnosticResult
  accountLimits: DiagnosticResult
}> {
  console.log('Running OpenAI API diagnostics...')

  const connection = await testOpenAIConnection()
  console.log('Connection test:', connection)

  const gpt4Access = await testGPT4Access()
  console.log('GPT-4o access test:', gpt4Access)

  const accountLimits = await checkAccountLimits()
  console.log('Account limits check:', accountLimits)

  return {
    connection,
    gpt4Access,
    accountLimits
  }
}
