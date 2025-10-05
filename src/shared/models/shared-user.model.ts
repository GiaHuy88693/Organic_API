import { z } from 'zod';
import { UserStatus } from '../constants/auth.constant';
import { RoleName } from '../constants/role.constant';

export const UserSchema = z.object({
  id: z.string(),

  email: z.string().email(),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters long' })
    .max(100, { message: 'Password must be at most 100 characters long' }),

  fullname: z
    .string()
    .min(1, { message: 'Full name is required' })
    .max(100, { message: 'Full name must be at most 100 characters long' }),
  username: z.string().nullable(),

  phoneNumber: z
    .string()
    .min(6, { message: 'Phone number must be at least 6 characters long' })
    .max(20, { message: 'Phone number must be at most 20 characters long' }),
  avatar: z.string().nullable(),
  dateOfBirth: z
    .string()
    .datetime({ message: 'user.validation.dateOfBirth.invalid' })
    .transform((val) => new Date(val))
    .nullable()
    .optional(),

  roleId: z.string().regex(/^[0-9a-fA-F]{24}$/),
  role: z.any().optional(),
  totpSecret: z.string().nullable(),

  status: z.enum([
    UserStatus.ACTIVE,
    UserStatus.INACTIVE,
    UserStatus.BLOCKED,
    UserStatus.SUSPENDED,
  ]),

  isEmailVerified: z.boolean().default(false),
  isPhoneVerified: z.boolean().default(false),

  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable().optional(),
});

export type UserType = z.infer<typeof UserSchema>;
