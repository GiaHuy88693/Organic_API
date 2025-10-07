import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/services/prisma.service';
import { GetOrdersQueryType } from './order.model';

@Injectable()
export class OrderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async checkoutFromCart(userId: string) {
    // Get shopping cart
    const cartItems = await this.prisma.cart.findMany({
      where: { userId },
      include: { product: { select: { id: true, price: true, name: true } } },
    });
    if (cartItems.length === 0) return null;

    // tolal
    const detailsData = cartItems.map((ci) => ({
      productId: ci.productId,
      quantity: ci.quantity,
      price: ci.product.price, // Price snapshot at time of order
    }));
    const totalAmount = detailsData.reduce(
      (s, d) => s + d.quantity * d.price,
      0,
    );

    const result = await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          userId,
          totalAmount,
          deletedAt: null,
        },
      });

      await tx.orderDetail.createMany({
        data: detailsData.map((d) => ({ ...d, orderId: order.id })),
      });

      await tx.cart.deleteMany({ where: { userId } });

      return order;
    });

    return { orderId: result.id, totalAmount };
  }

  async listOfUser(userId: string, { page, limit }: GetOrdersQueryType) {
    const skip = (page - 1) * limit;
    const [rows, total] = await Promise.all([
      this.prisma.order.findMany({
        where: { userId, deletedAt: null },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: { id: true, userId: true, totalAmount: true, createdAt: true },
      }),
      this.prisma.order.count({ where: { userId, deletedAt: null } }),
    ]);
    return {
      data: rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findDetail(orderId: string, userId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, userId, deletedAt: null },
      select: { id: true, userId: true, totalAmount: true, createdAt: true },
    });
    if (!order) return null;

    const items = await this.prisma.orderDetail.findMany({
      where: { orderId },
      include: { product: { select: { id: true, name: true, price: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return { ...order, items };
  }

  async softDelete(orderId: string) {
    await this.prisma.order.update({
      where: { id: orderId },
      data: { deletedAt: new Date() },
    });
  }
}
