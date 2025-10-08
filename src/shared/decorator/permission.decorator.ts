import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { PermissionGuard } from '../guard/permission.guard';

export const PERMISSIONS_KEY = 'permissions';
export const PERMISSION_MODE_KEY = 'permission_mode';
export type PermissionMode = 'ALL' | 'ANY';

export function Permissions(...perms: string[]) {
  return SetMetadata(PERMISSIONS_KEY, perms);
}

export const Perm = (...perms: string[]) => Permissions(...perms);

export function AnyPerm(...perms: string[]) {
  return applyDecorators(
    SetMetadata(PERMISSIONS_KEY, perms),
    SetMetadata(PERMISSION_MODE_KEY, 'ANY'),
  );
}

// RequirePerm('product:create') hoặc RequirePerm(['product:update','product:delete'],'ANY')
export function RequirePerm(perms: string[] | string, mode: PermissionMode = 'ALL') {
  const list = Array.isArray(perms) ? perms : [perms];
  return applyDecorators(
    SetMetadata(PERMISSIONS_KEY, list),
    SetMetadata(PERMISSION_MODE_KEY, mode),
    UseGuards(PermissionGuard),
  );
}

// Helper namespace: P('product')('create','update') -> 'product:create','product:update'
export const P = (ns: string) => (...actions: string[]) =>
  Permissions(...actions.map((a) => `${ns}:${a}`));
