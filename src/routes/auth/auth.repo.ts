import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserType } from 'src/shared/models/shared-user.model';
import { PrismaService } from 'src/shared/services/prisma.service';
import {
  ProfileResType,
  RefreshTokenType,
  RoleType,
  VerificationCodeType,
} from './auth.model';
import {
  TypeVerifycationCodeType,
  UserStatus,
  UserStatusType,
  userWithRoleSelect,
} from 'src/shared/constants/auth.constant';
import { UserWithRoleAndPermissions } from 'src/shared/@types/auth.type';
import { DeviceType, UpdateUserProfileDTO } from './dto/auth.dto';
import { randomUUID } from 'crypto';
import { ERROR_MESSAGE } from 'src/shared/constants/error-message.constant';
import { ActionTaken, Prisma, ViolationType } from '@prisma/client';
import { UserNotFoundException } from './auth.error';

@Injectable()
export class AuthRepository {
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * Finds a verification code based on email, code, and type, or by ID/email only.
   * Used to validate OTP during registration or login.
   *
   * @param uniqueValue - Object containing email, or id, or full match for email+code+type
   * @returns Promise resolving to the verification code or null if not found
   */
  findVerificationCodeByEmailAndType(
    uniqueValue:
      | { email: string }
      | { id: string }
      | { email: string; code: string; type: TypeVerifycationCodeType },
  ): Promise<VerificationCodeType | null> {
    return this.prismaService.verificationCode.findFirst({
      where: uniqueValue,
    });
  }
  /**
   * Creates a new user with the given details.
   * Used during the registration process.
   *
   * @param user - User data including email, full name, password, phone number, and role ID
   * @returns Promise resolving to the created user without sensitive fields (password, totpSecret)
   */
  async createUser(
    user: Pick<
      UserType,
      'email' | 'fullname' | 'password' | 'phoneNumber' | 'roleId'
    >,
  ): Promise<Omit<UserType, 'password' | 'totpSecret'>> {
    return await this.prismaService.user.create({
      data: {
        email: user.email,
        fullname: user.fullname,
        password: user.password,
        phoneNumber: user.phoneNumber,
        roleId: user.roleId,
        isEmailVerified: true,
        status: UserStatus.ACTIVE,
        deletedAt: null,
      },
      omit: { password: true, totpSecret: true },
    });
  }

  /**
   * Creates or updates a verification code associated with an email.
   * If a code already exists for the email, it updates the code and expiration.
   *
   * @param payload - Data containing email, code, type, and expiration time
   * @returns Promise resolving to the created or updated verification code
   */
  async createVerificationCode(
    payload: Pick<
      VerificationCodeType,
      'email' | 'code' | 'type' | 'expiresAt'
    >,
  ): Promise<VerificationCodeType> {
    return await this.prismaService.verificationCode.upsert({
      where: {
        email: payload.email,
      },
      create: payload,
      update: {
        code: payload.code,
        expiresAt: payload.expiresAt,
        type: payload.type,
      },
    });
  }

  async findUniqueUserIncludeRole(
    uniqueObject: { email: string } | { id: string },
  ): Promise<UserWithRoleAndPermissions | null> {
    return this.prismaService.user.findUnique({
      where: uniqueObject,
      include: {
        role: true,
      },
    });
  }

  findUser(email: string) {
    return this.prismaService.user.findUnique({
      where: { email },
      select: { id: true, email: true, fullname: true, status: true },
    });
  }

  createDevice(
    data: Pick<DeviceType, 'userId' | 'userAgent' | 'ip'> &
      Partial<Pick<DeviceType, 'lastActive' | 'isActive'>>,
  ) {
    return this.prismaService.device.create({
      data: {
        deviceId: randomUUID(),
        ...data,
      },
    });
  }

  async createRefreshToken(data: {
    userId: string;
    token: string;
    expiresAt: Date;
    deviceId: string;
  }) {
    await this.prismaService.refreshToken.create({
      data,
    });
  }

  async findUniqueRefreshTokenIncludeUserRole(token: string): Promise<
    | (RefreshTokenType & {
        user: UserType & {
          role: RoleType;
        };
      })
    | null
  > {
    if (!token || typeof token !== 'string' || token.trim().length === 0) {
      throw new Error('Token parameter must be a non-empty string');
    }

    return await this.prismaService.refreshToken.findUnique({
      where: {
        token: token.trim(),
      },
      include: {
        user: {
          include: {
            role: true,
          },
        },
      },
    });
  }

  async deleteRefreshToken(token: string): Promise<RefreshTokenType> {
    // Validate input parameter
    if (!token || typeof token !== 'string' || token.trim().length === 0) {
      throw new Error('Token parameter must be a non-empty string');
    }

    // Delete the token
    const deletedToken = await this.prismaService.refreshToken.delete({
      where: {
        token: token.trim(),
      },
    });

    return deletedToken;
  }

  async udpateDevice(deviceId: string, data: Partial<DeviceType>) {
    const { userId, id, ...updateData } = data;
    return await this.prismaService.device.update({
      where: {
        id: deviceId,
      },
      data: updateData,
    });
  }

