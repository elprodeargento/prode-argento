'use client'

import { useEffect } from 'react'
import { getToken } from 'firebase/messaging'
import { getFirebaseMessaging } from '@/lib/firebase'
import { apiPost } from '@/lib/api'

const STORAGE_KEY = 'admin_fcm_token_registered'

export function useAdminPushNotifications() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('Notification' in window) || !('serviceWorker' in navigator)) return
    if (Notification.permission === 'denied') return
    if (localStorage.getItem(STORAGE_KEY) === '1') return

    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
    if (!vapidKey) return

    Notification.requestPermission().then(async (permission) => {
      if (permission !== 'granted') return

      try {
        const messaging = getFirebaseMessaging()
        if (!messaging) return

        const sw = await navigator.serviceWorker.register('/firebase-messaging-sw.js', { scope: '/' })
        const token = await getToken(messaging, { vapidKey, serviceWorkerRegistration: sw })
        if (!token) return

        await apiPost('/notifications/admin-fcm-token', { token })
        localStorage.setItem(STORAGE_KEY, '1')
      } catch {
        // Silently fail
      }
    })
  }, [])
}
