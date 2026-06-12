'use client'

import { useEffect } from 'react'
import { getToken, onMessage } from 'firebase/messaging'
import { getFirebaseMessaging } from '@/lib/firebase'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'
const STORAGE_KEY = 'fcm_token_v2' // v2 — keyed by token value, not participantId

export function usePushNotifications(participantId: string | undefined) {
  // Register token
  useEffect(() => {
    if (!participantId) return
    if (typeof window === 'undefined') return
    if (!('Notification' in window) || !('serviceWorker' in navigator)) return
    if (Notification.permission === 'denied') return

    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
    if (!vapidKey) return

    const register = async (permission: NotificationPermission) => {
      if (permission !== 'granted') return

      try {
        const messaging = getFirebaseMessaging()
        if (!messaging) return

        await navigator.serviceWorker.register('/firebase-messaging-sw.js', { scope: '/', updateViaCache: 'none' })
        const sw = await navigator.serviceWorker.ready

        const token = await getToken(messaging, { vapidKey, serviceWorkerRegistration: sw })
        if (!token) return

        // Only re-register if the token changed (handles rotation)
        const storedToken = localStorage.getItem(STORAGE_KEY)
        if (storedToken === token) return

        const res = await fetch(`${API_URL}/notifications/fcm-token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ participantId, token }),
        })

        if (res.ok) localStorage.setItem(STORAGE_KEY, token)
      } catch (err) {
        console.error('[FCM] error:', err)
      }
    }

    if (Notification.permission === 'granted') {
      register('granted')
    } else {
      Notification.requestPermission().then(register)
    }
  }, [participantId])

  // Handle foreground messages (app open) — separate path from SW to avoid duplicates
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('Notification' in window) || !('serviceWorker' in navigator)) return

    let messaging
    try {
      messaging = getFirebaseMessaging()
    } catch (err) {
      console.error('[FCM] unsupported browser:', err)
      return
    }
    if (!messaging) return

    const unsub = onMessage(messaging, (payload) => {
      if (Notification.permission !== 'granted') return
      const title = payload.notification?.title || 'Prode Mundial 2026'
      const body = payload.notification?.body || ''
      const icon = payload.notification?.icon || '/web-app-manifest-192x192.png'
      const link = payload.fcmOptions?.link || (payload.data as any)?.link

      const n = new Notification(title, {
        body,
        icon,
      })
      if (link) {
        n.onclick = () => {
          window.open(link, '_blank')
          n.close()
        }
      }
    })

    return unsub
  }, [])
}
