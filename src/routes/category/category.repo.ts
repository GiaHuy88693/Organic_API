import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/services/prisma.service';
import {
  CategoryType,
  CreateCategoryBodyType,
  GetCategoryQueryType,
  UpdateCategoryBodyType,
} from './category.model';

@Injectable()
export class CategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create({
    data,
    createdById,
  }: {
    data: CreateCategoryBodyType;
    createdById: string | null;
  }): Promise<CategoryType> {
    return await this.prisma.category.create({
      data: {
        ...data,
        createdById,
        deletedAt: null,
      },
    });
  }

  async findByName(
    name: string,
    excludeId?: string,
  ): Promise<CategoryType | null> {
    const where: any = { name, deletedAt: null };
    if (excludeId) where.id = { not: excludeId };
    return await this.prisma.category.findFirst({ where });
  }

  async findById(
    id: string,
    includeDeleted = false,
  ): Promise<CategoryType | null> {
    const where: any = { id };
    if (!includeDeleted) where.deletedAt = null;
    return await this.prisma.category.findFirst({ where });
  }

  async update({
    id,
    data,
    updatedById,
  }: {
    id: string;
    data: UpdateCategoryBodyType;
    updatedById: string | null;
  }): Promise<CategoryType> {
    return await this.prisma.category.update({
      where: { id },
      data: {
        ...data,
        updatedById,
      },
    });
  }

  async softDelete(id: string): Promise<CategoryType> {
    return await this.prisma.category.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async findAll(query: GetCategoryQueryType): Promise<{
    data: CategoryType[];
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
      this.prisma.category.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ createdAt: 'desc' }, { name: 'asc' }],
      }),
      this.prisma.category.count({ where }),
    ]);

    return {
      data: rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getAll(): Promise<CategoryType[]> {
    const rows = await this.prisma.category.findMany({
      where: { deletedAt: null },
    });
    return rows;
  }
}
