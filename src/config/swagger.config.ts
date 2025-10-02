import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('Organic API')
  .setDescription('Backend for Organic project')
  .setVersion('1.0')
  .addBearerAuth(
    { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    'authorization',
  )
  .addApiKey(
    {
      type: 'apiKey',
      in: 'header',
      name: 'X-Api-Key',
      description: 'Enter your API key to access this endpoint',
    },
    'X-Api-Key',
  )
  .build();
