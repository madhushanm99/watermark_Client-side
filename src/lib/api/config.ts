// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const API_PREFIX = '/api'

export const apiConfig = {
  baseURL: `${API_BASE_URL}${API_PREFIX}`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
}

export const endpoints = {
  // Health check
  health: '/health',
  
  // Authentication
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    forgotPassword: '/auth/forgot-password',
    user: '/auth/user',
  },
  
  // Profile
  profile: {
    get: '/profile',
    update: '/profile',
    delete: '/profile',
    export: '/profile/export',
  },
  
  // Settings
  settings: {
    get: '/settings',
    update: '/settings',
  },
  
  // Activities
  activities: {
    get: '/activities',
  },
  
  // Statistics
  statistics: {
    get: '/statistics',
  },
  
  // Billing
  billing: {
    history: '/billing/history',
    transaction: (transactionId: string) => `/billing/transaction/${transactionId}`,
    payment: '/billing/payment',
    refund: '/billing/refund',
    statistics: '/billing/statistics',
    invoice: (transactionId: string) => `/billing/invoice/${transactionId}`,
  },
  
  // Usage
  usage: {
    record: '/usage/record',
    current: '/usage/current',
    history: '/usage/history',
    analytics: '/usage/analytics',
    limits: '/usage/limits',
    summary: '/usage/summary',
  },
  
  // Files
  files: {
    list: '/files',
    upload: '/files/upload',
    statistics: '/files/statistics',
    search: '/files/search',
    get: (id: string) => `/files/${id}`,
    update: (id: string) => `/files/${id}`,
    delete: (id: string) => `/files/${id}`,
    download: (id: string) => `/files/${id}/download`,
    process: (id: string) => `/files/${id}/process`,
  },
  
  // Subscriptions
  subscriptions: {
    plans: '/subscriptions/plans',
    current: '/subscriptions/current',
    subscribe: '/subscriptions/subscribe',
    changePlan: '/subscriptions/change-plan',
    cancel: '/subscriptions/cancel',
    reactivate: '/subscriptions/reactivate',
    history: '/subscriptions/history',
    usage: '/subscriptions/usage',
  },
  
  // Verification (not yet implemented in backend)
  // verification: {
  //   verify: '/verification/verify',
  //   results: '/verification/results',
  // },
}

export default apiConfig 