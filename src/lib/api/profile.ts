import { apiClient } from './client'

export interface UserProfile {
  id: string
  name: string
  email: string
  subscription_tier: 'free' | 'professional'
  email_verified_at: string | null
  created_at: string
  updated_at: string
}

export interface UserSettings {
  id: number
  user_id: number
  theme: 'light' | 'dark' | 'system'
  language: string
  timezone: string
  email_notifications: boolean
  browser_notifications: boolean
  marketing_emails: boolean
  activity_emails: boolean
  notification_preferences: any
  dashboard_preferences: any
  file_preferences: any
  privacy_settings: any
  created_at: string
  updated_at: string
}

export interface UserActivity {
  id: number
  user_id: number
  activity_type: string
  description: string
  metadata: any
  ip_address: string
  user_agent: string
  activity_time: string
  created_at: string
  updated_at: string
}

export interface UsageStatistics {
  id: number
  user_id: number
  month: number
  year: number
  files_uploaded: number
  files_verified: number
  files_downloaded: number
  storage_used_bytes: number
  api_calls_made: number
  login_count: number
  profile_updates: number
  daily_activity: any
  file_types_processed: any
  verification_results: any
  created_at: string
  updated_at: string
}

export interface ProfileData {
  user: UserProfile
  settings: UserSettings
  statistics: {
    total: {
      total_files_uploaded: number
      total_files_verified: number
      total_files_downloaded: number
      total_storage_used_bytes: number
      total_api_calls_made: number
      total_login_count: number
      total_profile_updates: number
      months_active: number
    }
    current_month: UsageStatistics
  }
  recent_activities: UserActivity[]
}

export interface UpdateProfileRequest {
  name?: string
  email?: string
  current_password?: string
  password?: string
  password_confirmation?: string
}

export interface UpdateSettingsRequest {
  theme?: 'light' | 'dark' | 'system'
  language?: string
  timezone?: string
  email_notifications?: boolean
  browser_notifications?: boolean
  marketing_emails?: boolean
  activity_emails?: boolean
  notification_preferences?: any
  dashboard_preferences?: any
  file_preferences?: any
  privacy_settings?: any
}

export interface DeleteAccountRequest {
  password: string
  confirmation: 'DELETE_MY_ACCOUNT'
  reason?: string
}

export const profileApi = {
  // Get complete profile data
  getProfile: async (): Promise<ProfileData> => {
    const response = await apiClient.get<{ data: ProfileData }>('/profile')
    return response.data.data
  },

  // Update user profile
  updateProfile: async (data: UpdateProfileRequest): Promise<UserProfile> => {
    const response = await apiClient.put<{ data: { user: UserProfile } }>('/profile', data)
    return response.data.data.user
  },

  // Get user settings
  getSettings: async (): Promise<UserSettings> => {
    const response = await apiClient.get<{ data: { settings: UserSettings } }>('/settings')
    return response.data.data.settings
  },

  // Update user settings
  updateSettings: async (data: UpdateSettingsRequest): Promise<UserSettings> => {
    const response = await apiClient.put<{ data: { settings: UserSettings } }>('/settings', data)
    return response.data.data.settings
  },

  // Get user activities
  getActivities: async (params?: {
    limit?: number
    offset?: number
    activity_type?: string
    from_date?: string
    to_date?: string
  }): Promise<{
    activities: UserActivity[]
    pagination: {
      total: number
      limit: number
      offset: number
      has_more: boolean
    }
  }> => {
    const response = await apiClient.get<{ data: any }>('/activities', params)
    return response.data.data
  },

  // Get usage statistics
  getUsageStatistics: async (params?: {
    months?: number
  }): Promise<{
    total_statistics: any
    monthly_statistics: UsageStatistics[]
    current_month: UsageStatistics
  }> => {
    const response = await apiClient.get<{ data: any }>('/statistics', params)
    return response.data.data
  },

  // Delete user account
  deleteAccount: async (data: DeleteAccountRequest): Promise<void> => {
    await (apiClient as any).request('/profile', {
      method: 'DELETE',
      body: JSON.stringify(data),
    })
  },

  // Export user data
  exportData: async (): Promise<any> => {
    const response = await apiClient.get<{ data: any }>('/profile/export')
    return response.data.data
  },
}

export default profileApi 