import { apiClient } from './client'
import { endpoints } from './config'

export interface FileMetadata {
  description?: string
  tags?: string[]
  category?: string
  is_confidential?: boolean
  expires_at?: string
}

export interface FileUploadRequest {
  file: File
  metadata?: FileMetadata
}

export interface FileRecord {
  id: string
  user_id: string
  original_name: string
  stored_name: string
  file_path: string
  file_size: number
  file_type: string
  file_extension: string
  hash_md5: string
  hash_sha256: string
  status: 'uploading' | 'uploaded' | 'processing' | 'processed' | 'failed' | 'deleted'
  metadata?: Record<string, any>
  is_watermarked: boolean
  watermark_id?: string
  is_verified: boolean
  verification_count: number
  uploaded_at: string
  processed_at?: string
  last_accessed_at?: string
  processing_error?: string
  thumbnail_path?: string
  processing_history?: any[]
  is_public: boolean
  public_url?: string
  expires_at?: string
  created_at: string
  updated_at: string
}

export interface FileListResponse {
  files: {
    data: FileRecord[]
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
  message: string
}

export interface FileListFilters {
  per_page?: number
  page?: number
  status?: 'uploading' | 'uploaded' | 'processing' | 'processed' | 'failed' | 'deleted'
  type?: 'pdf' | 'doc' | 'docx'
  is_watermarked?: boolean
  search?: string
  sort_by?: 'name' | 'size' | 'uploaded_at' | 'processed_at'
  sort_order?: 'asc' | 'desc'
}

export interface FileUploadResponse {
  file: FileRecord
  message: string
  duplicate?: boolean
}

export interface FileResponse {
  file: FileRecord
  message: string
}

export interface FileStatistics {
  total_files: number
  total_size: number
  watermarked_files: number
  verified_files: number
  files_by_type: Record<string, { count: number }>
  files_by_month: Array<{ year: number; month: number; count: number }>
  recent_files: Array<{
    id: string
    original_name: string
    file_size: number
    uploaded_at: string
    status: string
  }>
}

export interface FileStatisticsResponse {
  statistics: FileStatistics
  message: string
}

export interface FileSearchResponse {
  files: {
    data: FileRecord[]
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
  search_term: string
  message: string
}

export interface FileSearchFilters {
  query: string
  type?: 'pdf' | 'doc' | 'docx'
  watermarked_only?: boolean
}

export interface FileUpdateRequest {
  metadata?: FileMetadata
  is_public?: boolean
  expires_at?: string
}

export interface FileProcessRequest {
  action: 'watermark' | 'verify'
  options?: Record<string, any>
}

export interface FileProcessResponse {
  file: FileRecord
  processing_result: {
    success: boolean
    action: string
    confidence?: number
    watermark_id?: string
    verification_score?: number
    processing_time?: number
    error?: string
  }
  message: string
}

export const filesApi = {
  // Get list of files
  getFiles: async (filters?: FileListFilters): Promise<FileListResponse> => {
    const response = await apiClient.get<FileListResponse>(endpoints.files.list, filters)
    return response.data
  },

  // Upload a new file
  uploadFile: async (uploadData: FileUploadRequest): Promise<FileUploadResponse> => {
    console.log('files.ts uploadFile called with uploadData:', uploadData)
    console.log('files.ts uploadData.file:', uploadData.file)
    console.log('files.ts uploadData.file type:', typeof uploadData.file)
    console.log('files.ts uploadData.file instanceof File:', uploadData.file instanceof File)
    
    // Validate uploadData
    if (!uploadData) {
      throw new Error('No uploadData provided to files.ts uploadFile')
    }
    
    if (!uploadData.file) {
      throw new Error('No file provided in uploadData to files.ts uploadFile')
    }
    
    if (!(uploadData.file instanceof File)) {
      throw new Error('Invalid file object provided in uploadData to files.ts uploadFile')
    }
    
    const additionalData: Record<string, any> = {}
    
    if (uploadData.metadata) {
      additionalData.metadata = JSON.stringify(uploadData.metadata)
    }

    console.log('files.ts calling apiClient.uploadFile with:', {
      endpoint: endpoints.files.upload,
      file: uploadData.file,
      additionalData
    })

    const response = await apiClient.uploadFile<FileUploadResponse>(
      endpoints.files.upload,
      uploadData.file,
      additionalData
    )
    return response.data
  },

  // Get file details
  getFile: async (fileId: string): Promise<FileResponse> => {
    const response = await apiClient.get<FileResponse>(endpoints.files.get(fileId))
    return response.data
  },

  // Update file
  updateFile: async (fileId: string, updateData: FileUpdateRequest): Promise<FileResponse> => {
    const response = await apiClient.put<FileResponse>(endpoints.files.update(fileId), updateData)
    return response.data
  },

  // Delete file
  deleteFile: async (fileId: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(endpoints.files.delete(fileId))
    return response.data
  },

  // Download file
  downloadFile: async (fileId: string): Promise<Blob> => {
    const token = apiClient.getAuthToken()
    const response = await fetch(`${apiClient.getBaseURL()}${endpoints.files.download(fileId)}`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    })

    if (!response.ok) {
      throw new Error(`Download failed: ${response.statusText}`)
    }

    return response.blob()
  },

  // Get file statistics
  getStatistics: async (): Promise<FileStatisticsResponse> => {
    const response = await apiClient.get<FileStatisticsResponse>(endpoints.files.statistics)
    return response.data
  },

  // Search files
  searchFiles: async (filters: FileSearchFilters): Promise<FileSearchResponse> => {
    const response = await apiClient.get<FileSearchResponse>(endpoints.files.search, filters)
    return response.data
  },

  // Process file (watermark or verify)
  processFile: async (fileId: string, processData: FileProcessRequest): Promise<FileProcessResponse> => {
    const response = await apiClient.post<FileProcessResponse>(endpoints.files.process(fileId), processData)
    return response.data
  },

  // Helper function to get human-readable file size
  getHumanReadableSize: (bytes: number): string => {
    const units = ['B', 'KB', 'MB', 'GB', 'TB']
    let size = bytes
    let unitIndex = 0

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`
  },

  // Helper function to get file icon
  getFileIcon: (extension: string): string => {
    switch (extension.toLowerCase()) {
      case 'pdf':
        return 'file-pdf'
      case 'doc':
      case 'docx':
        return 'file-word'
      default:
        return 'file'
    }
  },

  // Helper function to get file status color
  getStatusColor: (status: string): string => {
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
  },
}

export default filesApi 