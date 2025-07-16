import { apiConfig, endpoints } from './config'

interface ApiError {
  message: string
  status: number
  errors?: Record<string, string[]>
}

interface ApiResponse<T = any> {
  data: T
  message?: string
  status: number
}

class ApiClient {
  private baseURL: string
  private timeout: number
  private defaultHeaders: Record<string, string>

  constructor() {
    this.baseURL = apiConfig.baseURL
    this.timeout = apiConfig.timeout
    this.defaultHeaders = apiConfig.headers
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`
    
    // Get auth token from localStorage
    const token = localStorage.getItem('auth_token')
    
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.defaultHeaders,
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    try {
      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

            if (!response.ok) {
        console.log('Response not ok:', {
          status: response.status,
          statusText: response.statusText,
          url: response.url
        })
        
        // Clone the response to read both JSON and text
        const responseClone = response.clone()
        
        const errorData = await response.json().catch(() => ({}))
        console.log('Error response data:', errorData)
        
        // Also try to get raw text for debugging
        try {
          const rawText = await responseClone.text()
          console.log('Error response raw text:', rawText)
        } catch (textError) {
          console.log('Could not read response as text:', textError)
        }
        
        const error: ApiError = {
          message: errorData.message || 'An error occurred',
          status: response.status,
          errors: errorData.errors,
        }
        
        console.log('Parsed error:', error)
        
        // Create a more specific error object
        const apiError = new Error(error.message)
        ;(apiError as any).status = error.status
        ;(apiError as any).errors = error.errors
        
        throw apiError
      }

      const data = await response.json()
      return {
        data: data.data || data,
        message: data.message,
        status: response.status,
      }
    } catch (error) {
      clearTimeout(timeoutId)
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout')
      }
      
      // Handle network errors
      if (error instanceof TypeError) {
        throw new Error('Network error - please check your connection')
      }
      
      throw error
    }
  }

  // GET request
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    let finalEndpoint = endpoint
    if (params) {
      const url = new URL(`${this.baseURL}${endpoint}`)
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value))
        }
      })
      finalEndpoint = endpoint + '?' + url.searchParams.toString()
    }
    
    return this.request<T>(finalEndpoint)
  }

  // POST request
  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  // PUT request
  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  // DELETE request
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    })
  }

  // File upload
  async uploadFile<T>(endpoint: string, file: File, additionalData?: Record<string, any>): Promise<ApiResponse<T>> {
    console.log('client.ts uploadFile called with:', {
      endpoint,
      file,
      additionalData,
      fileType: typeof file,
      fileInstanceOf: file instanceof File
    })
    
    if (!file) {
      throw new Error('No file provided to uploadFile method')
    }
    
    const formData = new FormData()
    formData.append('file', file)
    
    console.log('FormData created, appended file:', file)
    console.log('FormData entries:', Array.from(formData.entries()))
    
    // Validate FormData has the file
    const fileEntry = formData.get('file')
    console.log('File from FormData.get("file"):', fileEntry)
    console.log('File from FormData is File instance:', fileEntry instanceof File)
    
    if (!fileEntry) {
      throw new Error('Failed to add file to FormData')
    }
    
    if (!(fileEntry instanceof File)) {
      throw new Error('FormData file entry is not a File instance')
    }
    
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, String(value))
      })
    }
    
    console.log('Final FormData entries:', Array.from(formData.entries()))

    const token = localStorage.getItem('auth_token')
    
    console.log('Sending request with FormData:', formData)
    console.log('Request endpoint:', endpoint)
    console.log('Request method: POST')
    console.log('Auth token present:', !!token)
    
    const requestOptions = {
      method: 'POST',
      body: formData,
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        // Don't set Content-Type for FormData - let browser set it with boundary
      },
    }
    
    console.log('Request options:', requestOptions)
    
    return this.request<T>(endpoint, requestOptions)
  }

  // Set auth token
  setAuthToken(token: string) {
    localStorage.setItem('auth_token', token)
  }

  // Clear auth token
  clearAuthToken() {
    localStorage.removeItem('auth_token')
  }

  // Get current auth token
  getAuthToken(): string | null {
    return localStorage.getItem('auth_token')
  }

  // Get base URL
  getBaseURL(): string {
    return this.baseURL
  }
}

// Create and export singleton instance
export const apiClient = new ApiClient()
export default apiClient 