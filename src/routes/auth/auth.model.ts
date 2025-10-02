import { TypeVerifycationCode } from 'src/shared/constants/auth.constant';
import { ERROR_MESSAGE } from 'src/shared/constants/error-message.constant';
import { ActionTaken, ViolationType } from 'src/shared/constants/user.constant';
import { coerceUntil } from 'src/shared/helper';
import { UserSchema } from 'src/shared/models/shared-user.model';
import z from 'zod';

export const RegisterBodySchema = UserSchema.pick({
  email: true,
  fullname: true,
  password: true,
  phoneNumber: true,
})
  .extend({
    confirmPassword: z
      .string()
      .min(6, 'Confirm password must be at least 6 characters long')
      .max(100, 'Confirm password must be at most 100 characters long'),
    code: z.string().length(6, 'OTP code must be exactly 6 digits'),
  })
  .strict()
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: 'custom',
        message: 'Confirm password does not match password',
        path: ['confirmPassword'],
      });
    }
  });

export const VerificationCodeSchema = z.object({
  id: z.string(),
  email: z.email(),
  code: z.string().length(6, 'OTP code must be exactly 6 digits'),
  type: z.enum([
    TypeVerifycationCode.REGISTER,
    TypeVerifycationCode.FORGOT_PASSWORD,
    TypeVerifycationCode.RESET_PASSWORD,
  ]),
  expiresAt: z
    .string()
    .datetime()
    .transform((v) => new Date(v)),
  createdAt: z
    .string()
    .datetime()
    .transform((v) => new Date(v)),
});

export const SendOTPBodySchema = VerificationCodeSchema.pick({
  email: true,
  type: true,
}).strict();

// === Register Response Schema ===
export const RegisterResSchema = UserSchema.omit({
  password: true,
  totpSecret: true,
});

export const LoginResSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});

export const LoginBodySchema = UserSchema.pick({
  email: true,
  password: true,
}).strict();

export const RoleSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z
    .string()
    .datetime()
    .transform((val) => new Date(val)),
  updatedAt: z
    .string()
    .datetime()
    .transform((val) => new Date(val)),
});

export const DeviceSchema = z.object({
  id: z.string(),
  userId: z.string(),
  userAgent: z.string(),
  deviceId: z.string(),
  ip: z.string(),
  lastActive: z
    .string()
    .datetime()
    .transform((val) => new Date(val)),
  createdAt: z
    .string()
    .datetime()
    .transform((val) => new Date(val)),
  isActive: z.boolean(),
});

export const RefreshTokenResSchema = LoginResSchema;

export const RefreshTokenBodySchema = z
  .object({
    refreshToken: z.string(),
  })
  .strict();

export const RefreshTokenSchema = z.object({
  token: z.string(),
  userId: z.string(),
  deviceId: z.string(),
  expiresAt: z
    .string()
    .datetime()
    .transform((val) => new Date(val)),
  createdAt: z
    .string()
    .datetime()
    .transform((val) => new Date(val)),
});

export const ForgotPasswordSchema = z
  .object({
    email: z.email(),
    newPassword: z
      .string()
      .min(6, 'Password must be at least 6 characters long')
      .max(100, 'Password must be at most 100 characters long'),
    confirmNewPassword: z
      .string()
      .min(6, 'Confirm password must be at least 6 characters long')
      .max(100, 'Confirm password must be at most 100 characters long'),
    code: z.string().length(6, 'OTP code must be exactly 6 digits'),
  })
  .strict()
  .superRefine(({ confirmNewPassword, newPassword }, ctx) => {
    if (confirmNewPassword !== newPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'confirmNewPassword does not match newPassword',
        path: ['confirmNewPassword'],
      });
    }
  });

export const ResetPasswordSchema = ForgotPasswordSchema;

export const LogoutBodySchema = RefreshTokenBodySchema;

export const ProfileResSchema = UserSchema.pick({
  id: true,
  email: true,
  fullname: true,
  username: true,
  phoneNumber: true,
  avatar: true,
  dateOfBirth: true,
  status: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  phoneNumber: z.string().refine((val) => val === 'N/A' || val.length >= 10, {
    message: 'Phone number must be at least 10 characters or "N/A"',
  }),
  role: RoleSchema.pick({
    id: true,
    name: true,
  }),
});

