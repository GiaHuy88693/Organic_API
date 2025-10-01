import { createZodDto } from 'nestjs-zod';
import {
  CreateUserViolationBodySchema,
  CreateUserViolationResSchema,
  DeviceSchema,
  ForgotPasswordSchema,
  GetUsersResSchema,
  LockUserBodySchema,
  LoginBodySchema,
  LoginResSchema,
  LogoutBodySchema,
  ProfileResSchema,
  RefreshTokenBodySchema,
  RefreshTokenResSchema,
  RegisterBodySchema,
  RegisterResSchema,
  SendOTPBodySchema,
  UpdateAvatarResSchema,
  UpdateUserProfileSchema,
  UserIdParamSchema,
  UserLockResSchema,
} from '../auth.model';
import { MessageResSchema } from 'src/shared/models/response.model';

export class RegisterBodyDTO extends createZodDto(RegisterBodySchema) {}

export class RegisterResDTO extends createZodDto(RegisterResSchema) {}

export class SendOTPBodyDTO extends createZodDto(SendOTPBodySchema) {}

export class MessageResDTO extends createZodDto(MessageResSchema) {}

export class LoginResDTO extends createZodDto(LoginResSchema) {}

export class LoginBodyDTO extends createZodDto(LoginBodySchema) {}

export class DeviceType extends createZodDto(DeviceSchema) {}

export class RefreshTokenResDTO extends createZodDto(RefreshTokenResSchema) {}

export class RefreshTokenBodyDTO extends createZodDto(RefreshTokenBodySchema) {}

export class LogoutBodyDTO extends createZodDto(LogoutBodySchema) {}

export class ForgotPasswordResDTO extends createZodDto(ForgotPasswordSchema) {}

export class ResetPasswordResDTO extends createZodDto(ForgotPasswordSchema) {}

export class ProfileResDTO extends createZodDto(ProfileResSchema) {}

export class UpdateUserProfileDTO extends createZodDto(
  UpdateUserProfileSchema,
) {}

export class GetAllUsersResponseDTO extends createZodDto(GetUsersResSchema) {}
export class LockUserBodyDTO extends createZodDto(LockUserBodySchema) {}
export class UserIdParamDTO extends createZodDto(UserIdParamSchema) {}
export class UserLockResDTO extends createZodDto(UserLockResSchema) {}
export class CreateUserViolationBodyDTO extends createZodDto(
  CreateUserViolationBodySchema,
) {}
export class CreateUserViolationResDTO extends createZodDto(
  CreateUserViolationResSchema,
) {}
export class UpdateAvatarResDTO extends createZodDto(UpdateAvatarResSchema) {}
