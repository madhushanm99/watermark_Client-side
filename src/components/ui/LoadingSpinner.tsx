import React from 'react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }

  return (
    <div className={`flex items-center justify-center min-h-screen ${className}`}>
      <div className={`animate-spin rounded-full border-4 border-purple-200 border-t-purple-600 ${sizes[size]}`}></div>
    </div>
  )
}