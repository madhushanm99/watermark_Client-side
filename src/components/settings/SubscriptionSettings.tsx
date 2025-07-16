'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useSubscription } from '../../contexts/SubscriptionContext'
import { useNavigate } from 'react-router-dom'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import { Modal } from '../ui/Modal'
import PaymentForm from '../ui/PaymentForm'
import { Check, Star, CreditCard, Calendar, Download, Plus, AlertCircle, CheckCircle, Eye, FileText, TrendingUp, Activity } from 'lucide-react'
import { billingAPI } from '../../lib/api'
import type { BillingTransaction } from '../../lib/api'

export default function SubscriptionSettings() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const {
    plans,
    plansLoading,
    subscription,
    subscriptionLoading,
    currentUsage,
    usageLoading,
    isSubscribed,
    currentPlan,
    billingStats,
    recentTransactions,
    subscribe,
    changePlan,
    cancelSubscription,
    getUsagePercentage,
    getRemainingUsage
  } = useSubscription()

  const [selectedPlan, setSelectedPlan] = useState<number | null>(null)
  const [selectedBillingCycle, setSelectedBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showBillingHistory, setShowBillingHistory] = useState(false)
  const [billingHistory, setBillingHistory] = useState<BillingTransaction[]>([])
  const [billingHistoryLoading, setBillingHistoryLoading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showSuccessToast, setShowSuccessToast] = useState(false)
  const [showErrorToast, setShowErrorToast] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (showBillingHistory) {
      loadBillingHistory()
    }
  }, [showBillingHistory])

  const loadBillingHistory = async () => {
    try {
      setBillingHistoryLoading(true)
      const history = await billingAPI.getBillingHistory({ per_page: 20 })
      setBillingHistory(history.data)
    } catch (error) {
      console.error('Failed to load billing history:', error)
    } finally {
      setBillingHistoryLoading(false)
    }
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

  const getSelectedPlan = () => {
    return plans.find(plan => plan.id === selectedPlan)
  }

  const getStatusBadge = (status: string) => {
    const statusColors = {
      'active': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      'cancelled': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      'expired': 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
      'pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
    }
    
    return statusColors[status as keyof typeof statusColors] || statusColors.pending
  }

  const getBillingStatusBadge = (status: string) => {
    const statusColors = {
      'completed': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      'failed': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      'pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      'cancelled': 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
      'refunded': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
    }
    
    return statusColors[status as keyof typeof statusColors] || statusColors.pending
  }

  if (plansLoading || subscriptionLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Current Plan Status */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Current Plan: {currentPlan?.name || 'Free'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {isSubscribed 
                ? 'You have access to all premium features'
                : 'Upgrade to unlock advanced features'
              }
            </p>
            {subscription && (
              <div className="mt-2 flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(subscription.status)}`}>
                  {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                </span>
                {subscription.next_billing_date && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Next billing: {new Date(subscription.next_billing_date).toLocaleDateString()}
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              ${currentPlan?.price || 0}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              per {currentPlan?.billing_cycle === 'yearly' ? 'year' : 'month'}
            </div>
          </div>
        </div>
      </Card>

      {/* Usage Statistics */}
      {currentUsage && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Current Usage
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="flex items-center space-x-2"
            >
              <Activity className="w-4 h-4" />
              <span>View Details</span>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Uploads</span>
                <span className="text-sm text-blue-600 dark:text-blue-400">
                  {getRemainingUsage('upload') === -1 ? 'Unlimited' : `${getRemainingUsage('upload')} left`}
                </span>
              </div>
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-100 mb-1">
                {currentUsage.current_usage.upload?.count || 0}
              </div>
              <div className="text-sm text-blue-600 dark:text-blue-400">
                {getUsagePercentage('upload').toFixed(1)}% used
              </div>
            </div>
            
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-purple-900 dark:text-purple-100">Verifications</span>
                <span className="text-sm text-purple-600 dark:text-purple-400">
                  {getRemainingUsage('verification') === -1 ? 'Unlimited' : `${getRemainingUsage('verification')} left`}
                </span>
              </div>
              <div className="text-2xl font-bold text-purple-900 dark:text-purple-100 mb-1">
                {currentUsage.current_usage.verification?.count || 0}
              </div>
              <div className="text-sm text-purple-600 dark:text-purple-400">
                {getUsagePercentage('verification').toFixed(1)}% used
              </div>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-green-900 dark:text-green-100">Storage</span>
                <span className="text-sm text-green-600 dark:text-green-400">
                  {getRemainingUsage('storage') === -1 ? 'Unlimited' : `${(getRemainingUsage('storage') / (1024 * 1024 * 1024)).toFixed(1)}GB left`}
                </span>
              </div>
              <div className="text-2xl font-bold text-green-900 dark:text-green-100 mb-1">
                {((currentUsage.current_usage.storage?.bytes || 0) / (1024 * 1024 * 1024)).toFixed(2)}GB
              </div>
              <div className="text-sm text-green-600 dark:text-green-400">
                {getUsagePercentage('storage').toFixed(1)}% used
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Billing Overview */}
      {billingStats && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Billing Overview
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowBillingHistory(true)}
              className="flex items-center space-x-2"
            >
              <Eye className="w-4 h-4" />
              <span>View History</span>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Paid</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                ${billingStats.total_payments.toFixed(2)}
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Successful Payments</div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {billingStats.successful_payments}
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Failed Payments</div>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {billingStats.failed_payments}
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Last Payment</div>
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {billingStats.last_payment_date ? new Date(billingStats.last_payment_date).toLocaleDateString() : 'None'}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Recent Transactions */}
      {recentTransactions.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Recent Transactions
          </h3>
          <div className="space-y-3">
            {recentTransactions.map((transaction) => (
              <div 
                key={transaction.id} 
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    transaction.status === 'completed' ? 'bg-green-500' : 
                    transaction.status === 'failed' ? 'bg-red-500' : 'bg-yellow-500'
                  }`} />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {transaction.description}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(transaction.transaction_date).toLocaleDateString()} • {transaction.transaction_id}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    ${transaction.amount.toFixed(2)}
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBillingStatusBadge(transaction.status)}`}>
                    {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Available Plans */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          Available Plans
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.filter(plan => plan.billing_cycle === 'monthly').map((plan) => (
            <Card 
              key={plan.id}
              className={`p-6 relative ${
                plan.is_popular 
                  ? 'ring-2 ring-purple-600 dark:ring-purple-400' 
                  : ''
              } ${
                currentPlan?.id === plan.id 
                  ? 'bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20' 
                  : ''
              }`}
            >
              {plan.is_popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                    <Star className="w-3 h-3" />
                    <span>Most Popular</span>
                  </div>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {plan.name}
                </h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    ${plan.price}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">
                    /month
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {plan.description}
                </p>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
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
                    onClick={() => handleSelectPlan(plan.id, 'monthly')}
                    className={`w-full ${
                      plan.is_popular
                        ? 'bg-purple-600 hover:bg-purple-700 text-white'
                        : 'border border-gray-300 hover:border-purple-600 dark:border-gray-600 dark:hover:border-purple-400'
                    }`}
                    disabled={isProcessing}
                  >
                    {isSubscribed ? 'Switch to This Plan' : 'Select Plan'}
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Manage Subscription */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Manage Subscription
        </h3>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          <Button
            onClick={() => navigate('/subscription')}
            className="bg-purple-600 hover:bg-purple-700 text-white flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>View All Plans</span>
          </Button>
          <Button
            onClick={() => navigate('/payment-methods')}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <CreditCard className="w-4 h-4" />
            <span>Payment Methods</span>
          </Button>
        </div>
      </Card>

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

      {/* Billing History Modal */}
      <Modal
        isOpen={showBillingHistory}
        onClose={() => setShowBillingHistory(false)}
        title="Billing History"
      >
        <div className="space-y-4">
          {billingHistoryLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : billingHistory.length > 0 ? (
            <div className="space-y-3">
              {billingHistory.map((transaction) => (
                <div 
                  key={transaction.id} 
                  className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      transaction.status === 'completed' ? 'bg-green-500' : 
                      transaction.status === 'failed' ? 'bg-red-500' : 'bg-yellow-500'
                    }`} />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {transaction.description}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(transaction.transaction_date).toLocaleDateString()} • {transaction.transaction_id}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      ${transaction.amount.toFixed(2)}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBillingStatusBadge(transaction.status)}`}>
                      {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No billing history found</p>
            </div>
          )}
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
  )
}