import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface Prediction {
  matchId: number
  homeScore: number
  awayScore: number
  savedAt: string
}

interface ProdeState {
  participantId: string | null
  businessId: string | null
  predictions: Record<number, Prediction>
  setPrediction: (matchId: number, home: number, away: number) => void
  setParticipant: (id: string, businessId: string) => void
  clearPredictions: () => void
}

export const useProdeStore = create<ProdeState>()(
  persist(
    (set) => ({
      participantId: null,
      businessId: null,
      predictions: {},
      setPrediction: (matchId, homeScore, awayScore) =>
        set((s) => ({
          predictions: {
            ...s.predictions,
            [matchId]: { matchId, homeScore, awayScore, savedAt: new Date().toISOString() },
          },
        })),
      setParticipant: (participantId, businessId) => set({ participantId, businessId }),
      clearPredictions: () => set({ predictions: {} }),
    }),
    {
      name: 'prode-store',
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
