import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { envConfig } from './shared/config';
import { PrismaClient } from '@prisma/client';
import { setupSwagger } from './config/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('/api/v1', {
    exclude: ['/docs', '/docs-json'],
  });

  app.enableCors();
  setupSwagger(app);
  await app.listen(envConfig.port ?? 3000);

  const prisma = new PrismaClient();
  await prisma.$connect();
  console.log(`Server running ...`);
}
bootstrap();
