import { Injectable, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@prode/db'

@Injectable()
export class SupabaseService implements OnModuleInit {
  private _client!: SupabaseClient<Database>

  constructor(private config: ConfigService) {}

  onModuleInit() {
    this._client = createClient<Database>(
      this.config.get<string>('app.supabaseUrl')!,
      this.config.get<string>('app.supabaseServiceKey')!, // service role — backend only
      { auth: { persistSession: false, autoRefreshToken: false } },
    )
  }

  get client(): SupabaseClient<Database> {
    return this._client
  }
}