  async updateUser(
    payload: { email: string } | { id: string },
    data: Partial<Omit<UserType, 'id'>>,
  ): Promise<UserType> {
    return await this.prismaService.user.update({
      where: payload,
      data,
    });
  }

  async deleteVerificationCode(
    uniqueVal:
      | { id: string }
      | { email: string; code: string; type: TypeVerifycationCodeType },
  ): Promise<VerificationCodeType> {
    return await this.prismaService.verificationCode.delete({
      where: uniqueVal,
    });
  }

  async findUserIncludeRoleById(userId: string): Promise<ProfileResType> {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: userWithRoleSelect,
    });

    if (!user) {
      throw new BadRequestException(ERROR_MESSAGE.AUTH.USER_NOT_FOUND);
    }

    return user;
  }

  async validateUserStatus(userId: string): Promise<void> {
    const user = await this.fetchUser(userId, { status: true });

    // Check user status
    const invalidStatuses = {
      [UserStatus.INACTIVE]: ERROR_MESSAGE.USER.ACCOUNT_INACTIVE,
      [UserStatus.BLOCKED]: ERROR_MESSAGE.USER.ACCOUNT_BLOCKED,
      [UserStatus.SUSPENDED]: ERROR_MESSAGE.USER.ACCOUNT_SUSPENDED,
    };

    if (invalidStatuses[user.status]) {
      throw new UnauthorizedException(invalidStatuses[user.status]);
    }
  }

  private async fetchUser<T extends Prisma.UserSelect>(
    userId: string,
    select: T,
  ): Promise<ProfileResType | { status: UserStatusType }> {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      select,
    });

    if (!user) {
      throw new BadRequestException(ERROR_MESSAGE.AUTH.USER_NOT_FOUND);
    }

    return user as ProfileResType | { status: UserStatusType };
  }

  async updateUserProfile(
    userId: string,
    data: UpdateUserProfileDTO,
  ): Promise<ProfileResType> {
    return this.prismaService.user.update({
      where: { id: userId },
      data,
      select: userWithRoleSelect,
    });
  }

  async getAll(): Promise<UserType[]> {
    return await this.prismaService.user.findMany({
      where: {
        deletedAt: null,
      },
    });
  }

  async findActiveById(id: string) {
    return await this.prismaService.user.findFirst({
      where: { id, deletedAt: null },
      select: { id: true, email: true, lockExpirationDate: true },
    });
  }
  async lockUser({
    id,
    until,
    updatedById,
  }: {
    id: string;
    until: Date;
    updatedById: string;
  }) {
    return await this.prismaService.user.update({
      where: { id },
      data: {
        lockExpirationDate: until,
        updatedById,
        status: UserStatus.BLOCKED,
      },
      select: { id: true, email: true, lockExpirationDate: true },
    });
  }

  async findUserById(userId: string) {
    return this.prismaService.user.findUnique({ where: { id: userId } });
  }

  updateAvatarUser(userId: string, data: { avatar: string }) {
    return this.prismaService.user
      .update({
        where: { id: userId },
        data,
        select: { id: true, avatar: true },
      })
      .catch((error) => {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          throw UserNotFoundException;
        }
        throw error;
      });
  }

  async unlockUser({ id, updatedById }: { id: string; updatedById: string }) {
    return await this.prismaService.user.update({
      where: { id },
      data: {
        lockExpirationDate: null,
        updatedById,
        status: UserStatus.ACTIVE,
      },
      select: { id: true, email: true, lockExpirationDate: true },
    });
  }

  async createViolation({
    userId,
    reason,
    violationType,
    actionTaken,
    lockDurationDays,
    createdById,
  }: {
    userId: string;
    reason: string;
    violationType: ViolationType;
    actionTaken: ActionTaken;
    lockDurationDays?: number;
    createdById: string;
  }) {
    return await this.prismaService.userViolation.create({
      data: {
        userId,
        reason,
        violationType,
        actionTaken,
        lockDurationDays: lockDurationDays ?? null,
        createdById,
      },
      select: {
        id: true,
        reason: true,
        violationType: true,
        actionTaken: true,
        lockDurationDays: true,
        createdAt: true,
        createdBy: {
          select: {
            id: true,
            email: true,
            fullname: true,
            role: { select: { id: true, name: true } },
          },
        },
      },
    });
  }

  async lockUserDays({
    id,
    days,
    updatedById,
  }: {
    id: string;
    days: number;
    updatedById: string;
  }) {
    const until = new Date(Date.now() + days * 86_400_000);
    return this.lockUser({ id, until, updatedById });
  }

  async setLastViolation({
    userId,
    violationId,
    updatedById,
  }: {
    userId: string;
    violationId: string;
    updatedById: string;
  }) {
    return this.prismaService.user.update({
      where: { id: userId },
      data: { lastViolationId: violationId, updatedById },
      select: { id: true, email: true, lastViolationId: true },
    });
  }
}
