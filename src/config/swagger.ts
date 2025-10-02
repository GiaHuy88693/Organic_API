import { INestApplication } from '@nestjs/common'
import { SwaggerModule } from '@nestjs/swagger'
import expressBasicAuth from 'express-basic-auth'
import { ConfigGroups } from 'src/shared/config'
import { swaggerConfig } from './swagger.config'

export function setupSwagger(app: INestApplication) {
  const { username, password } = ConfigGroups.swagger
  app.use(
    ['/docs', '/docs-json'],
    expressBasicAuth({
      challenge: true,
      users: { [username]: password },
    }),
  )

  const document = SwaggerModule.createDocument(app, swaggerConfig)

  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  })
}
