interface InfoModalProps {
  isOpen: boolean
  onClose: () => void
}

export function InfoModal({ isOpen, onClose }: InfoModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">How It Works</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 rounded"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="space-y-4 text-sm text-gray-600">
          <p>
            This tool queries an n8n workflow which checks a Google Sheet database 
            and responds via webhook with the validation result.
          </p>
          
          <div className="bg-gray-50 p-3 rounded font-mono text-xs">
            <div>Browser → Next.js API → n8n Workflow</div>
            <div className="ml-8">↓</div>
            <div className="ml-4">Google Sheets DB</div>
            <div className="ml-8">↓</div>
            <div>Response ← Webhook ← Validation</div>
          </div>
          
          <p>
            The workflow securely validates referral codes without exposing 
            sensitive data or direct database access to the client.
          </p>
        </div>
        
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  )
}