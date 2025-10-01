import {
  BadRequestException,
  ConflictException,
  HttpException,
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import {
  TypeVerifycationCode,
  TypeVerifycationCodeType,
  UserStatus,
} from 'src/shared/constants/auth.constant';
import {
  generateOTP,
  isNotFoundPrismaError,
  isUniqueConstraintPrismaError,
} from 'src/shared/helper';
import { AuthRepository } from './auth.repo';
import {
  CreateUserViolationBodyType,
  CreateUserViolationResType,
  ForgotPasswordType,
  GetUsersResType,
  LockUserBodyType,
  LoginBodyType,
  RefreshTokenBodyType,
  RegisterBodyType,
  ResetPasswordType,
  SendOTPBodyType,
  UpdateAvatarResType,
  UpdateUserProfileType,
  UserLockResType,
} from './auth.model';
import { SharedUserRepository } from 'src/shared/repositories/shared-user.repo';
import { envConfig } from 'src/shared/config';
import ms from 'ms';
import { addMilliseconds } from 'date-fns';
import { EmailService } from 'src/shared/services/email.service';
import { HashingService } from 'src/shared/services/hashing.service';
import {
  EmailNotExistsException,
  InternalCreateViolationErrorException,
  InternalLockUserErrorException,
  InternalRetrieveUserErrorException,
  InternalUnlockUserErrorException,
  InvalidOTPException,
  InvalidOTPExpiredExcepton,
  LockDurationRequiredForViolationException,
  LockPayloadRequiredException,
  LockUntilMustBeFutureException,
  UserBlockedException,
  UserNotFoundException,
} from './auth.error';
import { RolesService } from './role.service';
import { AccessTokenDto } from 'src/shared/dto/jwt.dto';
import { TokenService } from 'src/shared/services/token.service';
import { AuthMessages } from 'src/shared/constants/message.constant';
import { ERROR_MESSAGE } from 'src/shared/constants/error-message.constant';
import { MESSAGES } from 'src/shared/constants/success-message.constant';
import { ActionTaken } from 'src/shared/constants/user.constant';
import { RoleName } from 'src/shared/constants/role.constant';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly sharedUserRepository: SharedUserRepository,
    private readonly emailService: EmailService,
    private readonly hashingService: HashingService,
    private readonly rolesService: RolesService,
    private readonly tokenService: TokenService,
    private readonly shareUserRepository: SharedUserRepository,
  ) {}

  /**
   * Validates an OTP code for a given email and verification type.
   * @throws InvalidOTPException if code is not found.
   * @throws InvalidOTPExpiredExcepton if code is expired.
   */
  async validateVerificationCode({
    email,
    code,
    type,
  }: {
    email: string;
    code: string;
    type: TypeVerifycationCodeType;
  }) {
    const verifycationCode =
      await this.authRepository.findVerificationCodeByEmailAndType({
        email,
        code,
        type,
      });

    if (!verifycationCode) {
      throw InvalidOTPException;
    }

    if (verifycationCode.expiresAt < new Date()) {
      throw InvalidOTPExpiredExcepton;
    }
    return verifycationCode;
  }

  async register(createAuthDto: RegisterBodyType) {
    try {
      // Verify the OTP code
      await this.validateVerificationCode({
        email: createAuthDto.email,
        code: createAuthDto.code,
        type: TypeVerifycationCode.REGISTER,
      });

      const clientRoleId = await this.rolesService.getClientRoleId();
      const { email, password, fullname, phoneNumber } = createAuthDto;
      const hashedPassword = await this.hashingService.hashPassword(password);
      // This part was missing previously
      return await this.authRepository.createUser({
        email,
        password: hashedPassword,
        fullname,
        phoneNumber,
        roleId: clientRoleId,
      });
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw new UnprocessableEntityException({
          message: `User with email ${createAuthDto.email} already exists.`,
          path: 'email',
        });
      }
      throw error;
    }
  }

  /**
   * Sends an OTP to email based on request type (register, forgot password, etc).
   * @throws UnprocessableEntityException if user already exists or not found.
   */
  async sendOTP(body: SendOTPBodyType) {
    try {
      const user = await this.sharedUserRepository.findUnique({
        email: body.email,
      });
      if (body.type === TypeVerifycationCode.REGISTER) {
        if (user) {
          throw new UnprocessableEntityException({
            message: `User with email ${body.email} already exists.`,
            path: 'email',
          });
        }
      }

      if (
        body.type === TypeVerifycationCode.FORGOT_PASSWORD ||
        body.type === TypeVerifycationCode.RESET_PASSWORD
      ) {
        if (!user) {
          throw new UnprocessableEntityException({
            message: `User with email ${body.email} not registered yet.`,
            path: 'email',
          });
        }
      }

      const code = generateOTP();
      const expiresAt = addMilliseconds(new Date(), ms(envConfig.otpExpiresIn));

      const verificationCode = await this.authRepository.createVerificationCode(
        {
          email: body.email,
          code,
          type: body.type,
          expiresAt,
        },
      );

      const { error } = await this.emailService.sendOtpEmail({
        email: body.email,
        code,
      });

      if (error) {
        throw new UnprocessableEntityException({
          message: `Failed to send OTP to ${body.email}. Please try again later.`,
          path: 'code',
        });
      }

      return { message: 'OTP sent successfully' };
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw new ConflictException(
          `User with email ${body.email} not exists in systems.`,
        );
      }
      throw error;
    }
  }

  async login(body: LoginBodyType & { userAgent: string; ip: string }) {
    try {
      const user = await this.authRepository.findUniqueUserIncludeRole({
        email: body.email,
      });

      if (!user) {
        throw new UnprocessableEntityException([
          {
            message: 'Email is not exist',
            path: 'email',
          },
        ]);
      }

      const accountInactive = await this.authRepository.findUser(body.email);
      if (!accountInactive) throw UserNotFoundException;
      if (
        user.status === UserStatus.INACTIVE ||
        user.status === UserStatus.BLOCKED
      )
        throw UserBlockedException;

      const isPasswordValid = await this.hashingService.comparePassword(
        body.password,
        user.password,
      );
      if (!isPasswordValid) {
        throw new UnprocessableEntityException([
          {
            message: 'Password is incorrect',
            field: 'password',
          },
        ]);
      }

      const permissions = user.role?.permissions?.map((p) => p.name) || [];

      const device = await this.authRepository.createDevice({
        userId: user.id,
        userAgent: body.userAgent,
        ip: body.ip,
      });

      const tokens = await this.generateAccessAndRefreshToken({
        userId: user.id,
        email: user.email,
        deviceId: device.id,
        roleId: user.role.id,
        roleName: user.role.name,
      });

      return tokens;
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw new ConflictException(
          `User with email ${body.email} already exists.`,
        );
      }
      throw error;
    }
  }

  async generateAccessAndRefreshToken({
    userId,
    deviceId,
    roleId,
    roleName,
    email,
  }: AccessTokenDto) {
    const [accessToken, refreshToken] = await Promise.all([
      this.tokenService.signAccessToken({
        userId,
        email,
        deviceId,
        roleId,
        roleName,
      }),
      this.tokenService.signRefreshToken({
        userId,
        email,
      }),
    ]);

    const decodeRefreshToken =
      await this.tokenService.verifyRefreshToken(refreshToken);

    await this.authRepository.createRefreshToken({
      userId,
      token: refreshToken,
      expiresAt: new Date(decodeRefreshToken.exp * 1000),
      deviceId,
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshToken({
    refreshToken,
    userAgent,
    ip,
  }: RefreshTokenBodyType & { userAgent: string; ip: string }) {
    try {
      // 1. Verify if the refresh token is valid
      const { userId, email } =
        await this.tokenService.verifyRefreshToken(refreshToken);

      // 2. Check if the token exists in the database
      const refreshTokenInDb =
        await this.authRepository.findUniqueRefreshTokenIncludeUserRole(
          refreshToken,
        );
      if (!refreshTokenInDb) {
        throw new UnauthorizedException(
          'Refresh token has been revoked or does not exist',
        );
      }

      // 3. Update device information
      const {
        deviceId,
        user: {
          roleId,
          role: { name: roleName, permissions: rolePermissions },
        },
      } = refreshTokenInDb;

      const permissions = rolePermissions.map((p) => p.name);

      const $updateDevice = this.authRepository.udpateDevice(deviceId, {
        userAgent,
        ip,
        lastActive: new Date(),
      });

      // 4. Delete the old refresh token
      const $deleteRefreshToken =
        this.authRepository.deleteRefreshToken(refreshToken);

      // 5. Generate new access and refresh tokens
      const newTokens = this.generateAccessAndRefreshToken({
        userId,
        email,
        deviceId,
        roleId,
        roleName,
      });

      const [, , tokens] = await Promise.all([
        $updateDevice,
        $deleteRefreshToken,
        newTokens,
      ]);
      return tokens;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException();
    }
  }

  async logout({
    refreshToken,
  }: RefreshTokenBodyType): Promise<{ message: string }> {
    try {
      // 1. Verify if the refresh token is valid
      await this.tokenService.verifyRefreshToken(refreshToken);

      // 2. Delete the old refresh token
      const $deleteRefreshToken =
        await this.authRepository.deleteRefreshToken(refreshToken);

      // 3. Update device status
      await this.authRepository.udpateDevice($deleteRefreshToken.deviceId, {
        isActive: false,
      });
      return { message: 'Logout successfuly' };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      if (isNotFoundPrismaError(error)) {
        throw new UnauthorizedException(
          'Refresh token has been revoked or does not exist',
        );
      }
      throw new UnauthorizedException();
    }
  }

  async forgotPassword(body: ForgotPasswordType) {
    return await this.handlePasswordReset({
      email: body.email,
      newPassword: body.newPassword,
      code: body.code,
      type: TypeVerifycationCode.FORGOT_PASSWORD,
    });
  }

  async resetPassword(body: ResetPasswordType) {
    return await this.handlePasswordReset({
      email: body.email,
      newPassword: body.newPassword,
      code: body.code,
      type: TypeVerifycationCode.RESET_PASSWORD,
    });
  }

  async handlePasswordReset({
    email,
    newPassword,
    code,
    type,
  }: {
    email: string;
    newPassword: string;
    code: string;
    type: TypeVerifycationCodeType;
  }) {
    const user = await this.shareUserRepository.findUnique({ email });
    if (!user) {
      throw EmailNotExistsException;
    }

    await this.validateVerificationCode({ email, code, type });

    const hashedPassword = await this.hashingService.hashPassword(newPassword);

    await Promise.all([
      this.authRepository.updateUser({ email }, { password: hashedPassword }),
      this.authRepository.deleteVerificationCode({ email, code, type }),
    ]);

    return { message: AuthMessages.PASSWORD_CHANGED_SUCCESSFULLY };
  }

  async getUserProfile(userId: string) {
    const user = await this.authRepository.findUserIncludeRoleById(userId);

    if (!user) {
      throw new BadRequestException(ERROR_MESSAGE.AUTH.USER_NOT_FOUND);
    }
    await this.authRepository.validateUserStatus(userId);

    return user;
  }

  async updateUserProfile(userId: string, body: UpdateUserProfileType) {
    const existingUser =
      await this.authRepository.findUserIncludeRoleById(userId);

    if (!existingUser) {
      throw new BadRequestException(ERROR_MESSAGE.AUTH.USER_NOT_FOUND);
    }
    // Validate user status before updating
    await this.authRepository.validateUserStatus(userId);

    return this.authRepository.updateUserProfile(userId, body);
  }

  async getAllUsers(): Promise<GetUsersResType> {
    try {
      const users = await this.authRepository.getAll();
      return {
        data: users,
        totalItems: users.length,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw InternalRetrieveUserErrorException;
    }
  }

  async lockUser({
    id,
    body,
    updatedById,
  }: {
    id: string;
    body: LockUserBodyType;
    updatedById: string;
  }): Promise<UserLockResType> {
    try {
      const user = await this.authRepository.findActiveById(id);
      if (!user) throw UserNotFoundException;

      // must have durationMinutes or until
      if (!body.durationMinutes && !body.until)
        throw LockPayloadRequiredException;

      let until: Date;
      if (typeof body.durationMinutes === 'number') {
        until = new Date(Date.now() + body.durationMinutes * 60_000);
      } else {
        until = body.until!;
      }

      if (!until || until.getTime() <= Date.now()) {
        throw LockUntilMustBeFutureException;
      }

      const updated = await this.authRepository.lockUser({
        id,
        until,
        updatedById,
      });
      return updated;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw InternalLockUserErrorException;
    }
  }

  async unlockUser({
    id,
    updatedById,
  }: {
    id: string;
    updatedById: string;
  }): Promise<UserLockResType> {
    try {
      const user = await this.authRepository.findActiveById(id);
      if (!user) throw UserNotFoundException;

      const updated = await this.authRepository.unlockUser({ id, updatedById });
      return updated;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw InternalUnlockUserErrorException;
    }
  }

  async markViolationForUser({
    id,
    body,
    adminId,
  }: {
    id: string;
    body: CreateUserViolationBodyType;
    adminId: string;
  }): Promise<CreateUserViolationResType> {
    try {
      const user = await this.authRepository.findActiveById(id);
      if (!user) throw UserNotFoundException;

      if (body.actionTaken === ActionTaken.LOCK && !body.lockDurationDays) {
        throw LockDurationRequiredForViolationException;
      }

      const violation = await this.authRepository.createViolation({
        userId: id,
        reason: body.reason,
        violationType: body.violationType,
        actionTaken: body.actionTaken,
        lockDurationDays: body.lockDurationDays,
        createdById: adminId,
      });

      let lockExpirationDate: Date | null = user.lockExpirationDate ?? null;
      if (body.actionTaken === ActionTaken.LOCK && body.lockDurationDays) {
        const lockedUser = await this.authRepository.lockUserDays({
          id,
          days: body.lockDurationDays,
          updatedById: adminId,
        });
        lockExpirationDate = lockedUser.lockExpirationDate;
      }

      await this.authRepository.setLastViolation({
        userId: id,
        violationId: violation.id,
        updatedById: adminId,
      });

      return {
        ...violation,
        lockExpirationDate,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw InternalCreateViolationErrorException;
    }
  }

  async updateUserAvatar(
    userId: string,
    avatarUrl: string,
  ): Promise<UpdateAvatarResType> {
    const user = await this.authRepository.findUserById(userId);
    if (!user) {
      throw UserNotFoundException;
    }

    await this.authRepository.validateUserStatus(userId);

    const updated = await this.authRepository.updateAvatarUser(userId, {
      avatar: avatarUrl,
    });
    return {
      message: MESSAGES.USER.AVATAR_UPDATED,
      avatar: updated.avatar,
    };
  }
}
