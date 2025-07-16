export interface User {
  id: string
  username: string
  email: string
  avatar?: string
  subscription: 'free' | 'professional'
  createdAt: string
}

export interface WatermarkedFile {
  id: string
  name: string
  size: number
  type: string
  uploadDate: string
  status: 'completed' | 'processing' | 'failed'
  verified: boolean
  watermarkId?: string
  url?: string
}

export interface VerificationResult {
  id: string
  fileId: string
  found: boolean
  matches?: Match[]
  verifiedDate: string
  confidence: number
}

export interface Match {
  url: string
  platform: string
  confidence: number
  detectedAt: string
}

export interface Notification {
  id: string
  title: string
  message: string
  read: boolean
  timestamp: string
  type: 'info' | 'warning' | 'error' | 'success'
}

export interface Message {
  id: string
  sender: string
  subject: string
  preview: string
  read: boolean
  timestamp: string
  content?: string
}

export interface SubscriptionPlan {
  id: string
  name: string
  price: number
  features: string[]
  popular?: boolean
}

export interface BillingHistory {
  id: string
  date: string
  amount: number
  status: 'paid' | 'pending' | 'failed'
  invoice?: string
}

export interface DashboardStats {
  totalFiles: number
  verifiedFiles: number
  unverifiedFiles: number
  totalExpenses: number
  monthlyUploads: number
  detectionRate: number
}

export interface Task {
  id: string
  title: string
  description: string
  status: 'pending' | 'completed' | 'failed'
  createdAt: string
  priority: 'low' | 'medium' | 'high'
}