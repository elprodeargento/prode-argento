import { NestFactory } from '@nestjs/core'
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify'
import { ValidationPipe, VersioningType } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { ConfigService } from '@nestjs/config'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: { level: 'info' } }),
  )

  const config = app.get(ConfigService)

  // Security
  app.enableCors({
    origin: [config.get('WEB_URL', 'http://localhost:3000')],
    credentials: true,
  })

  // Global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  )

  // API versioning
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' })

  // Global prefix
  app.setGlobalPrefix('api')

  // Swagger (only in non-production)
  if (config.get('NODE_ENV') !== 'production') {
    const swaggerCfg = new DocumentBuilder()
      .setTitle('Prode Mundial 2026 API')
      .setDescription('Backend API para el sistema de prodes del Mundial')
      .setVersion('1.0')
      .addBearerAuth()
      .build()
    const doc = SwaggerModule.createDocument(app, swaggerCfg)
    SwaggerModule.setup('api/docs', app, doc, {
      swaggerOptions: { persistAuthorization: true },
    })
  }

  const port = config.get<number>('PORT', 4000)
  await app.listen(port, '0.0.0.0')
  console.log(`🚀 API running on http://localhost:${port}/api`)
  console.log(`📚 Swagger: http://localhost:${port}/api/docs`)
}

bootstrap()
