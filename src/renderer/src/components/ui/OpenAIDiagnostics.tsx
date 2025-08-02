import { useState } from 'react'
import { runFullDiagnostics, DiagnosticResult } from '../../api/diagnostics'
import { getOpenAIApiKey } from '../../api/apiKeyManager'

interface DiagnosticsResults {
  connection: DiagnosticResult
  gpt4Access: DiagnosticResult
  accountLimits: DiagnosticResult
}

export function OpenAIDiagnostics(): React.JSX.Element {
  const [results, setResults] = useState<DiagnosticsResults | null>(null)
  const [loading, setLoading] = useState(false)

  const handleRunDiagnostics = async (): Promise<void> => {
    setLoading(true)
    try {
      const diagnostics = await runFullDiagnostics()
      setResults(diagnostics)
    } catch (error) {
      console.error('Diagnostics failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const apiKey = getOpenAIApiKey()

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-4xl">
      <h2 className="text-2xl font-bold mb-4">OpenAI API Diagnostics</h2>

      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">API Key Status</h3>
        <p
          className={`p-2 rounded ${
            apiKey ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {apiKey ? `API Key: sk-...${apiKey.slice(-4)}` : 'No API key configured'}
        </p>
      </div>

      <button
        onClick={handleRunDiagnostics}
        disabled={loading || !apiKey}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
      >
        {loading ? 'Running Diagnostics...' : 'Run Diagnostics'}
      </button>

      {results && (
        <div className="mt-6 space-y-4">
          <DiagnosticCard title="Connection Test" result={results.connection} />
          <DiagnosticCard title="GPT-4o Access Test" result={results.gpt4Access} />
          <DiagnosticCard title="Account Limits Check" result={results.accountLimits} />
        </div>
      )}
    </div>
  )
}

function DiagnosticCard({
  title,
  result
}: {
  title: string
  result: DiagnosticResult
}): React.JSX.Element {
  return (
    <div
      className={`p-4 rounded-lg border-l-4 ${
        result.success ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'
      }`}
    >
      <h4 className={`font-semibold ${result.success ? 'text-green-800' : 'text-red-800'}`}>
        {title}
      </h4>
      <p className={`mt-1 ${result.success ? 'text-green-700' : 'text-red-700'}`}>
        {result.message}
      </p>
    </div>
  )
}
