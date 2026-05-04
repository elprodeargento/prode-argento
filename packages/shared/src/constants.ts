export const POINTS = { EXACT: 3, WINNER: 1, MISS: 0 } as const
export const LOCK_MINUTES_BEFORE_KICKOFF = 5
export const PLANS = {
  free:    { maxParticipants: 5,   hasData: false, hasPromos: false, hasWhatsApp: false },
  premium: { maxParticipants: null, hasData: true,  hasPromos: false, hasWhatsApp: true  },
  pro:     { maxParticipants: null, hasData: true,  hasPromos: true,  hasWhatsApp: true  },
} as const
export const WORLD_CUP_2026_GROUPS = ['A','B','C','D','E','F','G','H'] as const
