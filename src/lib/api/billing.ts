import { apiClient } from './client';

export interface BillingTransaction {
  id: number;
  user_id: number;
  subscription_id: number | null;
  transaction_id: string;
  type: 'payment' | 'refund' | 'dispute' | 'adjustment' | 'credit';
  status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  amount: number;
  currency: string;
  description: string | null;
  payment_method: string | null;
  external_transaction_id: string | null;
  invoice_number: string | null;
  metadata: Record<string, any> | null;
  transaction_date: string;
  subscription?: {
    id: number;
    subscription_plan: {
      id: number;
      name: string;
      slug: string;
    };
  };
  formatted_amount: string;
  formatted_transaction_date: string;
  created_at: string;
  updated_at: string;
}

export interface BillingHistory {
  data: BillingTransaction[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export interface BillingStatistics {
  total_payments: number;
  total_refunds: number;
  successful_payments: number;
  failed_payments: number;
  pending_payments: number;
  last_payment_date: string | null;
  next_billing_date: string | null;
}

export interface ProcessPaymentRequest {
  amount: number;
  currency?: string;
  payment_method: string;
  description?: string;
  subscription_id?: number;
}

export interface ProcessRefundRequest {
  transaction_id: string;
  amount?: number;
  reason?: string;
}

export interface Invoice {
  invoice_number: string;
  transaction_id: string;
  date: string;
  due_date: string;
  customer: {
    name: string;
    email: string;
  };
  items: Array<{
    description: string;
    quantity: number;
    unit_price: number;
    total: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  status: string;
}

export interface BillingHistoryFilters {
  per_page?: number;
  page?: number;
  type?: 'payment' | 'refund' | 'dispute' | 'adjustment' | 'credit';
  status?: 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  from_date?: string;
  to_date?: string;
}

export interface ApiResponse<T> {
  message: string;
  data?: T;
  [key: string]: any;
}

class BillingAPI {
  /**
   * Get billing history with optional filters
   */
  async getBillingHistory(filters: BillingHistoryFilters = {}): Promise<BillingHistory> {
    try {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });

      const response = await apiClient.get<ApiResponse<BillingHistory>>(
        `/billing/history?${params.toString()}`
      );
      return response.data.billing_history;
    } catch (error) {
      console.error('Failed to get billing history:', error);
      throw error;
    }
  }

  /**
   * Get specific transaction by ID
   */
  async getTransaction(transactionId: string): Promise<BillingTransaction> {
    try {
      const response = await apiClient.get<ApiResponse<BillingTransaction>>(
        `/billing/transaction/${transactionId}`
      );
      return response.data.transaction;
    } catch (error) {
      console.error('Failed to get transaction:', error);
      throw error;
    }
  }

  /**
   * Process a payment
   */
  async processPayment(data: ProcessPaymentRequest): Promise<BillingTransaction> {
    try {
      const response = await apiClient.post<ApiResponse<BillingTransaction>>(
        '/billing/payment',
        data
      );
      return response.data.transaction;
    } catch (error) {
      console.error('Failed to process payment:', error);
      throw error;
    }
  }

  /**
   * Process a refund
   */
  async processRefund(data: ProcessRefundRequest): Promise<BillingTransaction> {
    try {
      const response = await apiClient.post<ApiResponse<BillingTransaction>>(
        '/billing/refund',
        data
      );
      return response.data.refund;
    } catch (error) {
      console.error('Failed to process refund:', error);
      throw error;
    }
  }

  /**
   * Get billing statistics
   */
  async getBillingStatistics(): Promise<BillingStatistics> {
    try {
      const response = await apiClient.get<ApiResponse<BillingStatistics>>('/billing/statistics');
      return response.data.statistics;
    } catch (error) {
      console.error('Failed to get billing statistics:', error);
      throw error;
    }
  }

  /**
   * Generate invoice for a transaction
   */
  async generateInvoice(transactionId: string): Promise<Invoice> {
    try {
      const response = await apiClient.get<ApiResponse<Invoice>>(
        `/billing/invoice/${transactionId}`
      );
      return response.data.invoice;
    } catch (error) {
      console.error('Failed to generate invoice:', error);
      throw error;
    }
  }

  /**
   * Get recent transactions
   */
  async getRecentTransactions(limit: number = 10): Promise<BillingTransaction[]> {
    try {
      const billingHistory = await this.getBillingHistory({ per_page: limit, page: 1 });
      return billingHistory.data;
    } catch (error) {
      console.error('Failed to get recent transactions:', error);
      throw error;
    }
  }

  /**
   * Get successful payments
   */
  async getSuccessfulPayments(limit: number = 10): Promise<BillingTransaction[]> {
    try {
      const billingHistory = await this.getBillingHistory({
        per_page: limit,
        page: 1,
        type: 'payment',
        status: 'completed'
      });
      return billingHistory.data;
    } catch (error) {
      console.error('Failed to get successful payments:', error);
      throw error;
    }
  }

  /**
   * Get failed payments
   */
  async getFailedPayments(limit: number = 10): Promise<BillingTransaction[]> {
    try {
      const billingHistory = await this.getBillingHistory({
        per_page: limit,
        page: 1,
        type: 'payment',
        status: 'failed'
      });
      return billingHistory.data;
    } catch (error) {
      console.error('Failed to get failed payments:', error);
      throw error;
    }
  }

  /**
   * Get refunds
   */
  async getRefunds(limit: number = 10): Promise<BillingTransaction[]> {
    try {
      const billingHistory = await this.getBillingHistory({
        per_page: limit,
        page: 1,
        type: 'refund'
      });
      return billingHistory.data;
    } catch (error) {
      console.error('Failed to get refunds:', error);
      throw error;
    }
  }

  /**
   * Format amount for display
   */
  formatAmount(amount: number, currency: string = 'USD'): string {
    const symbol = currency === 'USD' ? '$' : currency + ' ';
    return symbol + amount.toFixed(2);
  }

  /**
   * Format date for display
   */
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  /**
   * Get transaction status badge color
   */
  getStatusBadgeColor(status: string): string {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      case 'refunded':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  /**
   * Get transaction type badge color
   */
  getTypeBadgeColor(type: string): string {
    switch (type) {
      case 'payment':
        return 'bg-blue-100 text-blue-800';
      case 'refund':
        return 'bg-orange-100 text-orange-800';
      case 'dispute':
        return 'bg-red-100 text-red-800';
      case 'adjustment':
        return 'bg-purple-100 text-purple-800';
      case 'credit':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
}

export const billingAPI = new BillingAPI();
export default billingAPI; 