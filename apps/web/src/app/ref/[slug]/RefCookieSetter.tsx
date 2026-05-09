'use client'

import { useEffect } from 'react'

export function RefCookieSetter({ slug }: { slug: string }) {
  useEffect(() => {
    const maxAge = 7 * 24 * 60 * 60
    document.cookie = `referrer_slug=${slug}; path=/; max-age=${maxAge}; SameSite=Lax`
  }, [slug])

  return null
}
