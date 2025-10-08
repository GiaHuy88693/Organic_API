import 'tsconfig-paths/register';
import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app.module';
import {
  DiscoveryService,
  MetadataScanner,
  DiscoveryModule,
} from '@nestjs/core';
import { PrismaService } from 'src/shared/services/prisma.service';
import { Module } from '@nestjs/common';
import { RoleName } from 'src/shared/constants/role.constant';

enum HTTPMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
  OPTIONS = 'OPTIONS',
  HEAD = 'HEAD',
}

@Module({
  imports: [AppModule, DiscoveryModule],
  providers: [PrismaService],
})
class ScriptModule {}

const API_PREFIX = process.env.APP_API_PREFIX || '/api/v1';
const normalizePath = (p: string) => p.replace(/\/+/g, '/').replace(/\/$/, '');

// --------- đặt tên hiển thị (tuỳ chọn) ----------
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const TPL = new Map<HTTPMethod, (r: string, isDetail: boolean) => string>([
  [HTTPMethod.GET, (r, d) => (d ? `View ${r} Detail` : `View ${r} List`)],
  [HTTPMethod.POST, (r) => `Create ${r}`],
  [HTTPMethod.PUT, (r) => `Update ${r}`],
  [HTTPMethod.PATCH, (r) => `Update ${r}`],
  [HTTPMethod.DELETE, (r) => `Delete ${r}`],
]);

const displayName = (m: HTTPMethod, fullPath: string) => {
  const parts = fullPath.split('/').filter(Boolean);
  const isDetail = parts.some((p) => p.startsWith(':'));
  const resource = cap(parts.filter((p) => !p.startsWith(':')).pop() || '');
  const t = TPL.get(m) || ((r: string) => `${m} ${r}`);
  return t(resource, isDetail);
};

// --------- quyền dành cho CLIENT ----------
type Rule = { methods: HTTPMethod[]; pattern: RegExp };
const CLIENT_RULES: Rule[] = [
  // Product (GET only)
  { methods: [HTTPMethod.GET], pattern: /\/product(\/|$)/i },

  // Category (GET only)
  { methods: [HTTPMethod.GET], pattern: /\/category(\/|$)/i },

  // Cart
  { methods: [HTTPMethod.GET], pattern: /\/cart\/pagination$/i },
  { methods: [HTTPMethod.POST], pattern: /\/cart$/i },
  { methods: [HTTPMethod.PATCH], pattern: /\/cart\/:cartItemId$/i },
  { methods: [HTTPMethod.DELETE], pattern: /\/cart(\/:cartItemId)?$/i },

  // Wishlist
  { methods: [HTTPMethod.GET], pattern: /\/wishlist(\/|$)/i },
  { methods: [HTTPMethod.POST], pattern: /\/wishlist\/:productId\/toggle$/i },

  // Order
  { methods: [HTTPMethod.GET], pattern: /\/order\/pagination$/i },
  { methods: [HTTPMethod.GET], pattern: /\/order\/:orderId$/i },
  { methods: [HTTPMethod.POST], pattern: /\/order\/checkout-from-cart$/i },
  { methods: [HTTPMethod.DELETE], pattern: /\/order\/:orderId$/i },

  // Auth (self-service for client)
  { methods: [HTTPMethod.GET], pattern: /\/auth\/profile$/i },
  { methods: [HTTPMethod.PATCH], pattern: /\/auth\/profile$/i },
  { methods: [HTTPMethod.POST], pattern: /\/auth\/avatar$/i },
  { methods: [HTTPMethod.POST], pattern: /\/auth\/logout$/i },
];

