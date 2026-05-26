'use client'

import { useEffect } from 'react'

export function PlayerRefCookieSetter({ code }: { code: string }) {
  useEffect(() => {
    const maxAge = 30 * 24 * 60 * 60
    document.cookie = `player_referral_code=${code}; path=/; max-age=${maxAge}; SameSite=Lax`
  }, [code])

  return null
}
