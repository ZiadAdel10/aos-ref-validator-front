'use client'

import { useState } from 'react'
import { Result } from '@/components/Result'
import { MadeByChip } from '@/components/MadeByChip'
import { InfoModal } from '@/components/InfoModal'

interface ValidationResult {
  ok: boolean
  valid: boolean | null
  message?: string
  metadata?: any
  raw?: unknown
}

export default function Home() {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ValidationResult | null>(null)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [showDebug, setShowDebug] = useState(false)

  const validateCode = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const trimmedCode = code.trim()
    if (!trimmedCode) {
      setError('Please enter a referral code')
      return
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(trimmedCode)) {
      setError('Code can only contain letters, numbers, dashes, and underscores')
      return
    }

    setError('')
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: trimmedCode }),
      })

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setResult({
        ok: false,
        valid: null,
        message: 'Network error. Please check your connection and try again.',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      validateCode(e as any)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            AOS x ScaleFlow Referral Validator
          </h1>
          <p className="text-gray-600 text-sm">
            Type a referral code and validate it against our secure database.
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <form onSubmit={validateCode} className="space-y-4">
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                Referral Code
              </label>
              <input
                id="code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter referral code..."
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  error ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={loading}
                aria-describedby={error ? 'code-error' : 'code-help'}
              />
              {error && (
                <p id="code-error" className="mt-1 text-sm text-red-600" role="alert">
                  {error}
                </p>
              )}
              <p id="code-help" className="mt-1 text-xs text-gray-500">
                Press Enter to validate
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !code.trim()}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Validating...
                </>
              ) : (
                'Validate'
              )}
            </button>
          </form>

          {/* Result Area */}
          {(loading || result) && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              {loading ? (
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ) : (
                result && <Result result={result} showDebug={showDebug} />
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center text-sm mb-4">
          <button
            onClick={() => setShowModal(true)}
            className="text-blue-600 hover:text-blue-800 underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
          >
            What is this?
          </button>
          <MadeByChip />
        </div>

        {/* Debug Toggle */}
        <div className="flex justify-center">
          <label className="flex items-center text-xs text-gray-500">
            <input
              type="checkbox"
              checked={showDebug}
              onChange={(e) => setShowDebug(e.target.checked)}
              className="mr-2 rounded"
            />
            Show raw webhook response
          </label>
        </div>

        {/* Info Modal */}
        <InfoModal isOpen={showModal} onClose={() => setShowModal(false)} />
      </div>
    </div>
  )
}