export const UpdateUserProfileSchema = z
  .object({
    fullname: z
      .string()
      .min(1, { message: ERROR_MESSAGE.VALIDATION.FULLNAME_REQUIRED })
      .max(100, { message: ERROR_MESSAGE.VALIDATION.FULLNAME_MAX })
      .optional(),

    username: z
      .string()
      .min(3, { message: ERROR_MESSAGE.VALIDATION.USERNAME_MIN })
      .max(30, { message: ERROR_MESSAGE.VALIDATION.USERNAME_MAX })
      .regex(/^[a-zA-Z0-9_]+$/, {
        message: ERROR_MESSAGE.VALIDATION.USERNAME_INVALID,
      })
      .optional(),

    phoneNumber: z
      .string()
      .regex(/^[0-9+]+$/, { message: ERROR_MESSAGE.VALIDATION.PHONE_INVALID })
      .min(9, { message: ERROR_MESSAGE.VALIDATION.PHONE_MIN })
      .max(15, { message: ERROR_MESSAGE.VALIDATION.PHONE_MAX })
      .optional(),

    avatar: z
      .string()
      .url({ message: ERROR_MESSAGE.VALIDATION.AVATAR_INVALID_URL })
      .optional(),

    dateOfBirth: z
      .string()
      .datetime()
      .transform((v) => new Date(v))
      .optional(),
  })
  .strict();

export const GetUsersResSchema = z.object({
  data: z.array(UserSchema),
  totalItems: z.number(),
});

export const UserIdParamSchema = z.object({
  userId: z.string(),
});

export const LockUserBodySchema = z
  .object({
    durationMinutes: z.coerce.number().int().positive().max(525600).optional(),
    until: z
      .string()
      .datetime()
      .transform((v) => new Date(v))
      .optional(),
    reason: z.string().max(500).optional(),
  })
  .refine((v) => !!v.durationMinutes || !!v.until, {
    message: 'Either durationMinutes or until is required',
    path: ['durationMinutes'],
  });

export const UserLockResSchema = z.object({
  id: z.string(),
  email: z.email().nullable().optional(),
  lockExpirationDate: z
    .string()
    .datetime()
    .nullable()
    .transform((v) => (v ? new Date(v) : null)),
  reason: z.string().nullable().optional(),
});

export const UpdateAvatarResSchema = z.object({
  message: z.string(),
  avatar: z.string().url().nullable(),
});

export const CreateUserViolationBodySchema = z
  .object({
    reason: z.string().min(3).max(1000),
    violationType: z.nativeEnum(ViolationType),
    actionTaken: z.nativeEnum(ActionTaken),
    lockDurationDays: z.coerce.number().int().positive().max(365).optional(),
  })
  .refine(
    (v) =>
      v.actionTaken !== ActionTaken.LOCK ||
      typeof v.lockDurationDays === 'number',
    {
      message: 'lockDurationDays is required when actionTaken is LOCK',
      path: ['lockDurationDays'],
    },
  );

const RoleOfInfoAdminSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const InfoAdminSchema = z.object({
  id: z.string(),
  fullname: z.string(),
  email: z.email(),
  role: RoleOfInfoAdminSchema.nullable().optional(),
});

export const CreateUserViolationResSchema = z
  .object({
    id: z.string(),
    reason: z.string(),
    violationType: z.nativeEnum(ViolationType),
    actionTaken: z.nativeEnum(ActionTaken),
    lockDurationDays: z.number().int().positive().optional().nullable(),
    createdAt: z
      .string()
      .datetime()
      .transform((val) => new Date(val)),
    lockExpirationDate: z
      .string()
      .datetime()
      .nullable()
      .transform((v) => (v ? new Date(v) : null)),
    createdBy: InfoAdminSchema.nullable().optional(),
  })
  .strict();

export type SendOTPBodyType = z.infer<typeof SendOTPBodySchema>;
export type VerificationCodeType = z.infer<typeof VerificationCodeSchema>;
export type RegisterBodyType = z.infer<typeof RegisterBodySchema>;
export type LoginBodyType = z.infer<typeof LoginBodySchema>;
export type RoleType = z.infer<typeof RoleSchema>;
export type RefreshTokenBodyType = z.infer<typeof RefreshTokenBodySchema>;
export type RefreshTokenType = z.infer<typeof RefreshTokenSchema>;
export type ForgotPasswordType = z.infer<typeof ForgotPasswordSchema>;
export type ResetPasswordType = ForgotPasswordType;
export type ProfileResType = z.infer<typeof ProfileResSchema>;
export type UpdateUserProfileType = z.infer<typeof UpdateUserProfileSchema>;
export type GetUsersResType = z.infer<typeof GetUsersResSchema>;
export type LockUserBodyType = z.infer<typeof LockUserBodySchema>;
export type UserLockResType = z.infer<typeof UserLockResSchema>;
export type UpdateAvatarResType = z.infer<typeof UpdateAvatarResSchema>;
export type CreateUserViolationBodyType = z.infer<
  typeof CreateUserViolationBodySchema
>;
export type CreateUserViolationResType = z.infer<
  typeof CreateUserViolationResSchema
>;
