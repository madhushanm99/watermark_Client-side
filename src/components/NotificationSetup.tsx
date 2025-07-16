import { useEffect } from 'react'
import { setGlobalNotificationHandler } from '../lib/api/client'
import { useNotification } from '../contexts/NotificationContext'

export const NotificationSetup = () => {
  const notification = useNotification()

  useEffect(() => {
    setGlobalNotificationHandler(notification)
  }, [notification])

  return null
} 