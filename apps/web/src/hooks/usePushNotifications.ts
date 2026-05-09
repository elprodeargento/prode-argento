'use client'

import { useEffect } from 'react'
import { getToken, onMessage } from 'firebase/messaging'
import { getFirebaseMessaging } from '@/lib/firebase'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'
const STORAGE_KEY = 'fcm_token_registered'

export function usePushNotifications(participantId: string | undefined) {
  // Register token
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
      if (permission !== 'granted') return

      try {
        const messaging = getFirebaseMessaging()
        if (!messaging) return

        await navigator.serviceWorker.register('/firebase-messaging-sw.js', { scope: '/' })
        const sw = await navigator.serviceWorker.ready

        const token = await getToken(messaging, { vapidKey, serviceWorkerRegistration: sw })
        if (!token) return

        const res = await fetch(`${API_URL}/notifications/fcm-token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ participantId, token }),
        })

        if (res.ok) localStorage.setItem(STORAGE_KEY, participantId)
      } catch (err) {
        console.error('[FCM] error:', err)
      }
    })
  }, [participantId])

  // Handle foreground messages (app open)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const messaging = getFirebaseMessaging()
    if (!messaging) return

    const unsub = onMessage(messaging, (payload) => {
      const title = payload.notification?.title || 'Prode Mundial 2026'
      const body = payload.notification?.body || ''
      const icon = payload.notification?.icon
      const image = (payload.notification as any)?.image
      if (Notification.permission === 'granted') {
        new Notification(title, {
          body,
          ...(icon ? { icon } : {}),
          ...(image ? { image } : {}),
        })
      }
    })

    return unsub
  }, [])
}
