'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../components/layout/DashboardLayout'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { User, Mail, Calendar, Shield, Edit2, Camera, Activity, FileText, Download, Eye, TrendingUp, BarChart } from 'lucide-react'
import { profileApi, type ProfileData, type UserActivity, type UpdateProfileRequest } from '../lib/api'

export default function ProfilePage() {
  const { isAuthenticated, isLoading, user } = useAuth()
  const navigate = useNavigate()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [activities, setActivities] = useState<UserActivity[]>([])
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [loadingActivities, setLoadingActivities] = useState(true)

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    current_password: '',
    password: '',
    password_confirmation: '',
  })

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login')
    }
  }, [isAuthenticated, isLoading, navigate])

  useEffect(() => {
    if (isAuthenticated) {
      loadProfileData()
      loadActivities()
    }
  }, [isAuthenticated])

  const loadProfileData = async () => {
    try {
      setLoadingProfile(true)
      const data = await profileApi.getProfile()
      setProfileData(data)
      setFormData({
        name: data.user.name,
        email: data.user.email,
        current_password: '',
        password: '',
        password_confirmation: '',
      })
    } catch (error: any) {
      setError('Failed to load profile data')
      console.error('Profile load error:', error)
    } finally {
      setLoadingProfile(false)
    }
  }

  const loadActivities = async () => {
    try {
      setLoadingActivities(true)
      const data = await profileApi.getActivities({ limit: 10 })
      setActivities(data.activities)
    } catch (error: any) {
      console.error('Activities load error:', error)
    } finally {
      setLoadingActivities(false)
    }
  }

  if (isLoading || !isAuthenticated) {
    return <div>Loading...</div>
  }

  if (loadingProfile) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading profile...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    setError('')
    setSuccess('')
    
    try {
      const updateData: UpdateProfileRequest = {
        name: formData.name,
        email: formData.email,
      }

      // Only include password fields if user is changing password
      if (formData.password) {
        if (formData.password !== formData.password_confirmation) {
          setError('Password confirmation does not match')
          return
        }
        updateData.current_password = formData.current_password
        updateData.password = formData.password
        updateData.password_confirmation = formData.password_confirmation
      }

      const updatedUser = await profileApi.updateProfile(updateData)
      
      // Update profile data
      if (profileData) {
        setProfileData({
          ...profileData,
          user: updatedUser
        })
      }
      
      setSuccess('Profile updated successfully')
      setIsEditing(false)
      
      // Clear password fields
      setFormData(prev => ({
        ...prev,
        current_password: '',
        password: '',
        password_confirmation: '',
      }))
      
      // Reload activities to show the update
      loadActivities()
      
    } catch (error: any) {
      setError(error.message || 'Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setError('')
    setSuccess('')
    
    if (profileData) {
      setFormData({
        name: profileData.user.name,
        email: profileData.user.email,
        current_password: '',
        password: '',
        password_confirmation: '',
      })
    }
  }

  const stats = [
    { 
      label: 'Files Uploaded', 
      value: profileData?.statistics.total.total_files_uploaded?.toString() || '0', 
      icon: FileText 
    },
    { 
      label: 'Files Verified', 
      value: profileData?.statistics.total.total_files_verified?.toString() || '0', 
      icon: Shield 
    },
    { 
      label: 'Total Logins', 
      value: profileData?.statistics.total.total_login_count?.toString() || '0', 
      icon: Activity 
    }
  ]

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Profile Header */}
        <Card className="p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
            <div className="relative">
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(profileData?.user.name || '')}&background=8B5CF6&color=fff&size=150`}
                alt={profileData?.user.name}
                className="w-32 h-32 rounded-full object-cover"
              />
              <button className="absolute bottom-2 right-2 p-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors">
                <Camera className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {profileData?.user.name}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    {profileData?.user.email}
                  </p>
                </div>
                <Button
                  onClick={() => setIsEditing(!isEditing)}
                  variant={isEditing ? "secondary" : "primary"}
                  className="flex items-center space-x-2"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
                </Button>
              </div>

              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {new Date(profileData?.user.created_at || '').toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Shield className="w-4 h-4" />
                  <span className="capitalize">{profileData?.user.subscription_tier} Plan</span>
                </div>
              </div>

              <p className="text-gray-700 dark:text-gray-300">
                Digital content creator and protection enthusiast.
              </p>
            </div>
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="p-6 text-center">
              <stat.icon className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {stat.label}
              </div>
            </Card>
          ))}
        </div>

        {/* Profile Details */}
        <Card className="p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            Profile Information
          </h2>

          {error && (
            <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 dark:bg-red-900/20 dark:text-red-400 rounded-lg">
              {error}
            </div>
          )}
          
          {success && (
            <div className="p-4 mb-4 text-sm text-green-700 bg-green-100 dark:bg-green-900/20 dark:text-green-400 rounded-lg">
              {success}
            </div>
          )}

          {isEditing ? (
            <div className="space-y-6">
              <Input
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                leftIcon={<User className="w-5 h-5 text-gray-400" />}
                required
              />

              <Input
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                leftIcon={<Mail className="w-5 h-5 text-gray-400" />}
                required
              />

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Change Password (Optional)
                </h3>
                
                <div className="space-y-4">
                  <Input
                    label="Current Password"
                    name="current_password"
                    type="password"
                    value={formData.current_password}
                    onChange={handleInputChange}
                    placeholder="Enter your current password"
                  />

                  <Input
                    label="New Password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter new password (min 8 characters)"
                  />

                  <Input
                    label="Confirm New Password"
                    name="password_confirmation"
                    type="password"
                    value={formData.password_confirmation}
                    onChange={handleInputChange}
                    placeholder="Confirm new password"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <Button variant="secondary" onClick={handleCancel} disabled={isSaving}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Name
                  </label>
                  <p className="text-gray-900 dark:text-gray-100">{formData.name}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Email
                  </label>
                  <p className="text-gray-900 dark:text-gray-100">{formData.email}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Account Created
                  </label>
                  <p className="text-gray-900 dark:text-gray-100">
                    {new Date(profileData?.user.created_at || '').toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Subscription Tier
                  </label>
                  <p className="text-gray-900 dark:text-gray-100 capitalize">
                    {profileData?.user.subscription_tier}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Email Verified
                  </label>
                  <p className="text-gray-900 dark:text-gray-100">
                    {profileData?.user.email_verified_at ? 'Yes' : 'No'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Recent Activities */}
        <Card className="p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            Recent Activities
          </h2>
          
          {loadingActivities ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : activities.length > 0 ? (
            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex-shrink-0">
                    {activity.activity_type === 'login' && <Activity className="w-5 h-5 text-green-500" />}
                    {activity.activity_type === 'logout' && <Activity className="w-5 h-5 text-red-500" />}
                    {activity.activity_type === 'registration' && <User className="w-5 h-5 text-blue-500" />}
                    {activity.activity_type === 'profile_update' && <Edit2 className="w-5 h-5 text-purple-500" />}
                    {activity.activity_type === 'settings_update' && <Shield className="w-5 h-5 text-orange-500" />}
                    {!['login', 'logout', 'registration', 'profile_update', 'settings_update'].includes(activity.activity_type) && (
                      <Activity className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {activity.description}
                      </p>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(activity.activity_time).toLocaleDateString()} at{' '}
                        {new Date(activity.activity_time).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {activity.activity_type.replace('_', ' ').toUpperCase()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No recent activities found.
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  )
}