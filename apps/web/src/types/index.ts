export type Plan = 'free' | 'premium' | 'pro'

export interface Business {
  id: string
  slug: string
  name: string
  admin_user_id: string
  admin_email: string
  logo_url: string | null
  primary_color: string
  banner_urls: string[]
  welcome_msg: string
  registration_deadline: string | null
  plan: Plan
  active: boolean
  ig_user_id: string | null
  ig_access_token: string | null
  ig_hashtags: string[]
  mp_payment_id: string | null
  paid_at: string | null
  created_at: string
}

export interface Participant {
  id: string
  business_id: string
  google_uid: string | null
  name: string
  email: string
  phone: string
  remember_me: boolean
  accepted_terms: boolean
  total_points: number
  rank: number | null
  registered_at: string
}

export interface Match {
  id: number
  stage: 'group' | 'r32' | 'r16' | 'qf' | 'sf' | 'final'
  group: string | null
  home_team: string
  away_team: string
  home_flag: string
  away_flag: string
  kickoff_at: string
  home_score: number | null
  away_score: number | null
  status: 'scheduled' | 'live' | 'finished'
}

export interface Prediction {
  id: string
  participant_id: string
  business_id: string
  match_id: number
  home_pred: number
  away_pred: number
  points_earned: number
  submitted_at: string
}

export interface Prize {
  id: string
  business_id: string
  rank: number
  description: string
  image_url: string | null
}

export interface Promo {
  id: string
  business_id: string
  business_name: string
  description: string
  image_url: string | null
  category: string
  lat: number
  lon: number
  radius_km: number
  valid_from: string
  valid_until: string
  views: number
}

export interface LeaderboardEntry {
  business_id: string
  participant_id: string
  participant_name: string
  total_points: number
  exact_results: number
  correct_winners: number
  rank: number
}
