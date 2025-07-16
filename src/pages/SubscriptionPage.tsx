'use client'

import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useSubscription } from '../contexts/SubscriptionContext'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import DashboardLayout from '../components/layout/DashboardLayout'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import PaymentForm from '../components/ui/PaymentForm'
import { Check, Star, CreditCard, Calendar, Download, CheckCircle, AlertCircle, TrendingUp, Shield, Zap, Users } from 'lucide-react'

export default function SubscriptionPage() {
  const { isAuthenticated, isLoading, user } = useAuth()
  const {
    plans,
    plansLoading,
    subscription,
    subscriptionLoading,
    currentUsage,
    usageLoading,
    isSubscribed,
    currentPlan,
    canUpgrade,
    canDowngrade,
    subscribe,
    changePlan,
    cancelSubscription,
    reactivateSubscription,
    getUsagePercentage,
    getRemainingUsage
  } = useSubscription()
  
  const navigate = useNavigate()
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null)
  const [selectedBillingCycle, setSelectedBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showSuccessToast, setShowSuccessToast] = useState(false)
  const [showErrorToast, setShowErrorToast] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login')
    }
  }, [isAuthenticated, isLoading, navigate])

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (plansLoading || subscriptionLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-96">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    )
  }

  const handleSelectPlan = (planId: number, billingCycle: 'monthly' | 'yearly') => {
    setSelectedPlan(planId)
    setSelectedBillingCycle(billingCycle)
    setShowPaymentModal(true)
  }

  const handlePaymentSuccess = async (transactionData: any) => {
    try {
      setIsProcessing(true)
      setShowPaymentModal(false)
      
      if (isSubscribed && selectedPlan) {
        await changePlan(selectedPlan, selectedBillingCycle, transactionData.payment_method)
      } else if (selectedPlan) {
        await subscribe(selectedPlan, selectedBillingCycle, transactionData.payment_method)
      }
      
      setShowSuccessToast(true)
      setTimeout(() => setShowSuccessToast(false), 3000)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Payment failed')
      setShowErrorToast(true)
      setTimeout(() => setShowErrorToast(false), 5000)
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePaymentError = (error: string) => {
    setErrorMessage(error)
    setShowErrorToast(true)
    setTimeout(() => setShowErrorToast(false), 5000)
  }

  const handleCancelSubscription = async () => {
    try {
      setIsProcessing(true)
      await cancelSubscription()
      setShowCancelModal(false)
      setShowSuccessToast(true)
      setTimeout(() => setShowSuccessToast(false), 3000)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to cancel subscription')
      setShowErrorToast(true)
      setTimeout(() => setShowErrorToast(false), 5000)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReactivateSubscription = async () => {
    try {
      setIsProcessing(true)
      await reactivateSubscription()
      setShowSuccessToast(true)
      setTimeout(() => setShowSuccessToast(false), 3000)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to reactivate subscription')
      setShowErrorToast(true)
      setTimeout(() => setShowErrorToast(false), 5000)
    } finally {
      setIsProcessing(false)
    }
  }

  const getSelectedPlan = () => {
    return plans.find(plan => plan.id === selectedPlan)
  }

  const getPlanIcon = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'free':
        return <Shield className="w-8 h-8 text-blue-600" />
      case 'professional':
        return <Zap className="w-8 h-8 text-purple-600" />
      case 'enterprise':
        return <Users className="w-8 h-8 text-orange-600" />
      default:
        return <Star className="w-8 h-8 text-gray-600" />
    }
  }

  const formatStorageLimit = (bytes: number | null) => {
    if (bytes === null) return 'Unlimited'
    const gb = bytes / (1024 * 1024 * 1024)
    return `${gb}GB`
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Select the perfect plan for your digital watermarking needs. Upgrade or downgrade at any time.
          </p>
        </div>

        {/* Current Subscription Status */}
        {isSubscribed && currentPlan && (
          <Card className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {getPlanIcon(currentPlan.name)}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Current Plan: {currentPlan.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {currentPlan.formatted_price} per {currentPlan.billing_cycle === 'yearly' ? 'year' : 'month'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-600">Active</span>
              </div>
            </div>
            
            {subscription && subscription.status === 'cancelled' && (
              <div className="mt-4 flex items-center justify-between bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                  <span className="text-sm text-yellow-800 dark:text-yellow-200">
                    Your subscription has been cancelled and will expire on {new Date(subscription.ends_at!).toLocaleDateString()}
                  </span>
                </div>
                <Button
                  onClick={handleReactivateSubscription}
                  disabled={isProcessing}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Reactivate
                </Button>
              </div>
            )}
          </Card>
        )}

        {/* Usage Overview */}
        {currentUsage && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Current Usage
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Uploads</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {getRemainingUsage('upload') === -1 ? 'Unlimited' : `${getRemainingUsage('upload')} left`}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(getUsagePercentage('upload'), 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {getUsagePercentage('upload').toFixed(1)}% used
                </p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Verifications</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {getRemainingUsage('verification') === -1 ? 'Unlimited' : `${getRemainingUsage('verification')} left`}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(getUsagePercentage('verification'), 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {getUsagePercentage('verification').toFixed(1)}% used
                </p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Storage</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {getRemainingUsage('storage') === -1 ? 'Unlimited' : `${(getRemainingUsage('storage') / (1024 * 1024 * 1024)).toFixed(1)}GB left`}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(getUsagePercentage('storage'), 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {getUsagePercentage('storage').toFixed(1)}% used
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Billing Cycle Toggle */}
        <div className="flex justify-center">
          <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
            <button
              onClick={() => setSelectedBillingCycle('monthly')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedBillingCycle === 'monthly'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setSelectedBillingCycle('yearly')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedBillingCycle === 'yearly'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              Yearly <span className="text-green-600 text-xs ml-1">(Save 20%)</span>
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans
            .filter(plan => plan.billing_cycle === selectedBillingCycle)
            .map((plan) => (
              <Card 
                key={plan.id}
                className={`p-6 relative transition-all duration-200 hover:shadow-lg ${
                  plan.is_popular 
                    ? 'ring-2 ring-purple-500 dark:ring-purple-400 shadow-lg' 
                    : 'hover:ring-1 hover:ring-gray-300 dark:hover:ring-gray-600'
                } ${
                  currentPlan?.id === plan.id 
                    ? 'bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20' 
                    : ''
                }`}
              >
                {plan.is_popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                      <Star className="w-3 h-3" />
                      <span>Most Popular</span>
                    </div>
                  </div>
                )}

                <div className="text-center mb-6">
                  <div className="flex justify-center mb-3">
                    {getPlanIcon(plan.name)}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    {plan.name}
                  </h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-900 dark:text-gray-100">
                      ${plan.price}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400 ml-1">
                      /{plan.billing_cycle === 'yearly' ? 'year' : 'month'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {plan.description}
                  </p>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <Check className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="space-y-2">
                  {currentPlan?.id === plan.id ? (
                    <Button
                      className="w-full bg-gray-600 hover:bg-gray-700 text-white"
                      disabled
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Current Plan
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleSelectPlan(plan.id, selectedBillingCycle)}
                      className={`w-full transition-colors ${
                        plan.is_popular
                          ? 'bg-purple-600 hover:bg-purple-700 text-white'
                          : 'border border-gray-300 dark:border-gray-600 hover:border-purple-600 dark:hover:border-purple-400'
                      }`}
                      disabled={isProcessing}
                    >
                      {isSubscribed ? 'Switch to This Plan' : 'Get Started'}
                    </Button>
                  )}
                </div>
              </Card>
            ))}
        </div>

        {/* Cancel Subscription */}
        {isSubscribed && subscription?.status === 'active' && (
          <Card className="p-6 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-red-900 dark:text-red-100">
                  Cancel Subscription
                </h3>
                <p className="text-sm text-red-700 dark:text-red-300">
                  You can cancel your subscription at any time. You'll continue to have access until your current billing period ends.
                </p>
              </div>
              <Button
                onClick={() => setShowCancelModal(true)}
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900/30"
              >
                Cancel Subscription
              </Button>
            </div>
          </Card>
        )}

        {/* Payment Modal */}
        <Modal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          title="Complete Payment"
        >
          {selectedPlan && (
            <PaymentForm
              amount={getSelectedPlan()?.price || 0}
              description={`${getSelectedPlan()?.name} Plan - ${selectedBillingCycle}`}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
              onCancel={() => setShowPaymentModal(false)}
              subscriptionId={subscription?.id}
            />
          )}
        </Modal>

        {/* Cancel Confirmation Modal */}
        <Modal
          isOpen={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          title="Cancel Subscription"
        >
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-8 h-8 text-red-600" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  Are you sure you want to cancel?
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  You'll continue to have access until {subscription?.ends_at ? new Date(subscription.ends_at).toLocaleDateString() : 'your current billing period ends'}.
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button
                onClick={handleCancelSubscription}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                disabled={isProcessing}
              >
                {isProcessing ? 'Cancelling...' : 'Yes, Cancel'}
              </Button>
              <Button
                onClick={() => setShowCancelModal(false)}
                variant="outline"
                className="flex-1"
              >
                Keep Subscription
              </Button>
            </div>
          </div>
        </Modal>

        {/* Success Toast */}
        {showSuccessToast && (
          <div className="fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5" />
              <span>Operation completed successfully!</span>
            </div>
          </div>
        )}

        {/* Error Toast */}
        {showErrorToast && (
          <div className="fixed top-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-50">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5" />
              <span>{errorMessage}</span>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}