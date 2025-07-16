'use client'

import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import DashboardLayout from '../components/layout/DashboardLayout'
import { Card } from '../components/ui/Card'
import { User, CreditCard, Shield, Bell, Palette, FileText } from 'lucide-react'

// Import setting components
import UserSettings from '../components/settings/UserSettings'
import SubscriptionSettings from '../components/settings/SubscriptionSettings'
import WatermarkSettings from '../components/settings/WatermarkSettings'
import ThemeToggle from '../components/layout/ThemeToggle'

export default function SettingsPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('user')

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login')
    }
  }, [isAuthenticated, isLoading, navigate])

  if (isLoading || !isAuthenticated) {
    return <div>Loading...</div>
  }

  const tabs = [
    { id: 'user', name: 'User Settings', icon: User },
    { id: 'subscription', name: 'Subscription', icon: CreditCard },
    { id: 'watermark', name: 'Watermark Preferences', icon: Shield },
    { id: 'files', name: 'File Settings', icon: FileText },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'appearance', name: 'Appearance', icon: Palette }
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'user':
        return <UserSettings />
      case 'subscription':
        return <SubscriptionSettings />
      case 'watermark':
        return <WatermarkSettings />
      case 'files':
        return <FileSettings />
      case 'notifications':
        return <NotificationSettings />
      case 'appearance':
        return <AppearanceSettings />
      default:
        return <UserSettings />
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-1/4">
            <Card className="p-4 overflow-y-auto max-h-[calc(100vh-200px)]">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <tab.icon className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium">{tab.name}</span>
                  </button>
                ))}
              </nav>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

// File Settings Component
function FileSettings() {
  return (
    <Card className="p-8">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        File Settings
      </h2>
      <div className="space-y-6">
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              Auto-delete processed files
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Automatically delete original files after watermarking
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              File retention period
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              How long to keep files in your account
            </p>
          </div>
          <select className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg">
            <option>30 days</option>
            <option>90 days</option>
            <option>1 year</option>
            <option>Forever</option>
          </select>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              Maximum file size
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Set upload limit for files
            </p>
          </div>
          <select className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg">
            <option>10 MB</option>
            <option>50 MB</option>
            <option>100 MB</option>
            <option>500 MB</option>
          </select>
        </div>
      </div>
    </Card>
  )
}

// Notification Settings Component
function NotificationSettings() {
  return (
    <Card className="p-8">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        Notification Settings
      </h2>
      <div className="space-y-6">
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              Email notifications
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Receive email updates about your files
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" defaultChecked />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              Verification alerts
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Get notified when AI usage is detected
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" defaultChecked />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
          </label>
        </div>
      </div>
    </Card>
  )
}

// Appearance Settings Component
function AppearanceSettings() {
  return (
    <Card className="p-8">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        Appearance Settings
      </h2>
      <div className="space-y-6">
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              Theme
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Choose your preferred theme
            </p>
          </div>
          <ThemeToggle />
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              Compact mode
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Use a more compact interface layout
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
          </label>
        </div>
      </div>
    </Card>
  )
}