import { apiClient } from './client';

export interface UsageRecord {
  id: number;
  user_id: number;
  action_type: 'upload' | 'verification' | 'storage' | 'api_call';
  count: number;
  bytes_used: number;
  resource_type: string | null;
  resource_id: string | null;
  metadata: Record<string, any> | null;
  month: number;
  year: number;
  date: string;
  formatted_bytes: string;
  created_at: string;
  updated_at: string;
}

export interface UsageData {
  upload?: { count: number; bytes: number };
  verification?: { count: number; bytes: number };
  storage?: { count: number; bytes: number };
  api_call?: { count: number; bytes: number };
}

export interface CurrentUsageResponse {
  current_usage: UsageData;
  remaining_usage: {
    uploads: number;
    verifications: number;
    storage: number;
  };
  usage_percentages: {
    uploads: number;
    verifications: number;
    storage: number;
  };
  plan_limits: {
    upload_limit: number | null;
    verification_limit: number | null;
    storage_limit_bytes: number | null;
  };
  period: {
    month: number;
    year: number;
  };
}

export interface UsageHistoryResponse {
  usage_history: Record<string, Record<string, {
    total_count: number;
    total_bytes: number;
    daily_usage: Record<string, {
      count: number;
      bytes: number;
    }>;
  }>>;
}

export interface UsageAnalyticsResponse {
  usage_analytics: {
    monthly_usage: Record<string, Array<{
      action_type: string;
      month: number;
      year: number;
      total_count: number;
      total_bytes: number;
      avg_daily_count: number;
      avg_daily_bytes: number;
    }>>;
    trends: Record<string, {
      count_change_percent: number;
      bytes_change_percent: number;
      trend: 'increasing' | 'decreasing' | 'stable';
    }>;
    peak_usage_days: Array<{
      date: string;
      action_type: string;
      total_count: number;
      total_bytes: number;
    }>;
    total_usage: {
      uploads: number;
      verifications: number;
      storage_bytes: number;
      api_calls: number;
    };
  };
  period: {
    from: string;
    to: string;
    months: number;
  };
}

export interface UsageLimitsResponse {
  limits_check: {
    action_type: string;
    has_exceeded: boolean;
    remaining_usage: number;
    unlimited: boolean;
  };
}

export interface UsageSummaryResponse {
  usage_summary: {
    today: UsageData;
    this_week: UsageData;
    this_month: UsageData;
    limits: {
      upload_limit: number | null;
      verification_limit: number | null;
      storage_limit_bytes: number | null;
    };
    subscription_plan: string;
  };
}

export interface RecordUsageRequest {
  action_type: 'upload' | 'verification' | 'storage' | 'api_call';
  count?: number;
  bytes_used?: number;
  resource_type?: string;
  resource_id?: string;
  metadata?: Record<string, any>;
}

export interface UsageHistoryFilters {
  action_type?: 'upload' | 'verification' | 'storage' | 'api_call';
  months?: number;
  from_date?: string;
  to_date?: string;
}

export interface UsageAnalyticsFilters {
  months?: number;
}

export interface ApiResponse<T> {
  message: string;
  data?: T;
  [key: string]: any;
}

class UsageAPI {
  /**
   * Record usage for the current user
   */
  async recordUsage(data: RecordUsageRequest): Promise<UsageRecord> {
    try {
      const response = await apiClient.post<ApiResponse<UsageRecord>>('/usage/record', data);
      return response.data.usage;
    } catch (error) {
      console.error('Failed to record usage:', error);
      throw error;
    }
  }

  /**
   * Get current usage for the user
   */
  async getCurrentUsage(): Promise<CurrentUsageResponse> {
    try {
      const response = await apiClient.get<any>('/usage/current');
      return response.data;
    } catch (error) {
      console.error('Failed to get current usage:', error);
      throw error;
    }
  }

  /**
   * Get usage history with optional filters
   */
  async getUsageHistory(filters: UsageHistoryFilters = {}): Promise<UsageHistoryResponse> {
    try {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });

