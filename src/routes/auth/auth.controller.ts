import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Ip,
  Param,
  Patch,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ZodSerializerDto } from 'nestjs-zod';
import { Auth, IsPublic } from 'src/shared/decorator/auth.decorator';
import {
  CreateUserViolationBodyDTO,
  CreateUserViolationResDTO,
  ForgotPasswordResDTO,
  GetAllUsersResponseDTO,
  LockUserBodyDTO,
  LoginBodyDTO,
  LoginResDTO,
  LogoutBodyDTO,
  MessageResDTO,
  ProfileResDTO,
  RefreshTokenBodyDTO,
  RefreshTokenResDTO,
  RegisterBodyDTO,
  RegisterResDTO,
  ResetPasswordResDTO,
  SendOTPBodyDTO,
  UpdateUserProfileDTO,
  UserIdParamDTO,
  UserLockResDTO,
} from './dto/auth.dto';
import { AuthService } from './auth.service';
import { UserAgent } from 'src/shared/decorator/user-agent.decorator';
import { AuthTypes, ConditionGuard } from 'src/shared/constants/auth.constant';
import { ActiveUser } from 'src/shared/decorator/active-user.decorator';
import { ProfileResType, UpdateAvatarResType } from './auth.model';
import { NoFileProvidedException } from 'src/shared/constants/file-error.constant';
import { CloudinaryService } from 'src/shared/services/cloudinary.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}
  /**
   * Registers a new user with email/phone and password.
   * @param body - The user registration data.
   * @returns Registered user info and tokens.
   */
  @Post('register')
  @IsPublic()
  @ZodSerializerDto(RegisterResDTO)
  async register(@Body() body: RegisterBodyDTO) {
    return await this.authService.register(body);
  }

  @Post('otp')
  @IsPublic()
  @ZodSerializerDto(MessageResDTO)
  async sendOTP(@Body() body: SendOTPBodyDTO) {
    return await this.authService.sendOTP(body);
  }

  @Post('login')
  @IsPublic()
  @ZodSerializerDto(LoginResDTO)
  async login(
    @Body() body: LoginBodyDTO,
    @UserAgent() userAgent: string,
    @Ip() ip: string,
  ) {
    return await this.authService.login({
      ...body,
      userAgent,
      ip,
    });
  }

  @Post('refresh-token')
  @IsPublic()
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(RefreshTokenResDTO)
  async refreshToken(
    @Body() body: RefreshTokenBodyDTO,
    @UserAgent() userAgent: string,
    @Ip() ip: string,
  ) {
    return await this.authService.refreshToken({
      ...body,
      userAgent,
      ip,
    });
  }

  @Post('logout')
  @Auth([AuthTypes.BEARER])
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(MessageResDTO)
  async logout(@Body() body: LogoutBodyDTO) {
    return await this.authService.logout(body);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @IsPublic()
  @ZodSerializerDto(MessageResDTO)
  async forgotPassword(@Body() body: ForgotPasswordResDTO) {
    return await this.authService.forgotPassword(body);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @IsPublic()
  @ZodSerializerDto(MessageResDTO)
  async resetPassword(@Body() body: ResetPasswordResDTO) {
    return await this.authService.resetPassword(body);
  }

  @Auth([AuthTypes.BEARER])
  @Get('profile')
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(ProfileResDTO)
  async getProfile(
    @ActiveUser('userId') userId: string,
  ): Promise<ProfileResType> {
    return await this.authService.getUserProfile(userId);
  }

  @Auth([AuthTypes.BEARER])
  @Patch('profile')
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(ProfileResDTO)
  async updateProfile(
    @ActiveUser('userId') userId: string,
    @Body() body: UpdateUserProfileDTO,
  ): Promise<ProfileResType> {
    return await this.authService.updateUserProfile(userId, body);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(GetAllUsersResponseDTO)
  async getAllUsers() {
    return await this.authService.getAllUsers();
  }

  @Auth([AuthTypes.BEARER])
  @Put(':userId/lock')
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(UserLockResDTO)
  async lockUser(
    @Param() params: UserIdParamDTO,
    @Body() body: LockUserBodyDTO,
    @ActiveUser('userId') userId: string,
  ) {
    return this.authService.lockUser({
      id: params.userId,
      body,
      updatedById: userId,
    });
  }

  @Auth([AuthTypes.BEARER])
  @Put(':userId/unlock')
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(UserLockResDTO)
  async unlockUser(
    @Param() params: UserIdParamDTO,
    @ActiveUser('userId') userId: string,
  ) {
    return this.authService.unlockUser({
      id: params.userId,
      updatedById: userId,
    });
  }

  @Auth([AuthTypes.BEARER])
  @Post(':userId/violations')
  @HttpCode(HttpStatus.CREATED)
  @ZodSerializerDto(CreateUserViolationResDTO)
  async markViolationForUser(
    @Param() params: UserIdParamDTO,
    @Body() body: CreateUserViolationBodyDTO,
    @ActiveUser('userId') adminId: string,
  ) {
    return await this.authService.markViolationForUser({
      id: params.userId,
      body,
      adminId,
    });
  }

  @Auth([AuthTypes.BEARER, AuthTypes.APIKey], { condition: ConditionGuard.OR })
  @Post('avatar')
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.OK)
  async uploadAvatar(
    @ActiveUser('userId') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UpdateAvatarResType> {
    if (!file) {
      throw NoFileProvidedException;
    }

    const avatarUrl = await this.cloudinaryService.uploadImage(file);
    return this.authService.updateUserAvatar(userId, avatarUrl);
  }
}
