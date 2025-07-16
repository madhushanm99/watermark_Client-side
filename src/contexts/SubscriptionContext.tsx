import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { subscriptionAPI, billingAPI, usageAPI } from '../lib/api'
import { useAuth } from './AuthContext'
import type { 
  SubscriptionPlan, 
  Subscription, 
  BillingStatistics, 
  CurrentUsageResponse,
  BillingTransaction 
} from '../lib/api'

interface SubscriptionContextType {
  // Plans
  plans: SubscriptionPlan[]
  plansLoading: boolean
  
  // Current subscription
  subscription: Subscription | null
  subscriptionLoading: boolean
  
  // Billing
  billingStats: BillingStatistics | null
  billingStatsLoading: boolean
  recentTransactions: BillingTransaction[]
  
  // Usage
  currentUsage: CurrentUsageResponse | null
  usageLoading: boolean
  
  // Actions
  refreshSubscription: () => Promise<void>
  refreshPlans: () => Promise<void>
  refreshBillingStats: () => Promise<void>
  refreshUsage: () => Promise<void>
  subscribe: (planId: number, billingCycle: 'monthly' | 'yearly', paymentMethod?: string) => Promise<void>
  changePlan: (planId: number, billingCycle: 'monthly' | 'yearly', paymentMethod?: string) => Promise<void>
  cancelSubscription: () => Promise<void>
  reactivateSubscription: () => Promise<void>
  
  // Computed values
  isSubscribed: boolean
  currentPlan: SubscriptionPlan | null
  canUpgrade: boolean
  canDowngrade: boolean
  hasExceededLimits: (actionType: 'upload' | 'verification' | 'storage') => boolean
  getRemainingUsage: (actionType: 'upload' | 'verification' | 'storage') => number
  getUsagePercentage: (actionType: 'upload' | 'verification' | 'storage') => number
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined)

export const useSubscription = () => {
  const context = useContext(SubscriptionContext)
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider')
  }
  return context
}

interface SubscriptionProviderProps {
  children: ReactNode
}

