// Import required modules
import { apiClient } from './client'
import { authApi } from './auth'
import { profileApi } from './profile'
import { subscriptionAPI } from './subscription'
import { billingAPI } from './billing'
import { usageAPI } from './usage'
import { filesApi } from './files'

// Export API client
export { apiClient } from './client'
export { apiConfig, endpoints } from './config'

// Export API services
export { authApi } from './auth'
export { profileApi } from './profile'
export { subscriptionAPI } from './subscription'
export { billingAPI } from './billing'
export { usageAPI } from './usage'
export { filesApi } from './files'

// Export auth types
export type { User, LoginRequest, RegisterRequest, LoginResponse, RegisterResponse } from './auth'

// Export profile types
export type { 
  UserProfile, 
  UserSettings, 
  UserActivity, 
  UsageStatistics, 
  ProfileData,
  UpdateProfileRequest,
  UpdateSettingsRequest,
  DeleteAccountRequest 
} from './profile'

// Export subscription types
export type {
  SubscriptionPlan,
  Subscription,
  UsageData,
  UsageResponse,
  SubscribeRequest,
  ChangePlanRequest
} from './subscription'

// Export billing types
export type {
  BillingTransaction,
  BillingHistory,
  BillingStatistics,
  ProcessPaymentRequest,
  ProcessRefundRequest,
  Invoice,
  BillingHistoryFilters
} from './billing'

// Export usage types
export type {
  UsageRecord,
  CurrentUsageResponse,
  UsageHistoryResponse,
  UsageAnalyticsResponse,
  UsageLimitsResponse,
  UsageSummaryResponse,
  RecordUsageRequest,
  UsageHistoryFilters,
  UsageAnalyticsFilters
} from './usage'

// Export file types
export type {
  FileMetadata,
  FileUploadRequest,
  FileRecord,
  FileListResponse,
  FileListFilters,
  FileUploadResponse,
  FileResponse,
  FileStatistics,
  FileStatisticsResponse,
  FileSearchResponse,
  FileSearchFilters,
  FileUpdateRequest,
  FileProcessRequest,
  FileProcessResponse
} from './files'

// Health check function
export const healthCheck = async () => {
  try {
    const response = await apiClient.get('/health')
    return response.data
  } catch (error) {
    console.error('Health check failed:', error)
    throw error
  }
}

// Export everything as default
export default {
  auth: authApi,
  profile: profileApi,
  subscription: subscriptionAPI,
  billing: billingAPI,
  usage: usageAPI,
  files: filesApi,
  healthCheck,
} 