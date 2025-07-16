'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useFiles } from '@/contexts/FileContext'
import { useNavigate, useLocation } from 'react-router-dom'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Shield, FileText, CheckCircle, XCircle, RefreshCw, ChevronLeft, ChevronRight, Download, Trash2, Search, Eye, AlertTriangle } from 'lucide-react'

export default function VerifyPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const { files, updateFile, deleteFile } = useFiles()
  const navigate = useNavigate()
  const location = useLocation()
  const [isVerifying, setIsVerifying] = useState(false)
  const [verifyingFile, setVerifyingFile] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [verificationResult, setVerificationResult] = useState<{
    found: boolean
    file: string
  } | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const filesPerPage = 10

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login')
    }
  }, [isAuthenticated, isLoading, navigate])

  useEffect(() => {
    // Check if coming from dashboard with recent files or search query
    if (location.state?.fromDashboard && location.state?.recentFiles) {
      console.log('Navigated from dashboard with recent files:', location.state.recentFiles)
    }
    
    // Set search query if coming from global search
    if (location.state?.searchQuery) {
      setSearchQuery(location.state.searchQuery)
    }
  }, [location.state])

  if (isLoading || !isAuthenticated) {
    return <div>Loading...</div>
  }

  const handleVerify = (file: any) => {
    setVerifyingFile(file.id)
    setIsVerifying(true)
    setProgress(0)
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsVerifying(false)
          
          // Simulate random result
          const found = Math.random() > 0.5
          setVerificationResult({ found, file: file.name })
          
          // Update file status in global context with verification details
          const verificationData = {
            verified: true,
            lastVerificationDate: new Date().toISOString(),
            lastVerificationStatus: found ? 'matched' as const : 'unmatched' as const,
            totalVerifications: (file.totalVerifications || 0) + 1,
            matchedVerifications: (file.matchedVerifications || 0) + (found ? 1 : 0)
          }
          
          updateFile(file.id, verificationData)
          
          return 100
        }
        return prev + 8
      })
    }, 200)
  }

  const handleDownload = (file: any) => {
    if (file.downloadUrl) {
      const link = document.createElement('a')
      link.href = file.downloadUrl
      link.download = `watermarked_${file.name}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleDelete = (file: any) => {
    // Remove from global context (this will automatically sync with dashboard)
    deleteFile(file.id)
  }

  const handleFileClick = (file: any) => {
    navigate(`/file-detail/${file.id}`, { 
      state: { file } 
    })
  }

  // Filter files based on search query
  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalPages = Math.ceil(filteredFiles.length / filesPerPage)
  const startIndex = (currentPage - 1) * filesPerPage
  const currentFiles = filteredFiles.slice(startIndex, startIndex + filesPerPage)

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  // Get verification status display info
  const getVerificationStatusInfo = (file: any) => {
    if (!file.verified) {
      return {
        icon: Eye,
        text: 'Not Verified',
        color: 'text-gray-500 dark:text-gray-400',
        bgColor: 'bg-gray-100 dark:bg-gray-700'
      }
    }

    if (file.lastVerificationStatus === 'matched') {
      return {
        icon: XCircle,
        text: 'Matches Found',
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-50 dark:bg-red-900/20'
      }
    }

    return {
      icon: CheckCircle,
      text: 'No Matches',
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20'
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <Card className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Uploaded Files
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage and verify your watermarked files
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {filteredFiles.length}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {searchQuery ? 'Filtered' : 'Total'} Files
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <Input
              type="text"
              placeholder="Search files by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-5 h-5 text-gray-400" />}
              className="max-w-md"
            />
          </div>

          {filteredFiles.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {searchQuery ? 'No files found' : 'No files uploaded yet'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {searchQuery 
                  ? `No files match "${searchQuery}". Try a different search term.`
                  : 'Upload your first file to get started with watermarking and verification.'
                }
              </p>
              {!searchQuery && (
                <Button onClick={() => navigate('/upload')}>
                  Upload Your First File
                </Button>
              )}
              {searchQuery && (
                <Button variant="secondary" onClick={() => setSearchQuery('')}>
                  Clear Search
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Files Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-4 px-4 font-semibold text-gray-900 dark:text-gray-100">
                        File Name
                      </th>
                      <th className="text-center py-4 px-4 font-semibold text-gray-900 dark:text-gray-100">
                        Date Uploaded
                      </th>
                      <th className="text-center py-4 px-4 font-semibold text-gray-900 dark:text-gray-100">
                        Status
                      </th>
                      <th className="text-center py-4 px-4 font-semibold text-gray-900 dark:text-gray-100">
                        Last Verification
                      </th>
                      <th className="text-right py-4 px-4 font-semibold text-gray-900 dark:text-gray-100">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentFiles.map((file) => {
                      const verificationInfo = getVerificationStatusInfo(file)
                      const VerificationIcon = verificationInfo.icon
                      
                      return (
                        <tr key={file.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          <td className="py-4 px-4">
                            <div 
                              className="flex items-center space-x-3 cursor-pointer"
                              onClick={() => handleFileClick(file)}
                            >
                              <FileText className="w-5 h-5 text-gray-400" />
                              <div>
                                <div className="font-medium text-gray-900 dark:text-gray-100 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                                  {file.name}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {(file.size / 1024 / 1024).toFixed(2)} MB
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-center text-gray-600 dark:text-gray-400">
                            {new Date(file.uploadDate).toLocaleDateString()}
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                              file.status === 'completed' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                : file.status === 'processing'
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                                : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                            }`}>
                              {file.status}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${verificationInfo.bgColor}`}>
                              <VerificationIcon className={`w-4 h-4 ${verificationInfo.color}`} />
                              <span className={verificationInfo.color}>
                                {verificationInfo.text}
                              </span>
                            </div>
                            {file.verified && file.totalVerifications && (
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {file.totalVerifications} verification{file.totalVerifications !== 1 ? 's' : ''}
                                {file.matchedVerifications > 0 && (
                                  <span className="text-red-600 dark:text-red-400 ml-1">
                                    ({file.matchedVerifications} match{file.matchedVerifications !== 1 ? 'es' : ''})
                                  </span>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center justify-end space-x-2">
                              {file.status === 'completed' && (
                                <>
                                  <Button
                                    size="sm"
                                    variant={file.verified ? "secondary" : "primary"}
                                    onClick={() => handleVerify(file)}
                                    disabled={isVerifying && verifyingFile === file.id}
                                    className="flex items-center space-x-1"
                                  >
                                    {isVerifying && verifyingFile === file.id ? (
                                      <>
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                        <span>Verifying...</span>
                                      </>
                                    ) : file.verified ? (
                                      <>
                                        <RefreshCw className="w-4 h-4" />
                                        <span>Reverify</span>
                                      </>
                                    ) : (
                                      <>
                                        <Shield className="w-4 h-4" />
                                        <span>Verify</span>
                                      </>
                                    )}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={() => handleDownload(file)}
                                    className="flex items-center space-x-1"
                                  >
                                    <Download className="w-4 h-4" />
                                    <span>Download</span>
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleFileClick(file)}
                                    className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDelete(file)}
                                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </>
                              )}
                              {file.status === 'processing' && (
                                <span className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">
                                  Processing...
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-8">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Showing {startIndex + 1} to {Math.min(startIndex + filesPerPage, filteredFiles.length)} of {filteredFiles.length} files
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="px-3 py-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                      {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>

        {/* Verification Modal */}
        <Modal isOpen={isVerifying} onClose={() => {}} title="Verifying Content Usage">
          <div className="text-center py-8">
            <Shield className="w-16 h-16 text-purple-600 mx-auto mb-6 animate-pulse" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Scanning AI Systems...
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Checking if your watermarked content has been used by AI models across the web.
            </p>
            <ProgressBar value={progress} className="mb-4" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {progress}% Complete
            </p>
          </div>
        </Modal>

        {/* Verification Result Modal */}
        <Modal 
          isOpen={!!verificationResult} 
          onClose={() => setVerificationResult(null)} 
          title="Verification Results"
        >
          {verificationResult && (
            <div className="text-center py-8">
              {verificationResult.found ? (
                <>
                  <XCircle className="w-16 h-16 text-red-600 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-red-600 mb-4">
                    Matches Found!!!
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Your watermarked content "{verificationResult.file}" has been detected in use by AI systems.
                  </p>
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 mb-6">
                    <h4 className="font-semibold text-red-800 dark:text-red-400 mb-2">
                      Detected Usage:
                    </h4>
                    <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                      <li>• GPT-based content generation platform</li>
                      <li>• AI writing assistant service</li>
                      <li>• Automated document processing system</li>
                    </ul>
                  </div>
                </>
              ) : (
                <>
                  <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-green-600 mb-4">
                    No Matches Found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    No matches found for "{verificationResult.file}". Your content appears to be secure.
                  </p>
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 mb-6">
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Your watermarked content has not been detected in any AI systems we monitor.
                    </p>
                  </div>
                </>
              )}
              <Button onClick={() => setVerificationResult(null)}>
                Close
              </Button>
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  )
}