export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({ children }) => {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [plansLoading, setPlansLoading] = useState(true)
  
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [subscriptionLoading, setSubscriptionLoading] = useState(true)
  
  const [billingStats, setBillingStats] = useState<BillingStatistics | null>(null)
  const [billingStatsLoading, setBillingStatsLoading] = useState(true)
  const [recentTransactions, setRecentTransactions] = useState<BillingTransaction[]>([])
  
  const [currentUsage, setCurrentUsage] = useState<CurrentUsageResponse | null>(null)
  const [usageLoading, setUsageLoading] = useState(true)

  // Fetch subscription plans
  const refreshPlans = async () => {
    try {
      setPlansLoading(true)
      const plansData = await subscriptionAPI.getPlans()
      setPlans(plansData)
    } catch (error) {
      console.error('Failed to fetch plans:', error)
    } finally {
      setPlansLoading(false)
    }
  }

  // Fetch current subscription
  const refreshSubscription = async () => {
    try {
      setSubscriptionLoading(true)
      const subscriptionData = await subscriptionAPI.getCurrentSubscription()
      setSubscription(subscriptionData)
    } catch (error) {
      console.error('Failed to fetch subscription:', error)
      setSubscription(null)
    } finally {
      setSubscriptionLoading(false)
    }
  }

  // Fetch billing statistics
  const refreshBillingStats = async () => {
    try {
      setBillingStatsLoading(true)
      const [stats, transactions] = await Promise.all([
        billingAPI.getBillingStatistics(),
        billingAPI.getRecentTransactions(5)
      ])
      setBillingStats(stats)
      setRecentTransactions(transactions)
    } catch (error) {
      console.error('Failed to fetch billing stats:', error)
    } finally {
      setBillingStatsLoading(false)
    }
  }

  // Fetch usage data
  const refreshUsage = async () => {
    try {
      setUsageLoading(true)
      const usageData = await usageAPI.getCurrentUsage()
      setCurrentUsage(usageData)
    } catch (error: any) {
      // Handle case where user has no active subscription
      if (error?.message === 'No active subscription found') {
        setCurrentUsage(null)
      } else {
        console.error('Failed to fetch usage:', error)
      }
    } finally {
      setUsageLoading(false)
    }
  }

  // Subscribe to a plan
  const subscribe = async (planId: number, billingCycle: 'monthly' | 'yearly', paymentMethod?: string) => {
    try {
      const newSubscription = await subscriptionAPI.subscribe({
        plan_id: planId,
        billing_cycle: billingCycle,
        payment_method: paymentMethod
      })
      setSubscription(newSubscription)
      
      // Refresh related data
      await Promise.all([
        refreshBillingStats(),
        refreshUsage()
      ])
    } catch (error) {
      console.error('Failed to subscribe:', error)
      throw error
    }
  }

  // Change subscription plan
  const changePlan = async (planId: number, billingCycle: 'monthly' | 'yearly', paymentMethod?: string) => {
    try {
      const newSubscription = await subscriptionAPI.changePlan({
        plan_id: planId,
        billing_cycle: billingCycle,
        payment_method: paymentMethod
      })
      setSubscription(newSubscription)
      
      // Refresh related data
      await Promise.all([
        refreshBillingStats(),
        refreshUsage()
      ])
    } catch (error) {
      console.error('Failed to change plan:', error)
      throw error
    }
  }

  // Cancel subscription
  const cancelSubscription = async () => {
    try {
      await subscriptionAPI.cancelSubscription()
      await refreshSubscription()
    } catch (error) {
      console.error('Failed to cancel subscription:', error)
      throw error
    }
  }

  // Reactivate subscription
  const reactivateSubscription = async () => {
    try {
      const reactivatedSubscription = await subscriptionAPI.reactivateSubscription()
      setSubscription(reactivatedSubscription)
      await refreshUsage()
    } catch (error) {
      console.error('Failed to reactivate subscription:', error)
      throw error
    }
  }

  // Computed values
  const isSubscribed = subscription?.status === 'active'
  
  const currentPlan = subscription?.subscription_plan || null
  
  const canUpgrade = isSubscribed && currentPlan ? 
    plans.some(plan => plan.price > currentPlan.price) : 
    false
  
  const canDowngrade = isSubscribed && currentPlan ? 
    plans.some(plan => plan.price < currentPlan.price) : 
    false

  const hasExceededLimits = (actionType: 'upload' | 'verification' | 'storage'): boolean => {
    if (!currentUsage || !currentPlan) return false
    
    const usage = currentUsage.current_usage[actionType]
    const limits = currentUsage.plan_limits
    
    switch (actionType) {
      case 'upload':
        return limits.upload_limit !== null && (usage?.count || 0) >= limits.upload_limit
      case 'verification':
        return limits.verification_limit !== null && (usage?.count || 0) >= limits.verification_limit
      case 'storage':
        return limits.storage_limit_bytes !== null && (usage?.bytes || 0) >= limits.storage_limit_bytes
      default:
        return false
    }
  }

  const getRemainingUsage = (actionType: 'upload' | 'verification' | 'storage'): number => {
    if (!currentUsage) return 0
    
    switch (actionType) {
      case 'upload':
        return currentUsage.remaining_usage.uploads
      case 'verification':
        return currentUsage.remaining_usage.verifications
      case 'storage':
        return currentUsage.remaining_usage.storage
      default:
        return 0
    }
  }

  const getUsagePercentage = (actionType: 'upload' | 'verification' | 'storage'): number => {
    if (!currentUsage) return 0
    
    switch (actionType) {
      case 'upload':
        return currentUsage.usage_percentages.uploads
      case 'verification':
        return currentUsage.usage_percentages.verifications
      case 'storage':
        return currentUsage.usage_percentages.storage
      default:
        return 0
    }
  }

  // Initialize data on mount, only if authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      const initializeData = async () => {
        // First get plans and subscription
        await Promise.all([
          refreshPlans(),
          refreshSubscription(),
          refreshBillingStats()
        ])
        
        // Then get usage data only if there's an active subscription
        // We'll trigger this after subscription is fetched
      }
      
      initializeData()
    } else if (!authLoading && !isAuthenticated) {
      // Reset data when not authenticated
      setPlans([])
      setSubscription(null)
      setBillingStats(null)
      setCurrentUsage(null)
      setRecentTransactions([])
      setPlansLoading(false)
      setSubscriptionLoading(false)
      setBillingStatsLoading(false)
      setUsageLoading(false)
    }
  }, [authLoading, isAuthenticated])

  // Fetch usage data when subscription changes
  useEffect(() => {
    if (isAuthenticated && subscription && !subscriptionLoading) {
      refreshUsage()
    } else if (!subscription && !subscriptionLoading) {
      // Clear usage data when no subscription
      setCurrentUsage(null)
    }
  }, [isAuthenticated, subscription, subscriptionLoading])

  const value: SubscriptionContextType = {
    // Data
    plans,
    plansLoading,
    subscription,
    subscriptionLoading,
    billingStats,
    billingStatsLoading,
    recentTransactions,
    currentUsage,
    usageLoading,
    
    // Actions
    refreshSubscription,
    refreshPlans,
    refreshBillingStats,
    refreshUsage,
    subscribe,
    changePlan,
    cancelSubscription,
    reactivateSubscription,
    
    // Computed values
    isSubscribed,
    currentPlan,
    canUpgrade,
    canDowngrade,
    hasExceededLimits,
    getRemainingUsage,
    getUsagePercentage
  }

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  )
}

export default SubscriptionProvider 