import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/services/prisma.service';
import {
  CreateProductBodyType,
  GetProductQueryType,
  ProductType,
  UpdateProductBodyType,
} from './product.model';

@Injectable()
export class ProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create({
    data,
    createdById,
  }: {
    data: CreateProductBodyType;
    createdById: string | null;
  }): Promise<ProductType> {
    const slug = data.name
      .toLowerCase()
      .trim()
      .replace(/[\s_]+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-');

    return await this.prisma.product.create({
      data: {
        ...data,
        slug,
        quantity: data.quantity ?? 0,
        createdById,
        deletedAt: null,
      },
    });
  }

  async findByNameOrSlug(
    name: string,
    slug: string,
    excludeId?: string,
  ): Promise<ProductType | null> {
    const where: any = {
      OR: [{ name }, { slug }],
      deletedAt: null,
    };
    if (excludeId) {
      where.id = { not: excludeId };
    }
    return await this.prisma.product.findFirst({ where });
  }

  async findById(
    id: string,
    includeDeleted = false,
  ): Promise<ProductType | null> {
    const where: any = { id };
    if (!includeDeleted) where.deletedAt = null;
    return await this.prisma.product.findFirst({ where });
  }

  async update({
    id,
    data,
    updatedById,
  }: {
    id: string;
    data: UpdateProductBodyType;
    updatedById: string | null;
  }): Promise<ProductType> {
    return await this.prisma.product.update({
      where: { id },
      data: {
        ...data,
        updatedById,
      },
    });
  }

  async softDelete(id: string): Promise<ProductType> {
    return await this.prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async findAll(query: GetProductQueryType): Promise<{
    data: ProductType[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const { page, limit, search, includeDeleted } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (!includeDeleted) where.deletedAt = null;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [rows, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ createdAt: 'desc' }, { name: 'asc' }],
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getAll(): Promise<ProductType[]> {
    const rows = await this.prisma.product.findMany({
      where: { deletedAt: null },
    });
    return rows;
  }

  async addImages({
    productId,
    urls,
    createdById,
  }: {
    productId: string;
    urls: string[];
    createdById: string | null;
  }) {
    await this.prisma.productImage.createMany({
      data: urls.map((url) => ({
        url,
        productId,
        createdById,
      })),
    });

    return await this.prisma.productImage.findMany({
      where: { productId },
      orderBy: [{ isPrimary: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async listImages(productId: string) {
    return await this.prisma.productImage.findMany({
      where: { productId },
      orderBy: [{ isPrimary: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async setPrimaryImage({
    productId,
    imageId,
    updatedById,
  }: {
    productId: string;
    imageId: string;
    updatedById: string | null;
  }) {
    await this.prisma.$transaction([
      this.prisma.productImage.updateMany({
        where: { productId },
        data: { isPrimary: false },
      }),
      this.prisma.productImage.update({
        where: { id: imageId },
        data: { isPrimary: true },
      }),
      this.prisma.product.update({
        where: { id: productId },
        data: { updatedById },
      }),
    ]);
  }

  async deleteImage({
    productId,
    imageId,
  }: {
    productId: string;
    imageId: string;
  }) {
    const img = await this.prisma.productImage.findFirst({
      where: { id: imageId, productId },
    });
    if (!img) return;

    await this.prisma.productImage.delete({ where: { id: imageId } });

    if (img.isPrimary) {
      const newest = await this.prisma.productImage.findFirst({
        where: { productId },
        orderBy: [{ createdAt: 'desc' }],
      });
      if (newest) {
        await this.prisma.productImage.update({
          where: { id: newest.id },
          data: { isPrimary: true },
        });
      }
    }
  }
}
