import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleService } from 'src/routes/role/role.service';
import { REQUEST_USER_KEY, AuthTypes } from 'src/shared/constants/auth.constant';
import { AUTH_TYPE_KEY, AuthTypeDecoratorPayload } from 'src/shared/decorator/auth.decorator';
import { ROLE_HIERARCHY } from 'src/shared/constants/role-hierarchy.constant';
import { PERMISSION_MODE_KEY, PermissionMode, PERMISSIONS_KEY } from 'src/shared/decorator/permission.decorator';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly roleService: RoleService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const handler = context.getHandler();
    const clazz = context.getClass();

    // Public?
    const authMeta = this.reflector.getAllAndOverride<AuthTypeDecoratorPayload>(AUTH_TYPE_KEY, [handler, clazz]);
    if (authMeta?.authTypes?.includes(AuthTypes.NONE)) return true;

    // Lấy metadata
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [handler, clazz]) ?? [];
    const mode = this.reflector.getAllAndOverride<PermissionMode>(PERMISSION_MODE_KEY, [handler, clazz]) ?? 'ALL';

    const req = context.switchToHttp().getRequest();
    const user = req[REQUEST_USER_KEY];
    if (!user) throw new ForbiddenException('You do not have permission');

    // Lấy role từ user (JWT có thể chứa roleName hoặc mảng roles)
    const rawRoles = Array.isArray(user.roles) ? user.roles : [user.roleName ?? user.role].filter(Boolean);
    const userRoles: string[] = rawRoles
      .map((r: any) => (typeof r === 'string' ? r : (r?.name ?? r?.roleName ?? r?.code)))
      .filter((v: any): v is string => typeof v === 'string' && v.trim().length > 0)
      .map((r) => r.trim());
    if (userRoles.length === 0) throw new ForbiddenException('You do not have permission');

    // Role kế thừa
    const expanded = new Set(userRoles);
    for (const r of userRoles) (ROLE_HIERARCHY[r] ?? []).forEach((x) => expanded.add(x));
    const finalRoles = [...expanded]; // (giữ nếu sau này cần debug/log)

    // Lấy quyền từ DB theo role
    const permsByRoleArrays = await Promise.all(finalRoles.map((role) => this.roleService.getPermissionsByRole(role)));

    // Chuẩn hoá string: "GET /api/v1/product/:id"
    const normalize = (s: string) =>
      (typeof s === 'string' ? s : '')
        .replace(/\/+/g, '/')
        .replace(/\/$/, '')
        .replace(/:([A-Za-z0-9_]+)/g, (_m, p1) => `:${String(p1).toLowerCase()}`)
        .toLowerCase()
        .trim();

    const effective = new Set<string>(
      permsByRoleArrays.flat().map(normalize).filter((s) => s.length > 0),
    );

    // Wildcard: có '*' là full quyền (Admin)
    if (effective.has('*')) return true;

    // A) Có metadata → check theo code (ví dụ 'product:create')
    if (requiredPermissions.length > 0) {
      const required = requiredPermissions.map(normalize);
      const passed = mode === 'ALL' ? required.every((p) => effective.has(p)) : required.some((p) => effective.has(p));
      if (!passed) throw new ForbiddenException('You do not have permission');
      return true;
    }

    // B) Không có metadata → check theo RouteKey "METHOD /path"
    const method = String(req.method || 'GET').toUpperCase();
    const base = String(req.baseUrl || ''); 
    const routePath = String(req.route?.path || ''); 
    const pattern = (base + routePath).replace(/\/+/g, '/');
    const routeKey = normalize(`${method} ${pattern}`);

    if (effective.has(routeKey)) return true;

    throw new ForbiddenException('You do not have permission');
  }
}
