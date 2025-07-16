'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { filesApi, FileRecord, FileListFilters, FileUploadRequest } from '@/lib/api/files'
import { useAuth } from './AuthContext'

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

interface FileContextType {
  files: WatermarkedFile[]
  isLoading: boolean
  error: string | null
  addFile: (file: WatermarkedFile) => void
  updateFile: (id: string, updates: Partial<WatermarkedFile>) => void
  deleteFile: (id: string) => Promise<void>
  getFileById: (id: string) => WatermarkedFile | undefined
  uploadFile: (uploadData: FileUploadRequest) => Promise<FileRecord>
  refreshFiles: () => Promise<void>
  loadFiles: (filters?: FileListFilters) => Promise<void>
  processFile: (fileId: string, action: 'watermark' | 'verify') => Promise<void>
  downloadFile: (fileId: string, fileName: string) => Promise<void>
  stats: {
    totalFiles: number
    verifiedFiles: number
    unverifiedFiles: number
    detectionRate: number
    watermarkedFiles: number
    processingFiles: number
  }
}

const FileContext = createContext<FileContextType | undefined>(undefined)

export const useFiles = () => {
  const context = useContext(FileContext)
  if (context === undefined) {
    throw new Error('useFiles must be used within a FileProvider')
  }
  return context
}

interface FileProviderProps {
  children: ReactNode
}

export const FileProvider: React.FC<FileProviderProps> = ({ children }) => {
  const [files, setFiles] = useState<WatermarkedFile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { isAuthenticated } = useAuth()

  // Convert API FileRecord to WatermarkedFile format
  const convertFileRecord = (record: FileRecord): WatermarkedFile => ({
    id: record.id,
    name: record.original_name,
    size: record.file_size,
    type: record.file_type,
    uploadDate: record.uploaded_at,
    status: record.status === 'processed' ? 'completed' : 
            record.status === 'failed' ? 'failed' : 
            record.status === 'processing' ? 'processing' : 'completed',
    verified: record.is_verified,
    downloadUrl: `/api/files/${record.id}/download`,
    file_extension: record.file_extension,
    is_watermarked: record.is_watermarked,
    watermark_id: record.watermark_id,
    metadata: record.metadata,
    processed_at: record.processed_at,
    totalVerifications: record.verification_count,
    matchedVerifications: record.is_verified ? record.verification_count : 0,
    lastVerificationDate: record.last_accessed_at,
    lastVerificationStatus: record.is_verified ? 'matched' : 'unmatched',
  })

  // Load files from API
  const loadFiles = async (filters?: FileListFilters) => {
    if (!isAuthenticated) {
      setFiles([])
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      
      const response = await filesApi.getFiles(filters)
      const convertedFiles = response.files.data.map(convertFileRecord)
      
      setFiles(convertedFiles)
    } catch (err) {
      console.error('Error loading files:', err)
      setError('Failed to load files. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Load files on mount and when auth changes
  useEffect(() => {
    loadFiles()
  }, [isAuthenticated])

  // Refresh files
  const refreshFiles = async () => {
    await loadFiles()
  }

  // Upload file
  const uploadFile = async (uploadData: FileUploadRequest): Promise<FileRecord> => {
    console.log('FileContext uploadFile called with uploadData:', uploadData)
    console.log('FileContext uploadData.file:', uploadData.file)
    console.log('FileContext uploadData.file type:', typeof uploadData.file)
    console.log('FileContext uploadData.file instanceof File:', uploadData.file instanceof File)
    
    // Validate uploadData
    if (!uploadData) {
      throw new Error('No uploadData provided to uploadFile')
    }
    
    if (!uploadData.file) {
      throw new Error('No file provided in uploadData')
    }
    
    if (!(uploadData.file instanceof File)) {
      throw new Error('Invalid file object provided in uploadData')
    }
    
    try {
      const response = await filesApi.uploadFile(uploadData)
      
      if (response.duplicate) {
        throw new Error('File already exists')
      }

      // Add to local state
      const convertedFile = convertFileRecord(response.file)
      setFiles(prev => [convertedFile, ...prev])
      
      return response.file
    } catch (err) {
      console.error('Error uploading file:', err)
      throw err
    }
  }

  // Add file to context (for compatibility)
  const addFile = (file: WatermarkedFile) => {
    setFiles(prev => [file, ...prev])
  }

  // Update file
  const updateFile = (id: string, updates: Partial<WatermarkedFile>) => {
    setFiles(prev => 
      prev.map(file => 
        file.id === id ? { ...file, ...updates } : file
      )
    )
  }

  // Delete file
  const deleteFile = async (id: string) => {
    try {
      await filesApi.deleteFile(id)
    setFiles(prev => prev.filter(file => file.id !== id))
    } catch (err) {
      console.error('Error deleting file:', err)
      throw err
    }
  }

  // Get file by ID
  const getFileById = (id: string) => {
    return files.find(file => file.id === id)
  }

  // Process file (watermark or verify)
  const processFile = async (fileId: string, action: 'watermark' | 'verify') => {
    try {
      // Update local state to show processing
      updateFile(fileId, { status: 'processing' })
      
      const response = await filesApi.processFile(fileId, { action })
      
      // Update local state with processed file
      const convertedFile = convertFileRecord(response.file)
      updateFile(fileId, convertedFile)
      
    } catch (err) {
      console.error(`Error processing file (${action}):`, err)
      updateFile(fileId, { status: 'failed' })
      throw err
    }
  }

  // Download file
  const downloadFile = async (fileId: string, fileName: string) => {
    try {
      const blob = await filesApi.downloadFile(fileId)
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
    } catch (err) {
      console.error('Error downloading file:', err)
      throw err
    }
  }

  // Calculate real-time statistics
  const stats = {
    totalFiles: files.length,
    verifiedFiles: files.filter(file => file.verified).length,
    unverifiedFiles: files.filter(file => !file.verified).length,
    detectionRate: files.length > 0 ? (files.filter(file => file.verified).length / files.length) * 100 : 0,
    watermarkedFiles: files.filter(file => file.is_watermarked).length,
    processingFiles: files.filter(file => file.status === 'processing').length,
  }

  const value = {
    files,
    isLoading,
    error,
    addFile,
    updateFile,
    deleteFile,
    getFileById,
    uploadFile,
    refreshFiles,
    loadFiles,
    processFile,
    downloadFile,
    stats
  }

  return (
    <FileContext.Provider value={value}>
      {children}
    </FileContext.Provider>
  )
}