const matchClient = (method: string, path: string) =>
  CLIENT_RULES.some(
    (r) => r.methods.includes(method as HTTPMethod) && r.pattern.test(path),
  );

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(ScriptModule, {
    logger: false,
  });
  const prisma = app.get(PrismaService);
  const discovery = app.get(DiscoveryService);
  const scanner = app.get(MetadataScanner);

  // 1) Quét routes
  const controllers = discovery.getControllers();
  const routes: {
    name: string;
    method: HTTPMethod;
    path: string;
    description: string;
  }[] = [];

  for (const w of controllers) {
    const { instance, metatype } = w;
    if (!instance || !metatype) continue;

    const basePath: string = Reflect.getMetadata('path', metatype) || '';
    scanner.scanFromPrototype(
      instance,
      Object.getPrototypeOf(instance),
      (methodName) => {
        const ref = instance[methodName];
        const routePath: string = Reflect.getMetadata('path', ref);
        const requestMethod: number = Reflect.getMetadata('method', ref);
        if (routePath && requestMethod !== undefined) {
          const methodStr = Object.values(HTTPMethod)[
            requestMethod
          ] as HTTPMethod;
          const rawPath = `${API_PREFIX}/${[basePath, routePath].filter(Boolean).join('/')}`;
          const path = normalizePath(rawPath);
          routes.push({
            // name duy nhất để tránh P2002
            name: `${methodStr} ${path}`,
            method: methodStr,
            path,
            // label hiển thị đẹp
            description: displayName(methodStr, path),
          });
        }
      },
    );
  }

  // 2) Đồng bộ bảng Permission (so theo name)
  const existing = await prisma.permission.findMany({
    where: { deletedAt: null },
  });
  const existingByName = new Map(existing.map((p) => [p.name, p]));

  // Nếu trong cùng lượt scan lỡ có trùng name, loại trùng
  const uniqueRoutes = Array.from(
    new Map(routes.map((r) => [r.name, r])).values(),
  );

  const toAdd = uniqueRoutes.filter((r) => !existingByName.has(r.name));

  const toUpdate = uniqueRoutes.filter((r) => {
    const row = existingByName.get(r.name);
    return (
      row &&
      (row.path !== r.path ||
        String(row.method) !== String(r.method) ||
        row.description !== r.description)
    );
  });

  const toDelete = existing.filter(
    (p) => !uniqueRoutes.some((r) => r.name === p.name),
  );

  await prisma.$transaction([
    ...(toDelete.length
      ? [
          prisma.permission.deleteMany({
            where: { id: { in: toDelete.map((p) => p.id) } },
          }),
        ]
      : []),
    ...(toUpdate.length
      ? toUpdate.map((r) =>
          prisma.permission.updateMany({
            where: { name: r.name },
            data: {
              path: r.path,
              method: r.method,
              description: r.description,
            },
          }),
        )
      : []),
    ...(toAdd.length
      ? [
          prisma.permission.createMany({
            data: toAdd.map((r) => ({
              name: r.name,
              description: r.description,
              path: r.path,
              method: r.method,
              deletedAt: null,
            })),
          }),
        ]
      : []),
  ]);

  // 3) Gán quyền cho role ĐÃ CÓ SẴN (không tạo mới)
  const admin = await prisma.role.findUnique({
    where: { name: RoleName.Admin },
  });
  const client = await prisma.role.findUnique({
    where: { name: RoleName.Client },
  });
  if (!admin || !client) {
    console.error(
      'Missing role(s): cần sẵn ADMIN và CLIENT trong DB. Dừng sync.',
    );
    await app.close();
    process.exit(1);
  }

  const allPerms = await prisma.permission.findMany({
    where: { deletedAt: null },
  });

  // ADMIN = full
  await prisma.rolePermission.deleteMany({ where: { roleId: admin.id } });
  const adminLinks = allPerms.map((p) => ({
    roleId: admin.id,
    permissionId: p.id,
  }));
  if (adminLinks.length) {
    await prisma.rolePermission.createMany({ data: adminLinks });
  }

  // CLIENT = theo rule
  const clientPerms = allPerms.filter((p) =>
    matchClient(String(p.method), p.path),
  );
  await prisma.rolePermission.deleteMany({ where: { roleId: client.id } });
  const clientLinks = clientPerms.map((p) => ({
    roleId: client.id,
    permissionId: p.id,
  }));
  if (clientLinks.length) {
    await prisma.rolePermission.createMany({ data: clientLinks });
  }
  console.log(
    `Synced permissions. Added ${toAdd.length}, updated ${toUpdate.length}, removed ${toDelete.length}.`,
  );
  console.log(
    `Assigned ${allPerms.length} to ADMIN, ${clientPerms.length} to CLIENT.`,
  );

  await app.close();
  process.exit(0);
}

bootstrap();