      const response = await apiClient.get<any>(
        `/usage/history?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error('Failed to get usage history:', error);
      throw error;
    }
  }

  /**
   * Get usage analytics
   */
  async getUsageAnalytics(filters: UsageAnalyticsFilters = {}): Promise<UsageAnalyticsResponse> {
    try {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });

      const response = await apiClient.get<any>(
        `/usage/analytics?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error('Failed to get usage analytics:', error);
      throw error;
    }
  }

  /**
   * Check usage limits for specific action type
   */
  async checkLimits(actionType: 'upload' | 'verification' | 'storage' | 'api_call'): Promise<UsageLimitsResponse> {
    try {
      const response = await apiClient.get<any>(
        `/usage/limits?action_type=${actionType}`
      );
      return response.data;
    } catch (error) {
      console.error('Failed to check usage limits:', error);
      throw error;
    }
  }

  /**
   * Get usage summary
   */
  async getUsageSummary(): Promise<UsageSummaryResponse> {
    try {
      const response = await apiClient.get<any>('/usage/summary');
      return response.data;
    } catch (error) {
      console.error('Failed to get usage summary:', error);
      throw error;
    }
  }

  /**
   * Record file upload
   */
  async recordUpload(fileSize: number, fileType: string, fileId?: string): Promise<UsageRecord> {
    return this.recordUsage({
      action_type: 'upload',
      count: 1,
      bytes_used: fileSize,
      resource_type: fileType,
      resource_id: fileId,
      metadata: {
        file_size: fileSize,
        file_type: fileType,
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Record file verification
   */
  async recordVerification(fileId: string, verificationResult: any): Promise<UsageRecord> {
    return this.recordUsage({
      action_type: 'verification',
      count: 1,
      resource_type: 'file',
      resource_id: fileId,
      metadata: {
        verification_result: verificationResult,
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Record storage usage
   */
  async recordStorage(bytesUsed: number, fileId?: string): Promise<UsageRecord> {
    return this.recordUsage({
      action_type: 'storage',
      count: 1,
      bytes_used: bytesUsed,
      resource_type: 'file',
      resource_id: fileId,
      metadata: {
        storage_bytes: bytesUsed,
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Record API call
   */
  async recordApiCall(endpoint: string, method: string): Promise<UsageRecord> {
    return this.recordUsage({
      action_type: 'api_call',
      count: 1,
      resource_type: 'api',
      resource_id: `${method}:${endpoint}`,
      metadata: {
        endpoint,
        method,
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Check if user can perform action
   */
  async canPerformAction(actionType: 'upload' | 'verification' | 'storage' | 'api_call'): Promise<boolean> {
    try {
      const limitsCheck = await this.checkLimits(actionType);
      return !limitsCheck.limits_check.has_exceeded;
    } catch (error) {
      console.error('Failed to check if user can perform action:', error);
      return false;
    }
  }

  /**
   * Get usage percentage for action type
   */
  async getUsagePercentage(actionType: 'upload' | 'verification' | 'storage' | 'api_call'): Promise<number> {
    try {
      const currentUsage = await this.getCurrentUsage();
      
      switch (actionType) {
        case 'upload':
          return currentUsage.usage_percentages.uploads;
        case 'verification':
          return currentUsage.usage_percentages.verifications;
        case 'storage':
          return currentUsage.usage_percentages.storage;
        default:
          return 0;
      }
    } catch (error) {
      console.error('Failed to get usage percentage:', error);
      return 0;
    }
  }

  /**
   * Format bytes for display
   */
  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Get usage trend icon
   */
  getTrendIcon(trend: 'increasing' | 'decreasing' | 'stable'): string {
    switch (trend) {
      case 'increasing':
        return '📈';
      case 'decreasing':
        return '📉';
      case 'stable':
        return '➡️';
      default:
        return '➡️';
    }
  }

  /**
   * Get usage status color
   */
  getUsageStatusColor(percentage: number): string {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-orange-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-green-600';
  }
}

export const usageAPI = new UsageAPI();
export default usageAPI; 