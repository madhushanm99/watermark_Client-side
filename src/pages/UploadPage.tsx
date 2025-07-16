'use client'

import React, { useState, useRef, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useFiles } from '@/contexts/FileContext'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Upload, FileText, Download, Share, Trash2, Eye, CheckCircle, HardDrive, Cloud, AlertCircle } from 'lucide-react'

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  uploadDate: string
  status: 'completed' | 'processing' | 'failed'
  verified: boolean
  downloadUrl?: string
}

export default function UploadPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const { uploadFile, processFile, downloadFile } = useFiles()
  const navigate = useNavigate()
  const [dragActive, setDragActive] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [processProgress, setProcessProgress] = useState(0)
  const [showFilePreview, setShowFilePreview] = useState(false)
  const [processedFile, setProcessedFile] = useState<UploadedFile | null>(null)
  const [showSuccessToast, setShowSuccessToast] = useState(false)
  const [showUploadOptions, setShowUploadOptions] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [processingError, setProcessingError] = useState<string | null>(null)
  
  // Use refs to prevent duplicate uploads
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isProcessingRef = useRef(false)
  const processedFileIds = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login')
    }
  }, [isAuthenticated, isLoading, navigate])

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      handleFile(file)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      // Clear the input immediately to prevent duplicate uploads
      e.target.value = ''
      handleFile(file)
    }
  }

  const handleFile = useCallback(async (file: File) => {
    console.log('handleFile called with file:', file.name, file.type)
    
    // Prevent duplicate processing
    if (isProcessingRef.current) {
      console.log('Already processing a file, ignoring duplicate')
      return
    }

    // Create a unique identifier for this file
    const fileIdentifier = `${file.name}-${file.size}-${file.lastModified}-${Date.now()}`
    
    // Check if we've already processed this exact file
    if (processedFileIds.current.has(fileIdentifier)) {
      console.log('File already processed, ignoring duplicate')
      return
    }

    // Simple validation: only check for PDF or DOC files
    const fileName = file.name.toLowerCase()
    const isPdf = fileName.endsWith('.pdf') || file.type === 'application/pdf'
    const isDoc = fileName.endsWith('.doc') || fileName.endsWith('.docx') || 
                  file.type === 'application/msword' || 
                  file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    
    if (!isPdf && !isDoc) {
      setUploadError('Please upload only PDF or DOC/DOCX files')
      return
    }

    // Add to processed files set immediately
    processedFileIds.current.add(fileIdentifier)
    
    // Set processing flag
    isProcessingRef.current = true
    
    setUploadedFile(file)
    setUploadError(null)
    setProcessingError(null)
    await processFileUpload(file)
  }, [])

  const processFileUpload = async (file: File) => {
    console.log('processFileUpload called with file:', file)
    console.log('File details:', {
      name: file?.name,
      size: file?.size,
      type: file?.type,
      lastModified: file?.lastModified
    })
    
    // Check authentication
    const token = localStorage.getItem('auth_token')
    const user = localStorage.getItem('user')
    console.log('Auth check:', {
      token: !!token,
      user: !!user,
      tokenValue: token ? token.substring(0, 20) + '...' : null
    })
    
    // Check if user is authenticated
    if (!token || !user) {
      throw new Error('User not authenticated. Please log in first.')
    }
    
    // Test backend connectivity
    try {
      const healthResponse = await fetch('http://localhost:8000/api/health')
      console.log('Backend health check:', {
        status: healthResponse.status,
        ok: healthResponse.ok
      })
    } catch (healthError) {
      console.error('Backend health check failed:', healthError)
      throw new Error('Backend server is not reachable. Please ensure the server is running.')
    }
    
    // Validate file parameter
    if (!file) {
      throw new Error('No file provided to processFileUpload')
    }
    
    if (!(file instanceof File)) {
      throw new Error('Invalid file object provided to processFileUpload')
    }
    
    try {
      // Step 1: Upload file
      setIsUploading(true)
      setUploadProgress(0)
      
      // Simulate upload progress
      const uploadInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(uploadInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      const uploadData = {
        file,
        metadata: {
          description: 'File uploaded via web interface',
          category: 'user_upload',
        }
      }
      
      console.log('uploadData created:', uploadData)
      console.log('uploadData.file:', uploadData.file)

      const uploadedFileData = await uploadFile(uploadData)
      clearInterval(uploadInterval)
      setUploadProgress(100)
      setIsUploading(false)

      // Step 2: Process file (watermark)
    setIsProcessing(true)
      setProcessProgress(0)
    
      const processInterval = setInterval(() => {
        setProcessProgress(prev => {
          if (prev >= 90) {
            clearInterval(processInterval)
            return 90
          }
          return prev + 15
        })
      }, 500)

      await processFile(uploadedFileData.id, 'watermark')
      clearInterval(processInterval)
      setProcessProgress(100)
          setIsProcessing(false)
          
      // Create processed file object
          const processed: UploadedFile = {
        id: uploadedFileData.id,
        name: uploadedFileData.original_name,
        size: uploadedFileData.file_size,
        type: uploadedFileData.file_type,
        uploadDate: uploadedFileData.uploaded_at,
            status: 'completed',
            verified: false,
        downloadUrl: `/api/files/${uploadedFileData.id}/download`
          }
          
          setProcessedFile(processed)
          setShowFilePreview(true)
          setShowSuccessToast(true)
          
          // Hide success toast after 3 seconds
      setTimeout(() => {
            setShowSuccessToast(false)
          }, 3000)
          
    } catch (error: any) {
      console.error('Error processing file:', error)
      
      if (isUploading) {
        setUploadError(error.message || 'Upload failed. Please try again.')
        setIsUploading(false)
      } else if (isProcessing) {
        setProcessingError(error.message || 'Processing failed. Please try again.')
        setIsProcessing(false)
      }
    } finally {
      isProcessingRef.current = false
    }
  }

  const resetUpload = () => {
    setUploadedFile(null)
    setProcessedFile(null)
    setUploadProgress(0)
    setProcessProgress(0)
    setShowFilePreview(false)
    setUploadError(null)
    setProcessingError(null)
    isProcessingRef.current = false
    
    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDownload = async () => {
    if (processedFile) {
      try {
        await downloadFile(processedFile.id, `watermarked_${processedFile.name}`)
      } catch (error) {
        console.error('Download failed:', error)
      }
    }
  }

  const handleDelete = () => {
    if (processedFile) {
      // Reset upload state
      resetUpload()
    }
  }

  const handleShare = () => {
    if (processedFile) {
      // In a real implementation, this would generate a shareable link
      navigator.clipboard.writeText(processedFile.downloadUrl || '')
        .then(() => {
          // Show success message
          console.log('Share link copied to clipboard')
        })
        .catch(err => {
          console.error('Failed to copy share link:', err)
        })
    }
  }

  const handleViewDetails = () => {
    if (processedFile) {
      navigate(`/dashboard/files/${processedFile.id}`)
    }
  }

  const handleVerifyFile = async () => {
    if (processedFile) {
      try {
        setIsProcessing(true)
        await processFile(processedFile.id, 'verify')
        
        // Update processed file with verification status
        setProcessedFile(prev => prev ? { ...prev, verified: true } : null)
        setIsProcessing(false)
        
      } catch (error: any) {
        console.error('Verification failed:', error)
        setProcessingError(error.message || 'Verification failed. Please try again.')
        setIsProcessing(false)
      }
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return '📄'
    if (type.includes('word') || type.includes('document')) return '📝'
    return '📄'
  }

  const isProcessingFile = isUploading || isProcessing

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Loading...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Upload Files
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Upload your PDF or DOCX files to add invisible watermarks and protect your content.
          </p>
        </div>

        {/* Error Messages */}
        {uploadError && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-red-800 dark:text-red-200">{uploadError}</span>
            </div>
          </div>
        )}

        {processingError && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-red-800 dark:text-red-200">{processingError}</span>
            </div>
          </div>
        )}

            {/* Upload Area */}
        <Card className="mb-8">
              <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
                  dragActive 
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' 
                : 'border-gray-300 dark:border-gray-600 hover:border-purple-400'
            } ${isProcessingFile ? 'opacity-50 pointer-events-none' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
            <div className="mb-4">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Drop files here or click to upload
                </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Supported formats: PDF, DOC, DOCX (Max 100MB)
                </p>
            </div>
            
                <input
                  ref={fileInputRef}
                  type="file"
              accept=".pdf,.doc,.docx"
                  onChange={handleFileInput}
                  className="hidden"
              disabled={isProcessingFile}
                />
            
                <Button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessingFile}
              className="mb-4"
            >
              Select Files
                </Button>
            
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <p>• Files are processed securely and encrypted</p>
              <p>• Watermarks are completely invisible</p>
              <p>• Processing typically takes 30-60 seconds</p>
            </div>
              </div>
            </Card>

        {/* Processing Status */}
        {(isUploading || isProcessing || processedFile) && (
          <Card className="mb-8">
              <div className="space-y-6">
              {/* Upload Progress */}
              {isUploading && (
                  <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Uploading {uploadedFile?.name}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {uploadProgress}%
                    </span>
                  </div>
                  <ProgressBar value={uploadProgress} />
                </div>
              )}

              {/* Processing Progress */}
              {isProcessing && (
                  <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Adding watermark...
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {processProgress}%
                    </span>
                  </div>
                  <ProgressBar value={processProgress} />
                </div>
              )}

              {/* Processed File Preview */}
              {processedFile && !isProcessing && (
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">
                        {getFileIcon(processedFile.type)}
                  </div>
                  <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {processedFile.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {formatFileSize(processedFile.size)} • Watermarked
                    </p>
                  </div>
                </div>
                    <div className="flex items-center space-x-2">
                      {processedFile.verified && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                      <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                        {processedFile.status === 'completed' ? 'Ready' : processedFile.status}
                      </span>
              </div>
            </div>

                  {/* Action Buttons */}
                  <div className="mt-4 flex flex-wrap gap-2">
              <Button 
                      variant="primary"
                      size="sm"
                onClick={handleDownload}
                      disabled={isProcessingFile}
              >
                      <Download className="h-4 w-4 mr-2" />
                      Download
              </Button>
                    
              <Button 
                variant="secondary" 
                      size="sm"
                      onClick={handleVerifyFile}
                      disabled={isProcessingFile || processedFile.verified}
              >
                      <Eye className="h-4 w-4 mr-2" />
                      {processedFile.verified ? 'Verified' : 'Verify'}
              </Button>
                    
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleShare}
                      disabled={isProcessingFile}
                    >
                      <Share className="h-4 w-4 mr-2" />
                      Share
              </Button>
                    
              <Button 
                      variant="secondary"
                      size="sm"
                      onClick={handleViewDetails}
                      disabled={isProcessingFile}
              >
                      <FileText className="h-4 w-4 mr-2" />
                      Details
              </Button>

              <Button 
                variant="secondary" 
                      size="sm"
                      onClick={handleDelete}
                      disabled={isProcessingFile}
              >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove
              </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Success Toast */}
        {showSuccessToast && (
          <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span>File processed successfully!</span>
            </div>
          </div>
        )}

        {/* Upload another file button */}
        {processedFile && !isProcessingFile && (
          <div className="text-center">
            <Button
              onClick={resetUpload}
              variant="secondary"
              className="mt-4"
            >
              Upload Another File
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}