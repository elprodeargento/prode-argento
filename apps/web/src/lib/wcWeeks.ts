export interface WorldCupWeek {
  index: number
  label: string
  start: Date
  end: Date
}

export function getWorldCupWeeks(): WorldCupWeek[] {
  const wcStart = new Date('2026-06-11')
  const wcEnd   = new Date('2026-07-19')
  const weeks: WorldCupWeek[] = []
  let current = new Date(wcStart)
  let idx = 0
  while (current <= wcEnd) {
    const weekStart = new Date(current)
    const dow = current.getDay()
    const toSunday = dow === 0 ? 0 : 7 - dow
    const weekEnd = new Date(current)
    weekEnd.setDate(weekEnd.getDate() + toSunday)
    if (weekEnd > wcEnd) weekEnd.setTime(wcEnd.getTime())
    weeks.push({ index: idx, label: `Semana ${idx + 1}`, start: weekStart, end: weekEnd })
    current = new Date(weekEnd)
    current.setDate(current.getDate() + 1)
    idx++
  }
  return weeks
}

export function formatWCWeekLabel(week: WorldCupWeek): string {
  const months = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']
  const s = week.start, e = week.end
  if (s.getMonth() === e.getMonth())
    return `${s.getDate()} - ${e.getDate()} ${months[s.getMonth()]}`
  return `${s.getDate()} ${months[s.getMonth()]} – ${e.getDate()} ${months[e.getMonth()]}`
}

export function getCurrentWCWeekIdx(weeks: WorldCupWeek[]): number {
  const today = new Date()
  const t = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  return weeks.findIndex(w => {
    const s = new Date(w.start.getFullYear(), w.start.getMonth(), w.start.getDate())
    const e = new Date(w.end.getFullYear(), w.end.getMonth(), w.end.getDate())
    return t >= s && t <= e
  })
}

export const WC_WEEKS = getWorldCupWeeks()
