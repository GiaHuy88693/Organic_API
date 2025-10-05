import z from 'zod';
import { RoleSchema } from '../auth/auth.model';
import { PermissionSchema } from 'src/shared/models/shared-permission.model';

// === Role Response Schema ===
export const RoleResponseSchema = RoleSchema.omit({
  deletedAt: true,
});

// === Create Role Schema ===
export const CreateRoleBodySchema = RoleSchema.pick({
  name: true,
  slug: true,
  description: true,
}).strict();

// === Role with Relations Schema ===
export const RoleWithRelationsSchema = RoleSchema.extend({
  permissions: z.array(z.any()).optional(),
  users: z.array(z.any()).optional(),
  createdBy: z.any().nullable().optional(),
  updatedBy: z.any().nullable().optional(),
  deletedBy: z.any().nullable().optional(),
});

// === Permission Assignment Schema ===
export const AssignPermissionsToRoleSchema = z.object({
  permissionIds: z
    .array(z.string())
    .min(1, { message: 'At least one permission ID must be provided' })
    .max(50, { message: 'Cannot assign more than 50 permissions at once' }),
});

// === Role ID Parameter Schema ===
export const RoleIdParamSchema = z.object({
  roleId: z.string().min(1, 'Role ID is required'),
});

export const IdParamSchema = z.object({
  userId: z.string().min(1, 'Role ID is required'),
});

// === Role With Permissions Schema ===
export const RoleWithPermissionsSchema = RoleSchema.extend({
  permissions: z.array(PermissionSchema),
});

export const UserWithRolesResSchema = z.object({
  id: z.string(),
  email: z.string().email().optional().nullable(),
  role: RoleResponseSchema.pick({
    id: true,
    name: true,
    description: true,
  }).nullable(),
});

export type RoleResponseType = z.infer<typeof RoleResponseSchema>;

export type CreateRoleBodyType = z.infer<typeof CreateRoleBodySchema>;

export const CreateRoleResSchema = RoleResponseSchema;

export const AssignPermissionToRoleResSchema = RoleWithRelationsSchema;

export type RoleWithPermissionsType = z.infer<typeof RoleWithPermissionsSchema>;

export type RoleWithRelationsType = z.infer<typeof RoleWithRelationsSchema>;

export type AssignPermissionToRoleType = z.infer<
  typeof AssignPermissionsToRoleSchema
>;

export type AssignRolesToUserBodyType = z.infer<typeof RoleIdParamSchema>;

export type UserWithRolesResType = z.infer<typeof UserWithRolesResSchema>;
