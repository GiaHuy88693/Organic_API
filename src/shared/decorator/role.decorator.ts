import { applyDecorators, UseGuards } from '@nestjs/common'
import { SetMetadata } from '@nestjs/common'
import { RoleName } from '../constants/role.constant'
import { RoleGuard } from '../guard/role.guard'

export const ROLES_KEY = 'roles'
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles)
// Decorator to restrict access to Admin role
export function RequireAdminRole() {
  return applyDecorators(SetMetadata(ROLES_KEY, [RoleName.Admin]), UseGuards(RoleGuard))
}
// Decorator to restrict access to Client role
export function RequireClientRole() {
  return applyDecorators(SetMetadata(ROLES_KEY, [RoleName.Client, RoleName.Admin]), UseGuards(RoleGuard))
}

