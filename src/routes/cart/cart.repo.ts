import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/services/prisma.service';
import { GetCartQueryType } from './cart.model';

@Injectable()
export class CartRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findItem(userId: string, productId: string) {
    return this.prisma.cart.findFirst({ where: { userId, productId } });
  }

  async create(userId: string, productId: string, quantity: number) {
    return this.prisma.cart.create({ data: { userId, productId, quantity } });
  }

  async updateQuantity(id: string, quantity: number) {
    return this.prisma.cart.update({ where: { id }, data: { quantity } });
  }

  async deleteById(id: string) {
    await this.prisma.cart.delete({ where: { id } });
  }

  async clearByUser(userId: string) {
    await this.prisma.cart.deleteMany({ where: { userId } });
  }

  async listOfUser(userId: string, query: GetCartQueryType) {
    const { page, limit } = query;
    const skip = (page - 1) * limit;

    const [rows, total] = await Promise.all([
      this.prisma.cart.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          product: {
            select: { id: true, name: true, price: true },
          },
        },
      }),
      this.prisma.cart.count({ where: { userId } }),
    ]);

    return {
      data: rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async productExists(productId: string) {
    const p = await this.prisma.product.findFirst({
      where: { id: productId, deletedAt: null },
    });
    return !!p;
  }

  async findItemById(userId: string, cartItemId: string) {
    return this.prisma.cart.findFirst({
      where: { id: cartItemId, userId },
    });
  }
}
