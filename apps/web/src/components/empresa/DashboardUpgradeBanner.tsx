export function DashboardUpgradeBanner({ plan, total }: { plan: string; total: number }) {
  if (plan !== 'free') return null

  const remaining = Math.max(0, 5 - total)

  if (remaining > 0) {
    return (
      <div className="rounded-2xl bg-[#FFF4E5] border border-[#FF8A00]/20 px-5 py-4 flex items-center gap-4">
        <span className="text-[28px]">⚡</span>
        <div className="flex-1">
          <div className="text-[14px] font-black text-[#0D1A3A]">
            Plan Free — te quedan {remaining} lugares
          </div>
          <div className="text-[13px] text-[#5A6480] font-medium mt-0.5">
            Pasate a Pro: participantes ilimitados, notificaciones push y más por $40.000 + IVA, pago único.
          </div>
        </div>
        <a
          href="/empresa/planes"
          className="shrink-0 px-4 py-2 bg-[#FF8A00] text-white text-[13px] font-black rounded-xl hover:opacity-90 transition-all"
        >
          Ver planes
        </a>
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-[#FDECEB] border border-[#D93025]/20 px-5 py-4 flex items-center gap-4">
      <span className="text-[28px]">🔒</span>
      <div className="flex-1">
        <div className="text-[14px] font-black text-[#D93025]">
          Alcanzaste el límite del plan Free
        </div>
        <div className="text-[13px] text-[#5A6480] font-medium mt-0.5">
          No podés sumar más clientes. Pasate a Pro para desbloquear participantes ilimitados y notificaciones push.
        </div>
      </div>
      <a
        href="/empresa/planes"
        className="shrink-0 px-4 py-2 bg-[#D93025] text-white text-[13px] font-black rounded-xl hover:opacity-90 transition-all"
      >
        Subir de plan
      </a>
    </div>
  )
}
