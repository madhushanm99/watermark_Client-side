import React, { useState } from 'react'
import { Button } from './Button'
import { Input } from './Input'
import { Card } from './Card'
import { CreditCard, Lock, Check } from 'lucide-react'

interface PaymentFormProps {
  amount: number
  description?: string
  onSuccess?: (transactionData: any) => void
  onError?: (error: string) => void
  onCancel?: () => void
  isLoading?: boolean
  subscriptionId?: number
}

interface CardFormData {
  cardNumber: string
  expiryDate: string
  cvv: string
  cardholderName: string
  billingAddress: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  amount,
  description = "Payment",
  onSuccess,
  onError,
  onCancel,
  isLoading = false,
  subscriptionId
}) => {
  const [formData, setFormData] = useState<CardFormData>({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    billingAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'US'
    }
  })
  
  const [errors, setErrors] = useState<Partial<CardFormData>>({})
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = matches && matches[0] || ''
    const parts = []
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    
    if (parts.length) {
      return parts.join(' ')
    } else {
      return v
    }
  }

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4)
    }
    return v
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<CardFormData> = {}
    
    if (!formData.cardNumber || formData.cardNumber.replace(/\s/g, '').length < 13) {
      newErrors.cardNumber = 'Please enter a valid card number'
    }
    
    if (!formData.expiryDate || formData.expiryDate.length < 5) {
      newErrors.expiryDate = 'Please enter expiry date (MM/YY)'
    }
    
    if (!formData.cvv || formData.cvv.length < 3) {
      newErrors.cvv = 'Please enter CVV'
    }
    
    if (!formData.cardholderName.trim()) {
      newErrors.cardholderName = 'Please enter cardholder name'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof CardFormData, value: string) => {
    let formattedValue = value
    
    if (field === 'cardNumber') {
      formattedValue = formatCardNumber(value)
    } else if (field === 'expiryDate') {
      formattedValue = formatExpiryDate(value)
    } else if (field === 'cvv') {
      formattedValue = value.replace(/[^0-9]/g, '').substring(0, 4)
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: formattedValue
    }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }))
    }
  }

  const handleBillingAddressChange = (field: keyof CardFormData['billingAddress'], value: string) => {
    setFormData(prev => ({
      ...prev,
      billingAddress: {
        ...prev.billingAddress,
        [field]: value
      }
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setIsProcessing(true)
    
    try {
      // Import billing API here to avoid circular dependencies
      const { billingAPI } = await import('../../lib/api/billing')
      
      // Process payment with the backend
      const paymentData = {
        amount,
        currency: 'USD',
        payment_method: `**** **** **** ${formData.cardNumber.slice(-4)}`,
        description,
        subscription_id: subscriptionId,
        metadata: {
          card_holder: formData.cardholderName,
          card_type: getCardType(formData.cardNumber),
          billing_address: formData.billingAddress,
          payment_method: 'credit_card'
        }
      }
      
      const transaction = await billingAPI.processPayment(paymentData)
      
      setPaymentSuccess(true)
      setTimeout(() => {
        onSuccess?.(transaction)
      }, 1500)
      
    } catch (error) {
      console.error('Payment failed:', error)
      onError?.(error instanceof Error ? error.message : 'Payment failed')
    } finally {
      setIsProcessing(false)
    }
  }

  const getCardType = (cardNumber: string): string => {
    const number = cardNumber.replace(/\s/g, '')
    
    if (number.startsWith('4')) return 'visa'
    if (number.startsWith('5') || number.startsWith('2')) return 'mastercard'
    if (number.startsWith('3')) return 'amex'
    if (number.startsWith('6')) return 'discover'
    
    return 'unknown'
  }

  const getCardIcon = (cardNumber: string) => {
    const type = getCardType(cardNumber)
    
    switch (type) {
      case 'visa':
        return <div className="text-blue-600 font-bold text-sm">VISA</div>
      case 'mastercard':
        return <div className="text-red-600 font-bold text-sm">MC</div>
      case 'amex':
        return <div className="text-blue-800 font-bold text-sm">AMEX</div>
      case 'discover':
        return <div className="text-orange-600 font-bold text-sm">DISC</div>
      default:
        return <CreditCard className="w-5 h-5 text-gray-400" />
    }
  }

  if (paymentSuccess) {
    return (
      <Card className="p-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Payment Successful!
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Your payment of ${amount.toFixed(2)} has been processed successfully.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            You will receive a confirmation email shortly.
          </p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Payment Information
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {description} - ${amount.toFixed(2)}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Card Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Card Number
          </label>
          <div className="relative">
            <Input
              type="text"
              placeholder="1234 5678 9012 3456"
              value={formData.cardNumber}
              onChange={(e) => handleInputChange('cardNumber', e.target.value)}
              className={`pr-12 ${errors.cardNumber ? 'border-red-500' : ''}`}
              maxLength={19}
              disabled={isProcessing}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {getCardIcon(formData.cardNumber)}
            </div>
          </div>
          {errors.cardNumber && (
            <p className="mt-1 text-sm text-red-600">{errors.cardNumber}</p>
          )}
        </div>

        {/* Expiry and CVV */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Expiry Date
            </label>
            <Input
              type="text"
              placeholder="MM/YY"
              value={formData.expiryDate}
              onChange={(e) => handleInputChange('expiryDate', e.target.value)}
              className={errors.expiryDate ? 'border-red-500' : ''}
              maxLength={5}
              disabled={isProcessing}
            />
            {errors.expiryDate && (
              <p className="mt-1 text-sm text-red-600">{errors.expiryDate}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              CVV
            </label>
            <Input
              type="text"
              placeholder="123"
              value={formData.cvv}
              onChange={(e) => handleInputChange('cvv', e.target.value)}
              className={errors.cvv ? 'border-red-500' : ''}
              maxLength={4}
              disabled={isProcessing}
            />
            {errors.cvv && (
              <p className="mt-1 text-sm text-red-600">{errors.cvv}</p>
            )}
          </div>
        </div>

        {/* Cardholder Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Cardholder Name
          </label>
          <Input
            type="text"
            placeholder="John Doe"
            value={formData.cardholderName}
            onChange={(e) => handleInputChange('cardholderName', e.target.value)}
            className={errors.cardholderName ? 'border-red-500' : ''}
            disabled={isProcessing}
          />
          {errors.cardholderName && (
            <p className="mt-1 text-sm text-red-600">{errors.cardholderName}</p>
          )}
        </div>

        {/* Billing Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Billing Address
          </label>
          <div className="space-y-3">
            <Input
              type="text"
              placeholder="Street Address"
              value={formData.billingAddress.street}
              onChange={(e) => handleBillingAddressChange('street', e.target.value)}
              disabled={isProcessing}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="text"
                placeholder="City"
                value={formData.billingAddress.city}
                onChange={(e) => handleBillingAddressChange('city', e.target.value)}
                disabled={isProcessing}
              />
              <Input
                type="text"
                placeholder="State"
                value={formData.billingAddress.state}
                onChange={(e) => handleBillingAddressChange('state', e.target.value)}
                disabled={isProcessing}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="text"
                placeholder="ZIP Code"
                value={formData.billingAddress.zipCode}
                onChange={(e) => handleBillingAddressChange('zipCode', e.target.value)}
                disabled={isProcessing}
              />
              <select
                value={formData.billingAddress.country}
                onChange={(e) => handleBillingAddressChange('country', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                disabled={isProcessing}
              >
                <option value="US">United States</option>
                <option value="CA">Canada</option>
                <option value="GB">United Kingdom</option>
                <option value="AU">Australia</option>
              </select>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <Lock className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Your payment information is encrypted and secure. This is a pilot system for testing purposes.
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4">
          <Button
            type="submit"
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
            disabled={isProcessing || isLoading}
          >
            {isProcessing ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
          </Button>
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isProcessing}
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Card>
  )
}

export default PaymentForm 