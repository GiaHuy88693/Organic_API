// src/routes/wishlist/wishlist.repo.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/services/prisma.service';
import { GetWishlistQueryType } from './withlist.model';

@Injectable()
export class WishlistRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findItem(userId: string, productId: string) {
    return this.prisma.wishlist.findFirst({
      where: { userId, productId },
    });
  }

  async create(userId: string, productId: string) {
    return this.prisma.wishlist.create({
      data: { userId, productId },
    });
  }

  async deleteBy(userId: string, productId: string) {
    await this.prisma.wishlist.deleteMany({ where: { userId, productId } });
  }

  async listOfUser(userId: string, query: GetWishlistQueryType) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const [rows, total] = await Promise.all([
      this.prisma.wishlist.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          product: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      this.prisma.wishlist.count({ where: { userId } }),
    ]);

    return {
      data: rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async productExists(productId: string) {
    const p = await this.prisma.product.findFirst({ where: { id: productId } });
    return !!p;
  }
}
