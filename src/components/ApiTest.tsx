import React, { useState, useEffect } from 'react'
import { healthCheck } from '../lib/api'

const ApiTest: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState<string>('')

  useEffect(() => {
    const testConnection = async () => {
      try {
        const response = await healthCheck()
        setStatus('success')
        setMessage((response as any).message || 'API connection successful')
      } catch (error) {
        setStatus('error')
        setMessage(error instanceof Error ? error.message : 'Failed to connect to API')
      }
    }

    testConnection()
  }, [])

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        API Connection Test
      </h3>
      <div className="flex items-center space-x-2">
        <div className={`w-3 h-3 rounded-full ${
          status === 'loading' ? 'bg-yellow-400' : 
          status === 'success' ? 'bg-green-400' : 'bg-red-400'
        }`} />
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {status === 'loading' ? 'Testing connection...' : message}
        </span>
      </div>
    </div>
  )
}

export default ApiTest 