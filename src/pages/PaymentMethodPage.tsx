'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useSubscription } from '../contexts/SubscriptionContext'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../components/layout/DashboardLayout'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { Modal } from '../components/ui/Modal'
import PaymentForm from '../components/ui/PaymentForm'
import { 
  CreditCard, 
  Plus, 
  Edit2, 
  Trash2, 
  CheckCircle, 
  AlertCircle, 
  Lock,
  Calendar,
  DollarSign,
  FileText,
  Eye,
  Download
} from 'lucide-react'
import { billingAPI } from '../lib/api'
import type { BillingTransaction } from '../lib/api'

interface PaymentMethod {
  id: string
  type: 'credit_card' | 'debit_card' | 'paypal'
  last_four: string
  brand: string
  expiry_month: number
  expiry_year: number
  is_default: boolean
  created_at: string
}

export default function PaymentMethodPage() {
  const { isAuthenticated, isLoading, user } = useAuth()
  const { subscription, billingStats, recentTransactions } = useSubscription()
  const navigate = useNavigate()
  
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [showAddPaymentMethod, setShowAddPaymentMethod] = useState(false)
  const [showBillingHistory, setShowBillingHistory] = useState(false)
  const [billingHistory, setBillingHistory] = useState<BillingTransaction[]>([])
  const [billingHistoryLoading, setBillingHistoryLoading] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<BillingTransaction | null>(null)
  const [showTransactionDetail, setShowTransactionDetail] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showSuccessToast, setShowSuccessToast] = useState(false)
  const [showErrorToast, setShowErrorToast] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login')
    }
  }, [isAuthenticated, isLoading, navigate])

  useEffect(() => {
    if (isAuthenticated) {
      loadPaymentMethods()
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (showBillingHistory) {
      loadBillingHistory()
    }
  }, [showBillingHistory])

  const loadPaymentMethods = async () => {
    // Mock payment methods for pilot project
    const mockPaymentMethods: PaymentMethod[] = [
      {
        id: '1',
        type: 'credit_card',
        last_four: '4242',
        brand: 'Visa',
        expiry_month: 12,
        expiry_year: 2025,
        is_default: true,
        created_at: '2024-01-15T00:00:00Z'
      },
      {
        id: '2',
        type: 'credit_card',
        last_four: '0005',
        brand: 'Mastercard',
        expiry_month: 8,
        expiry_year: 2026,
        is_default: false,
        created_at: '2024-02-20T00:00:00Z'
      }
    ]
    setPaymentMethods(mockPaymentMethods)
  }

  const loadBillingHistory = async () => {
    try {
      setBillingHistoryLoading(true)
      const history = await billingAPI.getBillingHistory({ per_page: 50 })
      setBillingHistory(history.data)
    } catch (error) {
      console.error('Failed to load billing history:', error)
      setErrorMessage('Failed to load billing history')
      setShowErrorToast(true)
    } finally {
      setBillingHistoryLoading(false)
    }
  }

  const handleAddPaymentMethod = async (paymentData: any) => {
    try {
      setIsProcessing(true)
      
      // Mock adding payment method
      const newPaymentMethod: PaymentMethod = {
        id: Date.now().toString(),
        type: 'credit_card',
        last_four: paymentData.cardNumber.slice(-4),
        brand: getBrandFromCardNumber(paymentData.cardNumber),
        expiry_month: parseInt(paymentData.expiryDate.split('/')[0]),
        expiry_year: parseInt('20' + paymentData.expiryDate.split('/')[1]),
        is_default: paymentMethods.length === 0,
        created_at: new Date().toISOString()
      }
      
      setPaymentMethods(prev => [...prev, newPaymentMethod])
      setShowAddPaymentMethod(false)
      setShowSuccessToast(true)
      setTimeout(() => setShowSuccessToast(false), 3000)
    } catch (error) {
      setErrorMessage('Failed to add payment method')
      setShowErrorToast(true)
      setTimeout(() => setShowErrorToast(false), 5000)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSetDefault = async (paymentMethodId: string) => {
    try {
      setIsProcessing(true)
      
      setPaymentMethods(prev => 
        prev.map(pm => ({
          ...pm,
          is_default: pm.id === paymentMethodId
        }))
      )
      
      setShowSuccessToast(true)
      setTimeout(() => setShowSuccessToast(false), 3000)
    } catch (error) {
      setErrorMessage('Failed to set default payment method')
      setShowErrorToast(true)
      setTimeout(() => setShowErrorToast(false), 5000)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDeletePaymentMethod = async (paymentMethodId: string) => {
    try {
      setIsProcessing(true)
      
      setPaymentMethods(prev => prev.filter(pm => pm.id !== paymentMethodId))
      
      setShowSuccessToast(true)
      setTimeout(() => setShowSuccessToast(false), 3000)
    } catch (error) {
      setErrorMessage('Failed to delete payment method')
      setShowErrorToast(true)
      setTimeout(() => setShowErrorToast(false), 5000)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleViewTransaction = (transaction: BillingTransaction) => {
    setSelectedTransaction(transaction)
    setShowTransactionDetail(true)
  }

  const handleDownloadInvoice = async (transactionId: string) => {
    try {
      const invoice = await billingAPI.generateInvoice(transactionId)
      
      // Create a simple text invoice for pilot project
      const invoiceText = `
INVOICE ${invoice.invoice_number}
Date: ${invoice.date}
Due Date: ${invoice.due_date}

Bill To:
${invoice.customer.name}
${invoice.customer.email}

Items:
${invoice.items.map(item => `${item.description} - $${item.total.toFixed(2)}`).join('\n')}

Subtotal: $${invoice.subtotal.toFixed(2)}
Tax: $${invoice.tax.toFixed(2)}
Total: $${invoice.total.toFixed(2)}

Status: ${invoice.status.toUpperCase()}
      `
      
      const blob = new Blob([invoiceText], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `invoice-${invoice.invoice_number}.txt`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      setErrorMessage('Failed to generate invoice')
      setShowErrorToast(true)
      setTimeout(() => setShowErrorToast(false), 5000)
    }
  }

  const getBrandFromCardNumber = (cardNumber: string): string => {
    const number = cardNumber.replace(/\s/g, '')
    if (number.startsWith('4')) return 'Visa'
    if (number.startsWith('5') || number.startsWith('2')) return 'Mastercard'
    if (number.startsWith('3')) return 'American Express'
    if (number.startsWith('6')) return 'Discover'
    return 'Unknown'
  }

  const getBrandIcon = (brand: string) => {
    switch (brand.toLowerCase()) {
      case 'visa':
        return <div className="text-blue-600 font-bold text-sm">VISA</div>
      case 'mastercard':
        return <div className="text-red-600 font-bold text-sm">MC</div>
      case 'american express':
        return <div className="text-blue-800 font-bold text-sm">AMEX</div>
      case 'discover':
        return <div className="text-orange-600 font-bold text-sm">DISC</div>
      default:
        return <CreditCard className="w-5 h-5 text-gray-400" />
    }
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

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Payment Methods
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your payment methods and billing history
            </p>
          </div>
          <Button
            onClick={() => setShowAddPaymentMethod(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Payment Method</span>
          </Button>
        </div>

        {/* Current Subscription */}
        {subscription && (
          <Card className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-800">
            <div className="flex items-center justify-between">
        <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Current Subscription
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {subscription.subscription_plan.name} - {subscription.formatted_amount} per {subscription.billing_cycle === 'yearly' ? 'year' : 'month'}
          </p>
        </div>
              {subscription.next_billing_date && (
                <div className="text-right">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Next billing</div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {new Date(subscription.next_billing_date).toLocaleDateString()}
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Payment Methods */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Saved Payment Methods
            </h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {paymentMethods.length} method{paymentMethods.length !== 1 ? 's' : ''} saved
            </span>
          </div>

          {paymentMethods.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400 mb-4">No payment methods saved</p>
              <Button
                onClick={() => setShowAddPaymentMethod(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                Add Your First Payment Method
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paymentMethods.map((method) => (
                <Card 
                  key={method.id} 
                  className={`p-4 relative ${method.is_default ? 'ring-2 ring-purple-600 dark:ring-purple-400' : ''}`}
                >
                  {method.is_default && (
                    <div className="absolute -top-2 -right-2">
                      <div className="bg-purple-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                        Default
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-3 mb-3">
                    {getBrandIcon(method.brand)}
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {method.brand} ending in {method.last_four}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Expires {method.expiry_month.toString().padStart(2, '0')}/{method.expiry_year}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Added {new Date(method.created_at).toLocaleDateString()}
                    </div>
                  <div className="flex items-center space-x-2">
                      {!method.is_default && (
                        <Button
                          onClick={() => handleSetDefault(method.id)}
                          size="sm"
                          variant="outline"
                          disabled={isProcessing}
                        >
                          Set Default
                        </Button>
                      )}
                      <Button
                        onClick={() => handleDeletePaymentMethod(method.id)}
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-700 dark:hover:bg-red-900/20"
                        disabled={isProcessing}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>

        {/* Billing Statistics */}
        {billingStats && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
              Billing Overview
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-green-800 dark:text-green-200">Total Paid</span>
                </div>
                <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                  ${billingStats.total_payments.toFixed(2)}
                </div>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                  <span className="text-sm text-blue-800 dark:text-blue-200">Successful</span>
                </div>
                <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {billingStats.successful_payments}
                </div>
              </div>
              
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <span className="text-sm text-red-800 dark:text-red-200">Failed</span>
                </div>
                <div className="text-2xl font-bold text-red-900 dark:text-red-100">
                  {billingStats.failed_payments}
                </div>
              </div>
              
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  <span className="text-sm text-purple-800 dark:text-purple-200">Last Payment</span>
                </div>
                <div className="text-sm font-medium text-purple-900 dark:text-purple-100">
                  {billingStats.last_payment_date ? new Date(billingStats.last_payment_date).toLocaleDateString() : 'None'}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Recent Transactions */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Recent Transactions
            </h2>
                    <Button
              onClick={() => setShowBillingHistory(true)}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Eye className="w-4 h-4" />
              <span>View All</span>
                    </Button>
          </div>

          {recentTransactions.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No transactions yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTransactions.slice(0, 5).map((transaction) => (
                <div 
                  key={transaction.id} 
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                  onClick={() => handleViewTransaction(transaction)}
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
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        ${transaction.amount.toFixed(2)}
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBillingStatusBadge(transaction.status)}`}>
                        {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                      </span>
                    </div>
                    {transaction.status === 'completed' && (
                    <div onClick={(e) => {
                      e.stopPropagation()
                      handleDownloadInvoice(transaction.transaction_id)
                    }}>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex items-center space-x-1"
                      >
                        <Download className="w-3 h-3" />
                        <span>Invoice</span>
                      </Button>
                    </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Add Payment Method Modal */}
        <Modal
          isOpen={showAddPaymentMethod}
          onClose={() => setShowAddPaymentMethod(false)}
          title="Add Payment Method"
        >
          <PaymentForm
            amount={0}
            description="Add Payment Method"
            onSuccess={handleAddPaymentMethod}
            onError={(error) => {
              setErrorMessage(error)
              setShowErrorToast(true)
              setTimeout(() => setShowErrorToast(false), 5000)
            }}
            onCancel={() => setShowAddPaymentMethod(false)}
          />
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
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {billingHistory.map((transaction) => (
                  <div 
                    key={transaction.id} 
                    className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                    onClick={() => handleViewTransaction(transaction)}
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
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          ${transaction.amount.toFixed(2)}
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBillingStatusBadge(transaction.status)}`}>
                          {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                        </span>
                      </div>
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

        {/* Transaction Detail Modal */}
        <Modal
          isOpen={showTransactionDetail}
          onClose={() => setShowTransactionDetail(false)}
          title="Transaction Details"
        >
          {selectedTransaction && (
              <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Transaction ID</div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {selectedTransaction.transaction_id}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Amount</div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      ${selectedTransaction.amount.toFixed(2)}
                    </div>
                  </div>
            <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Status</div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBillingStatusBadge(selectedTransaction.status)}`}>
                      {selectedTransaction.status.charAt(0).toUpperCase() + selectedTransaction.status.slice(1)}
                    </span>
                </div>
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Date</div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {new Date(selectedTransaction.transaction_date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Description</div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {selectedTransaction.description}
                  </div>
                </div>
              </div>
            </div>

              {selectedTransaction.status === 'completed' && (
                <div className="flex space-x-3">
              <Button 
                    onClick={() => handleDownloadInvoice(selectedTransaction.transaction_id)}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white flex items-center space-x-2"
              >
                    <Download className="w-4 h-4" />
                    <span>Download Invoice</span>
              </Button>
                </div>
              )}
            </div>
          )}
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