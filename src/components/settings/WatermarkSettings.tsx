'use client'

import React, { useState } from 'react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Shield, Sliders, Eye, EyeOff } from 'lucide-react'

export default function WatermarkSettings() {
  const [settings, setSettings] = useState({
    defaultOpacity: 50,
    defaultPosition: 'center',
    resilienceMode: true,
    autoWatermark: false,
    customText: '',
    fontSize: 12,
    color: '#000000'
  })

  const handleSliderChange = (name: string, value: number) => {
    setSettings(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleToggle = (name: string) => {
    setSettings(prev => ({
      ...prev,
      [name]: !prev[name as keyof typeof prev]
    }))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setSettings(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSave = () => {
    console.log('Saving watermark settings:', settings)
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Watermark Preferences
          </h2>
        </div>

        <div className="space-y-8">
          {/* Default Opacity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Default Opacity: {settings.defaultOpacity}%
            </label>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">0%</span>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.defaultOpacity}
                onChange={(e) => handleSliderChange('defaultOpacity', parseInt(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 slider"
              />
              <span className="text-sm text-gray-500">100%</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Lower opacity makes watermarks more subtle but may reduce detection accuracy
            </p>
          </div>

          {/* Default Position */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Default Watermark Position
            </label>
            <select
              name="defaultPosition"
              value={settings.defaultPosition}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="center">Center</option>
              <option value="top-left">Top Left</option>
              <option value="top-right">Top Right</option>
              <option value="bottom-left">Bottom Left</option>
              <option value="bottom-right">Bottom Right</option>
              <option value="diagonal">Diagonal Pattern</option>
            </select>
          </div>

          {/* Resilience Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
            <div className="flex items-center space-x-3">
              <Sliders className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  Enhanced Resilience Mode
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Stronger watermarks that resist compression and editing
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={settings.resilienceMode}
                onChange={() => handleToggle('resilienceMode')}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
            </label>
          </div>

          {/* Auto Watermark */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
            <div className="flex items-center space-x-3">
              <Eye className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  Auto-apply Watermarks
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Automatically watermark files upon upload
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={settings.autoWatermark}
                onChange={() => handleToggle('autoWatermark')}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
            </label>
          </div>

          {/* Custom Watermark Text */}
          <div>
            <Input
              label="Custom Watermark Text (Optional)"
              name="customText"
              value={settings.customText}
              onChange={handleInputChange}
              placeholder="Enter custom text for watermarks"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Leave empty to use default invisible watermarks
            </p>
          </div>

          {/* Font Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Font Size: {settings.fontSize}px
            </label>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">8px</span>
              <input
                type="range"
                min="8"
                max="24"
                value={settings.fontSize}
                onChange={(e) => handleSliderChange('fontSize', parseInt(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
              <span className="text-sm text-gray-500">24px</span>
            </div>
          </div>

          {/* Color Picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Watermark Color
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                name="color"
                value={settings.color}
                onChange={handleInputChange}
                className="w-12 h-12 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer"
              />
              <Input
                name="color"
                value={settings.color}
                onChange={handleInputChange}
                className="flex-1"
                placeholder="#000000"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Button variant="secondary">
            Reset to Defaults
          </Button>
          <Button onClick={handleSave}>
            Save Preferences
          </Button>
        </div>
      </Card>

      {/* Preview Card */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Watermark Preview
        </h3>
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-8 text-center relative overflow-hidden">
          <div className="text-gray-600 dark:text-gray-400 mb-4">
            Sample Document Content
          </div>
          <div 
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{
              opacity: settings.defaultOpacity / 100,
              color: settings.color,
              fontSize: `${settings.fontSize}px`,
              transform: settings.defaultPosition === 'diagonal' ? 'rotate(-45deg)' : 'none'
            }}
          >
            {settings.customText || 'WATERMARK'}
          </div>
        </div>
      </Card>
    </div>
  )
}