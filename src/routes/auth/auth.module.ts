import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthRepository } from './auth.repo';
import { SharedUserRepository } from 'src/shared/repositories/shared-user.repo';
import { EmailService } from 'src/shared/services/email.service';
import { HashingService } from 'src/shared/services/hashing.service';
import { RolesService } from './role.service';
import { TokenService } from 'src/shared/services/token.service';
import { SharedModule } from 'src/shared/shared.module';
import { CloudinaryService } from 'src/shared/services/cloudinary.service';
@Module({
  imports: [SharedModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthRepository,
    SharedUserRepository,
    EmailService,
    HashingService,
    RolesService,
    TokenService,
    CloudinaryService
  ],
})
export class AuthModule {}
