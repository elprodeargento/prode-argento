'use client'

import { useEffect } from 'react'
import { getToken } from 'firebase/messaging'
import { getFirebaseMessaging } from '@/lib/firebase'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'
const STORAGE_KEY = 'fcm_token_registered'

export function usePushNotifications(participantId: string | undefined) {
  useEffect(() => {
    if (!participantId) return
    if (typeof window === 'undefined') return
    if (!('Notification' in window) || !('serviceWorker' in navigator)) return
    if (Notification.permission === 'denied') return

    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
    if (!vapidKey) return

    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === participantId) return

    Notification.requestPermission().then(async (permission) => {
      console.log('[FCM] permission:', permission)
      if (permission !== 'granted') return

      try {
        const messaging = getFirebaseMessaging()
        if (!messaging) { console.warn('[FCM] messaging null'); return }

        console.log('[FCM] registering SW...')
        const sw = await navigator.serviceWorker.register('/firebase-messaging-sw.js', { scope: '/' })
        console.log('[FCM] SW registered:', sw.scope)

        console.log('[FCM] getting token...')
        const token = await getToken(messaging, { vapidKey, serviceWorkerRegistration: sw })
        console.log('[FCM] token:', token ? token.slice(0, 20) + '...' : 'NULL')
        if (!token) return

        console.log('[FCM] registering with API...')
        const res = await fetch(`${API_URL}/notifications/fcm-token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ participantId, token }),
        })
        console.log('[FCM] API response:', res.status)

        if (res.ok) localStorage.setItem(STORAGE_KEY, participantId)
      } catch (err) {
        console.error('[FCM] error:', err)
      }
    })
  }, [participantId])
}
