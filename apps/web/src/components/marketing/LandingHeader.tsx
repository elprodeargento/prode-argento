'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export function LandingHeader() {
  const [hasSession, setHasSession] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      setHasSession(!!session)
    })
  }, [])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-[52px] bg-[#002B72]/95 backdrop-blur-sm flex items-center justify-between px-5">
      <span className="font-bebas text-white text-[18px] tracking-wide">elprode.ar</span>
      <Link
        href={hasSession ? '/empresa/dashboard' : '/empresa/login'}
        className="border border-white/40 text-white text-[13px] font-bold px-4 py-1.5 rounded-full hover:bg-white/10 transition-all"
      >
        {hasSession ? 'Mi panel' : 'Ingresar'}
      </Link>
    </header>
  )
}
