interface ValidationResult {
  ok: boolean
  valid: boolean | null
  message?: string
  eligibility?: string
  metadata?: {
    name?: string
    email?: string
    phone?: string
    referral_code?: string
    usage?: number
    row_number?: number
    eligibility?: string
    [key: string]: any
  }
  raw?: unknown
}

interface ResultProps {
  result: ValidationResult
  showDebug?: boolean
}

export function Result({ result, showDebug = false }: ResultProps) {
  if (result.valid === true) {
    return (
      <div className="space-y-3">
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-2xl">✅</span>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-green-800">VALID</h3>
              <p className="text-sm text-green-700">{result.message}</p>
            </div>
          </div>
        </div>

        {/* Eligibility Badge */}
        {result.eligibility && (
          <div className="flex justify-center">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              result.eligibility === "Eligible" 
                ? "bg-green-100 text-green-800 border border-green-200" 
                : "bg-yellow-100 text-yellow-800 border border-yellow-200"
            }`}>
              {result.eligibility}
            </span>
          </div>
        )}

        {/* Metadata Details */}
        {result.metadata && (
          <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Details:</h4>
            <dl className="text-xs text-gray-600 space-y-1">
              {result.metadata.name && (
                <div className="flex">
                  <dt className="font-medium w-20">Name:</dt>
                  <dd>{result.metadata.name}</dd>
                </div>
              )}
              {result.metadata.email && (
                <div className="flex">
                  <dt className="font-medium w-20">Email:</dt>
                  <dd>{result.metadata.email}</dd>
                </div>
              )}
              {result.metadata.phone && (
                <div className="flex">
                  <dt className="font-medium w-20">Phone:</dt>
                  <dd>{result.metadata.phone}</dd>
                </div>
              )}
              {result.metadata.referral_code && (
                <div className="flex">
                  <dt className="font-medium w-20">Code:</dt>
                  <dd>{result.metadata.referral_code}</dd>
                </div>
              )}
              {typeof result.metadata.usage === 'number' && (
                <div className="flex">
                  <dt className="font-medium w-20">Usage:</dt>
                  <dd>{result.metadata.usage}</dd>
                </div>
              )}
              {result.metadata.row_number && (
                <div className="flex">
                  <dt className="font-medium w-20">Row:</dt>
                  <dd>{result.metadata.row_number}</dd>
                </div>
              )}
            </dl>
          </div>
        )}

        {showDebug && result.raw && (
          <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
            <h4 className="text-xs font-medium text-gray-700 mb-2">Raw Webhook Response:</h4>
            <pre className="text-xs text-gray-600 overflow-x-auto whitespace-pre-wrap">
              {JSON.stringify(result.raw, null, 2)}
            </pre>
          </div>
        )}
      </div>
    )
  }

  if (result.valid === false) {
    return (
      <div className="space-y-3">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-2xl">❌</span>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-red-800">Invalid / Not Found</h3>
              <p className="text-sm text-red-700">{result.message}</p>
            </div>
          </div>
        </div>
        {showDebug && result.raw && (
          <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
            <h4 className="text-xs font-medium text-gray-700 mb-2">Raw Webhook Response:</h4>
            <pre className="text-xs text-gray-600 overflow-x-auto whitespace-pre-wrap">
              {JSON.stringify(result.raw, null, 2)}
            </pre>
          </div>
        )}
      </div>
    )
  }

  if (result.ok) {
    return (
      <div className="space-y-3">
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-2xl">⚠️</span>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-yellow-800">Unknown Status</h3>
              <p className="text-sm text-yellow-700">{result.message}</p>
            </div>
          </div>
        </div>
        {showDebug && result.raw && (
          <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
            <h4 className="text-xs font-medium text-gray-700 mb-2">Raw Webhook Response:</h4>
            <pre className="text-xs text-gray-600 overflow-x-auto whitespace-pre-wrap">
              {JSON.stringify(result.raw, null, 2)}
            </pre>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <span className="text-2xl">🚫</span>
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-red-800">Error</h3>
            <p className="text-sm text-red-700">{result.message}</p>
            <p className="text-xs text-red-600 mt-1">Please try again in a moment.</p>
          </div>
        </div>
      </div>
      {showDebug && result.raw && (
        <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
          <h4 className="text-xs font-medium text-gray-700 mb-2">Raw Webhook Response:</h4>
          <pre className="text-xs text-gray-600 overflow-x-auto whitespace-pre-wrap">
            {JSON.stringify(result.raw, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}