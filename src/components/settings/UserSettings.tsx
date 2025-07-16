'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { User, Mail, Lock, Camera, Settings } from 'lucide-react'
import { profileApi, type UpdateProfileRequest, type UserSettings as UserSettingsType } from '../../lib/api'

export default function UserSettings() {
  const { user } = useAuth()
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [settings, setSettings] = useState<UserSettingsType | null>(null)
  const [loadingSettings, setLoadingSettings] = useState(true)

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoadingSettings(true)
      const data = await profileApi.getSettings()
      setSettings(data)
    } catch (error: any) {
      console.error('Settings load error:', error)
    } finally {
      setLoadingSettings(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSaveUserSettings = async () => {
    setIsSaving(true)
    setError('')
    setSuccess('')
    
    try {
      const updateData: UpdateProfileRequest = {
        name: formData.name,
        email: formData.email,
      }

      // Only include password fields if user is changing password
      if (formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          setError('Password confirmation does not match')
          return
        }
        updateData.current_password = formData.currentPassword
        updateData.password = formData.newPassword
        updateData.password_confirmation = formData.confirmPassword
      }

      await profileApi.updateProfile(updateData)
      
      setSuccess('Profile updated successfully')
      
      // Clear password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }))
      
    } catch (error: any) {
      setError(error.message || 'Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card className="p-8">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        User Settings
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
      
      <div className="space-y-6">
        <div className="flex items-center space-x-6 mb-8">
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || '')}&background=8B5CF6&color=fff&size=100`}
            alt={user?.name}
            className="w-20 h-20 rounded-full"
          />
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Profile Picture
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              Update your profile picture
            </p>
            <Button variant="secondary" size="sm" className="flex items-center space-x-2">
              <Camera className="w-4 h-4" />
              <span>Change Photo</span>
            </Button>
          </div>
        </div>

        <Input
          label="Name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          leftIcon={<User className="w-5 h-5 text-gray-400" />}
        />

        <Input
          label="Email Address"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          leftIcon={<Mail className="w-5 h-5 text-gray-400" />}
        />

        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Change Password
          </h3>
          <div className="space-y-4">
            <Input
              label="Current Password"
              name="currentPassword"
              type="password"
              value={formData.currentPassword}
              onChange={handleInputChange}
              leftIcon={<Lock className="w-5 h-5 text-gray-400" />}
            />
            <Input
              label="New Password"
              name="newPassword"
              type="password"
              value={formData.newPassword}
              onChange={handleInputChange}
              leftIcon={<Lock className="w-5 h-5 text-gray-400" />}
            />
            <Input
              label="Confirm New Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              leftIcon={<Lock className="w-5 h-5 text-gray-400" />}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Button variant="secondary" disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSaveUserSettings} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </Card>
  )
}