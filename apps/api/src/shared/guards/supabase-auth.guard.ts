import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createClient } from '@supabase/supabase-js'

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(private config: ConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const token = this.extractToken(request)

    if (!token) throw new UnauthorizedException('No token provided')

    const supabase = createClient(
      this.config.get<string>('app.supabaseUrl')!,
      this.config.get<string>('app.supabaseServiceKey')!,
    )

    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) throw new UnauthorizedException('Invalid token')

    request.user = user
    return true
  }

  private extractToken(request: any): string | null {
    const auth = request.headers?.authorization as string | undefined
    if (!auth?.startsWith('Bearer ')) return null
    return auth.slice(7)
  }
}
