import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common'
import { Observable } from 'rxjs'
import { tap, catchError } from 'rxjs/operators'
import { throwError } from 'rxjs'

const SKIP_URLS = new Set(['/api/', '/api/health'])

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP')

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest()
    const { method, url } = req

    if (SKIP_URLS.has(url)) return next.handle()

    const start = Date.now()

    return next.handle().pipe(
      tap(() => {
        const res = context.switchToHttp().getResponse()
        const ms = Date.now() - start
        const status = res.statusCode
        const color = status >= 500 ? '❌' : status >= 400 ? '⚠️' : '✅'
        this.logger.log(`${color} ${method} ${url} → ${status} (${ms}ms)`)
      }),
      catchError((err) => {
        const ms = Date.now() - start
        const status = err.status ?? 500
        this.logger.error(`❌ ${method} ${url} → ${status} (${ms}ms) — ${err.message}`)
        return throwError(() => err)
      }),
    )
  }
}
