'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useFiles } from '@/contexts/FileContext'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { 
  ArrowLeft, 
  FileText, 
  Download, 
  Trash2, 
  Share, 
  Shield, 
  Calendar, 
  HardDrive,
  Eye,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Clock,
  User,
  Globe,
  Lock,
  Search,
  TrendingUp,
  XCircle,
  Activity,
  BarChart3
} from 'lucide-react'
import { filesApi, FileRecord } from '@/lib/api/files'
import { formatDate, formatFileSize } from '@/lib/utils'

interface VerificationRecord {
  id: string
  date: string
  status: 'matched' | 'unmatched'
  confidence: number
  platforms?: string[]
  details?: string
}

interface WatermarkedFile {
  id: string
  name: string
  size: number
  type: string
  uploadDate: string
  status: 'completed' | 'processing' | 'failed'
  verified: boolean
  downloadUrl?: string
  verificationHistory?: VerificationRecord[]
  totalVerifications?: number
  matchedVerifications?: number
  lastVerificationDate?: string
  lastVerificationStatus?: 'matched' | 'unmatched'
  // Add new fields from API
  file_extension?: string
  is_watermarked?: boolean
  watermark_id?: string
  metadata?: Record<string, any>
  processed_at?: string
}

export default function FileDetailPage() {
  const { isAuthenticated } = useAuth()
  const { getFileById, deleteFile, processFile, downloadFile } = useFiles()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  
  const [file, setFile] = useState<FileRecord | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showVerifyModal, setShowVerifyModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [shareUrl, setShareUrl] = useState('')
  const [processingProgress, setProcessingProgress] = useState(0)

  // Load file details from API
  useEffect(() => {
    const loadFileDetails = async () => {
      if (!id) {
        setError('File ID is required')
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)
        
        const response = await filesApi.getFile(id)
        setFile(response.file)
        
        // Generate share URL if file is public
        if (response.file.is_public && response.file.public_url) {
          setShareUrl(response.file.public_url)
        }
      } catch (err: any) {
        console.error('Error loading file details:', err)
        setError(err.message || 'Failed to load file details')
      } finally {
        setIsLoading(false)
      }
    }

    if (isAuthenticated) {
      loadFileDetails()
    }
  }, [id, isAuthenticated])

  // Handle file download
  const handleDownload = async () => {
    if (!file) return

    try {
      setIsDownloading(true)
      await downloadFile(file.id, file.original_name)
    } catch (err: any) {
      console.error('Download failed:', err)
      setError(err.message || 'Download failed')
    } finally {
      setIsDownloading(false)
    }
  }

  // Handle file deletion
  const handleDelete = async () => {
    if (!file) return

    try {
      setIsDeleting(true)
      await deleteFile(file.id)
      setShowDeleteModal(false)
      navigate('/dashboard/files')
    } catch (err: any) {
      console.error('Delete failed:', err)
      setError(err.message || 'Delete failed')
    } finally {
      setIsDeleting(false)
    }
  }

  // Handle file verification
  const handleVerify = async () => {
    if (!file) return

    try {
      setIsVerifying(true)
      setShowVerifyModal(false)
      
      // Simulate progress
      const interval = setInterval(() => {
        setProcessingProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval)
            return 90
          }
          return prev + 10
        })
      }, 500)

      await processFile(file.id, 'verify')
      clearInterval(interval)
      setProcessingProgress(100)
      
      // Reload file details
      const response = await filesApi.getFile(file.id)
      setFile(response.file)
      
    } catch (err: any) {
      console.error('Verification failed:', err)
      setError(err.message || 'Verification failed')
    } finally {
      setIsVerifying(false)
      setProcessingProgress(0)
    }
  }

  // Handle watermark processing
  const handleWatermark = async () => {
    if (!file) return

    try {
      setIsProcessing(true)
      
      // Simulate progress
      const interval = setInterval(() => {
        setProcessingProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval)
            return 90
          }
          return prev + 15
        })
      }, 500)

      await processFile(file.id, 'watermark')
      clearInterval(interval)
      setProcessingProgress(100)
      
      // Reload file details
      const response = await filesApi.getFile(file.id)
      setFile(response.file)
      
    } catch (err: any) {
      console.error('Watermark processing failed:', err)
      setError(err.message || 'Watermark processing failed')
    } finally {
      setIsProcessing(false)
      setProcessingProgress(0)
    }
  }

  // Handle share functionality
  const handleShare = async () => {
    if (!file) return

    try {
      // Update file to be public
      await filesApi.updateFile(file.id, { is_public: true })
      
      // Reload file details to get public URL
      const response = await filesApi.getFile(file.id)
      setFile(response.file)
      
      if (response.file.public_url) {
        setShareUrl(response.file.public_url)
        setShowShareModal(true)
      }
    } catch (err: any) {
      console.error('Share failed:', err)
      setError(err.message || 'Share failed')
    }
  }

  // Copy share URL to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        // Show success message
        console.log('Link copied to clipboard')
      })
      .catch(err => {
        console.error('Failed to copy link:', err)
      })
  }

  const getFileIcon = (extension: string) => {
    switch (extension?.toLowerCase()) {
      case 'pdf':
        return '📄'
      case 'doc':
      case 'docx':
        return '📝'
      default:
        return '📄'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'uploaded':
        return 'text-green-600'
      case 'processing':
        return 'text-blue-600'
      case 'processed':
        return 'text-green-600'
      case 'failed':
        return 'text-red-600'
      default:
        return 'text-gray-600'
      }
    }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'uploaded':
        return 'Uploaded'
      case 'processing':
        return 'Processing'
      case 'processed':
        return 'Processed'
      case 'failed':
        return 'Failed'
      default:
        return 'Unknown'
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Loading file details...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto p-6">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Error Loading File
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <Button onClick={() => navigate('/dashboard/files')}>
              Back to Files
            </Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!file) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto p-6">
          <div className="text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              File Not Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              The file you're looking for doesn't exist or has been deleted.
            </p>
            <Button onClick={() => navigate('/dashboard/files')}>
              Back to Files
            </Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Button
              variant="secondary"
              onClick={() => navigate('/dashboard/files')}
              className="flex items-center"
          >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Files
          </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                File Details
                  </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage and view file information
              </p>
                    </div>
                    </div>
                  </div>
                  
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-red-800 dark:text-red-200">{error}</span>
                          </div>
                      </div>
                    )}

        {/* Processing Progress */}
        {(isVerifying || isProcessing) && (
          <Card className="mb-6 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {isVerifying ? 'Verifying File...' : 'Processing File...'}
              </h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {processingProgress}%
                      </span>
                  </div>
            <ProgressBar value={processingProgress} />
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - File Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* File Overview */}
            <Card className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="text-4xl">
                    {getFileIcon(file.file_extension)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {file.original_name}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      {formatFileSize(file.file_size)} • {file.file_extension?.toUpperCase()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(file.status)}`}>
                    {getStatusText(file.status)}
                  </span>
                  {file.is_watermarked && (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                      Watermarked
                    </span>
                  )}
                  {file.is_verified && (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      Verified
                    </span>
                  )}
              </div>
            </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 mb-6">
                <Button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="flex items-center"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {isDownloading ? 'Downloading...' : 'Download'}
                </Button>
                
                {!file.is_verified && (
                    <Button
                    onClick={() => setShowVerifyModal(true)}
                    disabled={isVerifying || isProcessing}
                    variant="secondary"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Verify
                  </Button>
                )}
                
                {!file.is_watermarked && (
                    <Button
                    onClick={handleWatermark}
                    disabled={isVerifying || isProcessing}
                      variant="secondary"
                    >
                    <Shield className="h-4 w-4 mr-2" />
                    Add Watermark
                    </Button>
                )}
                    
                    <Button
                  onClick={handleShare}
                      variant="secondary"
                    >
                  <Share className="h-4 w-4 mr-2" />
                  Share
                    </Button>
                    
                      <Button
                        onClick={() => setShowDeleteModal(true)}
                  variant="secondary"
                  className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                      </Button>
              </div>

              {/* File Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Upload Date
                    </label>
                    <p className="text-gray-900 dark:text-gray-100">
                      {formatDate(file.uploaded_at)}
                    </p>
          </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      File Size
                    </label>
                    <p className="text-gray-900 dark:text-gray-100">
                      {formatFileSize(file.file_size)}
              </p>
            </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      File Type
                    </label>
                    <p className="text-gray-900 dark:text-gray-100">
                      {file.file_type}
                    </p>
            </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Processing Status
                    </label>
                    <p className={`font-medium ${getStatusColor(file.status)}`}>
                      {getStatusText(file.status)}
                    </p>
              </div>

                  {file.processed_at && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Processed Date
                      </label>
                      <p className="text-gray-900 dark:text-gray-100">
                        {formatDate(file.processed_at)}
                      </p>
                </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Verification Count
                    </label>
                    <p className="text-gray-900 dark:text-gray-100">
                      {file.verification_count} times
                    </p>
                </div>
                </div>
              </div>

              {/* Metadata */}
              {file.metadata && Object.keys(file.metadata).length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    File Metadata
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <pre className="text-sm text-gray-700 dark:text-gray-300 overflow-x-auto">
                      {JSON.stringify(file.metadata, null, 2)}
                    </pre>
            </div>
              </div>
            )}
          </Card>

            {/* Processing History */}
            {file.processing_history && file.processing_history.length > 0 && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Processing History
                </h3>
                <div className="space-y-4">
                  {file.processing_history.map((entry, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                          <Activity className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {entry.action} - {entry.status}
                        </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(entry.timestamp)}
                          </p>
                        </div>
                      </div>
                      {entry.result && (
                        <div className="text-right">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Confidence: {entry.result.confidence}%
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}
              </div>

          {/* Right Column - Stats & Actions */}
          <div className="space-y-6">
            {/* Security Features */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Security Features
                      </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Watermarked</span>
                  {file.is_watermarked ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-gray-400" />
                  )}
                    </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Verified</span>
                  {file.is_verified ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Public Access</span>
                  {file.is_public ? (
                    <Globe className="h-5 w-5 text-blue-500" />
                  ) : (
                    <Lock className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </div>
            </Card>

            {/* File Hashes */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                File Hashes
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    MD5
                  </label>
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-mono bg-gray-50 dark:bg-gray-800 p-2 rounded">
                    {file.hash_md5}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    SHA256
                  </label>
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-mono bg-gray-50 dark:bg-gray-800 p-2 rounded">
                    {file.hash_sha256}
                  </p>
                </div>
              </div>
            </Card>

            {/* Watermark Details */}
            {file.is_watermarked && file.watermark_id && (
            <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Watermark Details
                </h3>
              <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Watermark ID
                    </label>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-mono bg-gray-50 dark:bg-gray-800 p-2 rounded">
                      {file.watermark_id}
                    </p>
                  </div>
              </div>
            </Card>
            )}
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Delete File"
        >
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Are you sure you want to delete "{file.original_name}"? This action cannot be undone.
                </p>
            <div className="flex justify-center space-x-4">
              <Button 
                onClick={() => setShowDeleteModal(false)}
                variant="secondary" 
              >
                Cancel
              </Button>
              <Button 
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Verify Confirmation Modal */}
        <Modal 
          isOpen={showVerifyModal}
          onClose={() => setShowVerifyModal(false)}
          title="Verify File"
        >
          <div className="text-center">
            <Eye className="h-12 w-12 text-blue-500 mx-auto mb-4" />
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              This will scan the web to check if your file content has been used by AI models. Continue?
            </p>
            <div className="flex justify-center space-x-4">
              <Button
                onClick={() => setShowVerifyModal(false)}
                variant="secondary"
              >
                Cancel
              </Button>
              <Button
                onClick={handleVerify}
                disabled={isVerifying}
              >
                {isVerifying ? 'Verifying...' : 'Start Verification'}
              </Button>
                    </div>
                  </div>
        </Modal>

        {/* Share Modal */}
        <Modal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          title="Share File"
        >
          <div className="text-center">
            <Share className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Your file is now publicly accessible via this link:
                  </p>
            <div className="flex items-center space-x-2 mb-6">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-sm"
              />
              <Button
                onClick={copyToClipboard}
                size="sm"
              >
                Copy
              </Button>
                  </div>
            <div className="flex justify-center">
              <Button 
                onClick={() => setShowShareModal(false)}
                variant="secondary"
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  )
}