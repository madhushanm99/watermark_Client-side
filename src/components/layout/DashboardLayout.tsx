'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useFiles } from '@/contexts/FileContext'
import { 
  LayoutDashboard, 
  Upload, 
  Shield, 
  CreditCard, 
  Settings, 
  HelpCircle, 
  LogOut,
  Search,
  MessageSquare,
  Bell,
  ChevronDown,
  Menu,
  X,
  Check,
  FileText
} from 'lucide-react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import ThemeToggle from './ThemeToggle'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout } = useAuth()
  const { files } = useFiles()
  const navigate = useNavigate()
  const location = useLocation()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showMessages, setShowMessages] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [showSearchResults, setShowSearchResults] = useState(false)

  // Refs for click outside detection
  const notificationRef = useRef<HTMLDivElement>(null)
  const messageRef = useRef<HTMLDivElement>(null)
  const userDropdownRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLDivElement>(null)

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Upload & Watermark', href: '/upload', icon: Upload },
    { name: 'Verify Usage', href: '/verify', icon: Shield },
    { name: 'Subscription', href: '/subscription', icon: CreditCard },
  ]

  const secondaryNavigation = [
    { name: 'Settings', href: '/settings', icon: Settings },
    { name: 'Get Help', href: '/help', icon: HelpCircle },
  ]

  const [notifications, setNotifications] = useState([
    { id: 1, title: 'File processed', message: 'document.pdf has been watermarked', time: '2m ago', read: false },
    { id: 2, title: 'Verification complete', message: 'No matches found for contract.docx', time: '1h ago', read: false },
    { id: 3, title: 'Subscription reminder', message: 'Your free trial expires in 5 days', time: '1d ago', read: true },
  ])

  const [messages, setMessages] = useState([
    { id: 1, sender: 'Support Team', subject: 'Welcome to WatermarkPro', preview: 'Thank you for joining our platform...', time: '1h ago', read: false },
    { id: 2, sender: 'System', subject: 'File Processing Complete', preview: 'Your document has been successfully...', time: '3h ago', read: false },
  ])

  // Search functionality
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = files.filter(file =>
        file.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setSearchResults(filtered)
      setShowSearchResults(true)
    } else {
      setSearchResults([])
      setShowSearchResults(false)
    }
  }, [searchQuery, files])

  // Click outside handler
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
      if (messageRef.current && !messageRef.current.contains(event.target as Node)) {
        setShowMessages(false)
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false)
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const getPageTitle = () => {
    const currentNav = [...navigation, ...secondaryNavigation].find(item => item.href === location.pathname)
    return currentNav?.name || 'Dashboard'
  }

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })))
  }

  const markAllMessagesAsRead = () => {
    setMessages(prev => prev.map(msg => ({ ...msg, read: true })))
  }

  const handleSearchResultClick = (file: any) => {
    setSearchQuery('')
    setShowSearchResults(false)
    navigate(`/file-detail/${file.id}`, { state: { file } })
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchResults.length > 0) {
      handleSearchResultClick(searchResults[0])
    } else if (searchQuery.trim()) {
      // Navigate to verify page with search query
      navigate('/verify', { state: { searchQuery } })
      setSearchQuery('')
      setShowSearchResults(false)
    }
  }

  const unreadNotifications = notifications.filter(n => !n.read).length
  const unreadMessages = messages.filter(m => !m.read).length

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile sidebar backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Improved tablet layout */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Logo - Fixed height */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gradient truncate">WatermarkPro</span>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation - Scrollable content area */}
          <div className="flex-1 flex flex-col min-h-0">
            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
              {/* Primary Navigation */}
              <div className="space-y-1">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href
                  return (
                    <button
                      key={item.name}
                      onClick={() => {
                        navigate(item.href)
                        setIsSidebarOpen(false)
                      }}
                      className={`sidebar-item w-full ${isActive ? 'active' : ''}`}
                    >
                      <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
                      <span className="truncate text-left">{item.name}</span>
                    </button>
                  )
                })}
              </div>

              {/* Spacer */}
              <div className="py-4">
                <div className="border-t border-gray-200 dark:border-gray-700"></div>
              </div>

              {/* Secondary Navigation */}
              <div className="space-y-1">
                {secondaryNavigation.map((item) => {
                  const isActive = location.pathname === item.href
                  return (
                    <button
                      key={item.name}
                      onClick={() => {
                        navigate(item.href)
                        setIsSidebarOpen(false)
                      }}
                      className={`sidebar-item w-full ${isActive ? 'active' : ''}`}
                    >
                      <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
                      <span className="truncate text-left">{item.name}</span>
                    </button>
                  )
                })}
              </div>
            </nav>

            {/* Bottom section - Fixed at bottom */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
              <button
                onClick={async () => {
                  try {
                    await logout()
                  } catch (error) {
                    console.error('Logout error:', error)
                  }
                }}
                className="sidebar-item w-full text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <LogOut className="w-5 h-5 mr-3 flex-shrink-0" />
                <span className="truncate text-left">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top bar - Fixed/Sticky on mobile */}
        <header className="sticky top-0 z-30 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 backdrop-blur-sm bg-white/95 dark:bg-gray-800/95">
          <div className="flex items-center justify-between px-4 sm:px-6 py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 truncate">
                {getPageTitle()}
              </h1>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Global Search */}
              <div className="hidden md:block relative" ref={searchRef}>
                <form onSubmit={handleSearchSubmit}>
                  <Input
                    type="text"
                    placeholder="Search files..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-48 lg:w-64"
                    leftIcon={<Search className="w-4 h-4 text-gray-400" />}
                  />
                </form>

                {/* Search Results Dropdown */}
                {showSearchResults && (
                  <div className="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50 max-h-64 overflow-y-auto">
                    {searchResults.length > 0 ? (
                      <>
                        <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            Found {searchResults.length} file{searchResults.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                        {searchResults.map((file) => (
                          <button
                            key={file.id}
                            onClick={() => handleSearchResultClick(file)}
                            className="w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600 last:border-b-0 transition-colors"
                          >
                            <div className="flex items-center space-x-3">
                              <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                  {file.name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  Uploaded {new Date(file.uploadDate).toLocaleDateString()}
                                </p>
                              </div>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                file.status === 'completed' 
                                  ? file.verified
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                              }`}>
                                {file.status === 'completed' 
                                  ? file.verified ? 'verified' : 'protected'
                                  : file.status
                                }
                              </span>
                            </div>
                          </button>
                        ))}
                      </>
                    ) : searchQuery.trim() ? (
                      <div className="p-4 text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                          No files found for "{searchQuery}"
                        </p>
                        <button
                          onClick={() => {
                            navigate('/verify', { state: { searchQuery } })
                            setSearchQuery('')
                            setShowSearchResults(false)
                          }}
                          className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
                        >
                          View all files
                        </button>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>

              {/* Messages */}
              <div className="relative" ref={messageRef}>
                <button
                  onClick={() => {
                    setShowMessages(!showMessages)
                    setShowNotifications(false)
                    setShowUserDropdown(false)
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg relative transition-colors"
                >
                  <MessageSquare className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  {unreadMessages > 0 && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-purple-600 rounded-full"></span>
                  )}
                </button>

                {showMessages && (
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50 animate-slide-up">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">Messages</h3>
                      {unreadMessages > 0 && (
                        <button
                          onClick={markAllMessagesAsRead}
                          className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 flex items-center space-x-1"
                        >
                          <Check className="w-3 h-3" />
                          <span>Mark all read</span>
                        </button>
                      )}
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {messages.map((message) => (
                        <div key={message.id} className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600 last:border-b-0 ${!message.read ? 'bg-purple-50 dark:bg-purple-900/10' : ''}`}>
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-medium text-sm text-gray-900 dark:text-gray-100">{message.sender}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">{message.time}</span>
                          </div>
                          <div className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">{message.subject}</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">{message.preview}</div>
                          {!message.read && (
                            <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Notifications */}
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => {
                    setShowNotifications(!showNotifications)
                    setShowMessages(false)
                    setShowUserDropdown(false)
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg relative transition-colors"
                >
                  <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 rounded-full"></span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50 animate-slide-up">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">Notifications</h3>
                      {unreadNotifications > 0 && (
                        <button
                          onClick={markAllNotificationsAsRead}
                          className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 flex items-center space-x-1"
                        >
                          <Check className="w-3 h-3" />
                          <span>Mark all read</span>
                        </button>
                      )}
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div key={notification.id} className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600 last:border-b-0 ${!notification.read ? 'bg-red-50 dark:bg-red-900/10' : ''}`}>
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-medium text-sm text-gray-900 dark:text-gray-100">{notification.title}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">{notification.time}</span>
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">{notification.message}</div>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-red-600 rounded-full mt-2"></div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* User Profile */}
              <div className="relative" ref={userDropdownRef}>
                <button
                  onClick={() => {
                    setShowUserDropdown(!showUserDropdown)
                    setShowNotifications(false)
                    setShowMessages(false)
                  }}
                  className="flex items-center space-x-2 sm:space-x-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <img
                    src={user?.avatar || 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop&crop=face'}
                    alt={user?.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="hidden sm:block text-sm font-medium text-gray-900 dark:text-gray-100 truncate max-w-24">
                    {user?.name}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400 hidden sm:block" />
                </button>

                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50 animate-slide-up">
                    <div className="p-2">
                      <button
                        onClick={() => {
                          navigate('/profile')
                          setShowUserDropdown(false)
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        User Profile
                      </button>
                      <button
                        onClick={() => {
                          navigate('/settings')
                          setShowUserDropdown(false)
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        Settings
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}