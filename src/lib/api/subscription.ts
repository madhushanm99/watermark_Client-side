import { apiClient } from './client';

export interface SubscriptionPlan {
  id: number;
  name: string;
  slug: string;
  price: number;
  billing_cycle: 'monthly' | 'yearly';
  upload_limit: number | null;
  verification_limit: number | null;
  storage_limit_bytes: number | null;
  features: string[];
  is_active: boolean;
  is_popular: boolean;
  description: string;
  sort_order: number;
  formatted_price: string;
  formatted_storage_limit: string;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: number;
  user_id: number;
  subscription_plan_id: number;
  status: 'active' | 'cancelled' | 'expired' | 'pending' | 'past_due';
  starts_at: string;
  ends_at: string | null;
  cancelled_at: string | null;
  next_billing_date: string | null;
  amount: number;
  billing_cycle: 'monthly' | 'yearly';
  payment_method: string | null;
  external_id: string | null;
  metadata: Record<string, any> | null;
  subscription_plan: SubscriptionPlan;
  formatted_amount: string;
  days_until_next_billing: number;
  days_remaining: number;
  created_at: string;
  updated_at: string;
}

export interface UsageData {
  upload?: { count: number; bytes: number };
  verification?: { count: number; bytes: number };
  storage?: { count: number; bytes: number };
  api_call?: { count: number; bytes: number };
}

export interface UsageResponse {
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

export interface SubscribeRequest {
  plan_id: number;
  billing_cycle: 'monthly' | 'yearly';
  payment_method?: string;
}

export interface ChangePlanRequest {
  plan_id: number;
  billing_cycle: 'monthly' | 'yearly';
  payment_method?: string;
}

export interface ApiResponse<T> {
  message: string;
  data?: T;
  [key: string]: any;
}

class SubscriptionAPI {
  /**
   * Get all available subscription plans
   */
  async getPlans(): Promise<SubscriptionPlan[]> {
    try {
      const response = await apiClient.get<ApiResponse<SubscriptionPlan[]>>('/subscriptions/plans');
      return response.data.plans || [];
    } catch (error) {
      console.error('Failed to get subscription plans:', error);
      throw error;
    }
  }

  /**
   * Get current user's subscription
   */
  async getCurrentSubscription(): Promise<Subscription | null> {
    try {
      const response = await apiClient.get<ApiResponse<Subscription>>('/subscriptions/current');
      return response.data.subscription || null;
    } catch (error) {
      console.error('Failed to get current subscription:', error);
      throw error;
    }
  }

  /**
   * Subscribe to a plan
   */
  async subscribe(data: SubscribeRequest): Promise<Subscription> {
    try {
      const response = await apiClient.post<ApiResponse<Subscription>>('/subscriptions/subscribe', data);
      return response.data.subscription;
    } catch (error) {
      console.error('Failed to subscribe to plan:', error);
      throw error;
    }
  }

  /**
   * Change subscription plan
   */
  async changePlan(data: ChangePlanRequest): Promise<Subscription> {
    try {
      const response = await apiClient.put<ApiResponse<Subscription>>('/subscriptions/change-plan', data);
      return response.data.subscription;
    } catch (error) {
      console.error('Failed to change subscription plan:', error);
      throw error;
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(): Promise<void> {
    try {
      await apiClient.post('/subscriptions/cancel');
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      throw error;
    }
  }

  /**
   * Reactivate subscription
   */
  async reactivateSubscription(): Promise<Subscription> {
    try {
      const response = await apiClient.post<ApiResponse<Subscription>>('/subscriptions/reactivate');
      return response.data.subscription;
    } catch (error) {
      console.error('Failed to reactivate subscription:', error);
      throw error;
    }
  }

  /**
   * Get subscription history
   */
  async getSubscriptionHistory(): Promise<Subscription[]> {
    try {
      const response = await apiClient.get<ApiResponse<Subscription[]>>('/subscriptions/history');
      return response.data.subscriptions || [];
    } catch (error) {
      console.error('Failed to get subscription history:', error);
      throw error;
    }
  }

  /**
   * Get usage information
   */
  async getUsage(): Promise<UsageResponse> {
    try {
      const response = await apiClient.get<UsageResponse>('/subscriptions/usage');
      return response.data;
    } catch (error) {
      console.error('Failed to get usage information:', error);
      throw error;
    }
  }

  /**
   * Get plan by ID
   */
  async getPlanById(planId: number): Promise<SubscriptionPlan | null> {
    try {
      const plans = await this.getPlans();
      return plans.find(plan => plan.id === planId) || null;
    } catch (error) {
      console.error('Failed to get plan by ID:', error);
      throw error;
    }
  }

  /**
   * Get plan by slug
   */
  async getPlanBySlug(slug: string): Promise<SubscriptionPlan | null> {
    try {
      const plans = await this.getPlans();
      return plans.find(plan => plan.slug === slug) || null;
    } catch (error) {
      console.error('Failed to get plan by slug:', error);
      throw error;
    }
  }

  /**
   * Check if user has active subscription
   */
  async hasActiveSubscription(): Promise<boolean> {
    try {
      const subscription = await this.getCurrentSubscription();
      return subscription && subscription.status === 'active';
    } catch (error) {
      console.error('Failed to check active subscription:', error);
      return false;
    }
  }

  /**
   * Get subscription status
   */
  async getSubscriptionStatus(): Promise<'active' | 'cancelled' | 'expired' | 'pending' | 'past_due' | 'none'> {
    try {
      const subscription = await this.getCurrentSubscription();
      return subscription ? subscription.status : 'none';
    } catch (error) {
      console.error('Failed to get subscription status:', error);
      return 'none';
    }
  }
}

export const subscriptionAPI = new SubscriptionAPI();
export default subscriptionAPI; 