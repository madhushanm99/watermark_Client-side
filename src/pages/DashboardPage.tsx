'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useFiles } from '@/contexts/FileContext'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Upload, Shield, CreditCard, FileText, Calendar, HardDrive, TrendingUp, Users, Activity, ArrowRight, CheckCircle, Clock, AlertCircle, Download, Eye } from 'lucide-react'
import { formatDate, formatFileSize } from '@/lib/utils'
import { filesApi, FileStatistics } from '@/lib/api/files'

export default function DashboardPage() {
  const { user } = useAuth()
  const { files, stats, isLoading, error } = useFiles()
  const navigate = useNavigate()
  const [fileStats, setFileStats] = useState<FileStatistics | null>(null)
  const [isLoadingStats, setIsLoadingStats] = useState(true)

  // Load detailed statistics from API
  useEffect(() => {
    const loadFileStatistics = async () => {
      try {
        setIsLoadingStats(true)
        const response = await filesApi.getStatistics()
        setFileStats(response.statistics)
      } catch (err) {
        console.error('Failed to load file statistics:', err)
      } finally {
        setIsLoadingStats(false)
      }
    }

    if (user) {
      loadFileStatistics()
    }
  }, [user])

  // Generate dynamic tasks based on actual file activities
  const generateTasks = () => {
    const tasks = []
    
    // Recent uploads
    const recentUploads = files
      .filter(file => {
        const uploadDate = new Date(file.uploadDate)
        const today = new Date()
        const diffTime = Math.abs(today.getTime() - uploadDate.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return diffDays <= 1
      })
      .slice(0, 2)

    recentUploads.forEach(file => {
      tasks.push({
        id: `upload-${file.id}`,
        title: `Uploaded ${file.name}`,
        status: 'completed' as const,
        time: formatDate(file.uploadDate),
        type: 'upload'
      })
    })

    // Pending verifications
    const unverifiedFiles = files
      .filter(file => file.status === 'completed' && !file.verified)
      .slice(0, 2)

    unverifiedFiles.forEach(file => {
      tasks.push({
        id: `verify-${file.id}`,
        title: `Verify ${file.name}`,
        status: 'pending' as const,
        time: formatDate(file.uploadDate),
        type: 'verify'
      })
    })

    // Processing files
    const processingFiles = files
      .filter(file => file.status === 'processing')
      .slice(0, 2)

    processingFiles.forEach(file => {
      tasks.push({
        id: `process-${file.id}`,
        title: `Processing ${file.name}`,
        status: 'processing' as const,
        time: formatDate(file.uploadDate),
        type: 'processing'
      })
    })

    // If no tasks, show default actions
    if (tasks.length === 0) {
      tasks.push({
        id: 'upload-new',
        title: 'Upload your first file',
        status: 'pending' as const,
        time: 'Get started',
        type: 'upload'
      })
    }

    return tasks.slice(0, 5)
  }

  const tasks = generateTasks()

  // Use real statistics from FileContext and API
  const dashboardStats = {
    totalFiles: stats.totalFiles,
    verifiedFiles: stats.verifiedFiles,
    unverifiedFiles: stats.unverifiedFiles,
    detectionRate: stats.detectionRate,
    watermarkedFiles: stats.watermarkedFiles,
    processingFiles: stats.processingFiles,
    monthlyGrowth: 12, // This could come from a trend analysis
    storageUsed: fileStats?.total_size || 0,
  }

  const handleTaskClick = (task: any) => {
    switch (task.type) {
      case 'upload':
        navigate('/dashboard/upload')
        break
      case 'verify':
        navigate('/dashboard/verify')
        break
      case 'processing':
        navigate('/dashboard/files')
        break
      default:
        navigate('/dashboard/files')
        break
    }
  }

  const getTaskIcon = (task: any) => {
    switch (task.type) {
      case 'upload':
        return Upload
      case 'verify':
        return Shield
      case 'processing':
        return Clock
      default:
        return FileText
    }
  }

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500'
      case 'processing':
        return 'bg-blue-500'
      case 'pending':
        return 'bg-yellow-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getTaskStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed'
      case 'processing':
        return 'Processing'
      case 'pending':
        return 'Pending'
      default:
        return 'Unknown'
    }
  }

  const recentFiles = fileStats?.recent_files || files.slice(0, 5)

  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Column - Watermark Statistics */}
        <div className="xl:col-span-1 space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                File Statistics
              </h2>
              <div className="flex items-center text-green-600 dark:text-green-400 text-sm font-medium">
                <TrendingUp className="w-4 h-4 mr-1" />
                +{dashboardStats.monthlyGrowth}%
              </div>
            </div>
            
            {isLoadingStats ? (
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="animate-pulse p-4 bg-gray-100 dark:bg-gray-800 rounded-xl">
                    <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{dashboardStats.totalFiles}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Total Files</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{dashboardStats.watermarkedFiles}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Watermarked Files</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{dashboardStats.verifiedFiles}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Verified Files</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-yellow-600 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{dashboardStats.unverifiedFiles}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Pending Verification</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                      <HardDrive className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{formatFileSize(dashboardStats.storageUsed)}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Storage Used</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Quick Actions */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <Button
                onClick={() => navigate('/dashboard/upload')}
                className="w-full justify-start"
                variant="secondary"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload New File
              </Button>
              <Button
                onClick={() => navigate('/dashboard/verify')}
                className="w-full justify-start"
                variant="secondary"
              >
                <Eye className="w-4 h-4 mr-2" />
                Verify Files
              </Button>
              <Button
                onClick={() => navigate('/dashboard/subscription')}
                className="w-full justify-start"
                variant="secondary"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Manage Subscription
              </Button>
            </div>
          </Card>
        </div>

        {/* Right Column - Recent Activity & Files */}
        <div className="xl:col-span-2 space-y-6">
          {/* Recent Activity */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Recent Activity
              </h2>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate('/dashboard/files')}
              >
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse flex items-center p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <div className="w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded-lg mr-4"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : tasks.length > 0 ? (
              <div className="space-y-4">
                {tasks.map((task) => {
                  const Icon = getTaskIcon(task)
                  return (
                    <div
                      key={task.id}
                      onClick={() => handleTaskClick(task)}
                      className="flex items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                    >
                      <div className="relative">
                        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center mr-4">
                          <Icon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                        </div>
                        <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${getTaskStatusColor(task.status)}`}></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                          {task.title}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {getTaskStatusText(task.status)} • {task.time}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400 dark:text-gray-500 ml-2" />
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-4">No recent activity</p>
                <Button onClick={() => navigate('/dashboard/upload')}>
                  Upload Your First File
                </Button>
              </div>
            )}
          </Card>

          {/* Recent Files */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Recent Files
              </h2>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate('/dashboard/files')}
              >
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse flex items-center p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <div className="w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded-lg mr-4"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : recentFiles.length > 0 ? (
              <div className="space-y-4">
                {recentFiles.map((file) => (
                  <div
                    key={file.id}
                    onClick={() => navigate(`/dashboard/files/${file.id}`)}
                    className="flex items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                  >
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mr-4">
                      <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                        {file.name || file.original_name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatFileSize(file.size || file.file_size)} • {formatDate(file.uploadDate || file.uploaded_at)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {(file.is_watermarked || file.verified) && (
                        <Shield className="w-4 h-4 text-green-500" />
                      )}
                      {file.verified && (
                        <CheckCircle className="w-4 h-4 text-blue-500" />
                      )}
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 dark:text-gray-500 ml-2" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-4">No files uploaded yet</p>
                <Button onClick={() => navigate('/dashboard/upload')}>
                  Upload Your First File
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}