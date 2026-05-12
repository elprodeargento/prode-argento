'use client'
import { useEffect } from 'react'

export function trackEvent(name: string, params?: Record<string, any>) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', name, params)
  }
}

export function PageTracker({ event, params }: { event: string; params?: Record<string, any> }) {
  useEffect(() => { trackEvent(event, params) }, [])
  return null
}
