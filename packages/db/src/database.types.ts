export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      businesses: {
        Row: {
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
          plan: 'free' | 'premium' | 'pro'
          active: boolean
          ig_user_id: string | null
          ig_access_token: string | null
          ig_hashtags: string[]
          mp_payment_id: string | null
          paid_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['businesses']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['businesses']['Insert']>
      }
      participants: {
        Row: {
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
        Insert: Omit<Database['public']['Tables']['participants']['Row'], 'id' | 'registered_at'> & {
          id?: string
          registered_at?: string
        }
        Update: Partial<Database['public']['Tables']['participants']['Insert']>
      }
      matches: {
        Row: {
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
          fd_match_id: number | null
          scored_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['matches']['Row'], never>
        Update: Partial<Database['public']['Tables']['matches']['Row']>
      }
      predictions: {
        Row: {
          id: string
          participant_id: string
          business_id: string
          match_id: number
          home_pred: number
          away_pred: number
          points_earned: number
          submitted_at: string
        }
        Insert: Omit<Database['public']['Tables']['predictions']['Row'], 'id'> & { id?: string }
        Update: Partial<Database['public']['Tables']['predictions']['Insert']>
      }
      prizes: {
        Row: {
          id: string
          business_id: string
          rank: number
          description: string
          image_url: string | null
        }
        Insert: Omit<Database['public']['Tables']['prizes']['Row'], 'id'> & { id?: string }
        Update: Partial<Database['public']['Tables']['prizes']['Insert']>
      }
      promos: {
        Row: {
          id: string
          business_id: string
          category: string
          description: string
          image_url: string | null
          lat: number
          lon: number
          radius_km: number
          valid_from: string
          valid_until: string
          active: boolean
          views: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['promos']['Row'], 'id' | 'views' | 'created_at'> & {
          id?: string
          views?: number
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['promos']['Insert']>
      }
      leaderboard_cache: {
        Row: {
          business_id: string
          participant_id: string
          total_points: number
          exact_results: number
          correct_winners: number
          rank: number
          updated_at: string
        }
        Insert: Database['public']['Tables']['leaderboard_cache']['Row']
        Update: Partial<Database['public']['Tables']['leaderboard_cache']['Row']>
      }
    }
    Views: Record<string, never>
    Functions: {
      get_empresa_stats: {
        Args: { business_id: string }
        Returns: {
          total_participants: number
          predictions_loaded: number
          coverage_pct: number
        }
      }
      recalculate_leaderboard: {
        Args: { p_business_id: string }
        Returns: undefined
      }
    }
    Enums: {
      plan_type: 'free' | 'premium' | 'pro'
      match_status: 'scheduled' | 'live' | 'finished'
      match_stage: 'group' | 'r32' | 'r16' | 'qf' | 'sf' | 'final'
    }
  }
}
