import { HttpException, Injectable } from '@nestjs/common';
import {
  CategoryType,
  CreateCategoryBodyType,
  GetAllCategoriesResType,
  GetCategoriesResType,
  GetCategoryQueryType,
  UpdateCategoryBodyType,
} from './category.model';
import {
  AtLeastOneCategoryFieldMustBeProvidedException,
  CategoryAlreadyExistsException,
  CategoryNotFoundException,
  InternalCreateCategoryErrorException,
  InternalDeleteCategoryErrorException,
  InternalRetrieveCategoryErrorException,
  InternalUpdateCategoryErrorException,
} from './category.error';
import { CategoryRepository } from './category.repo';

@Injectable()
export class CategoryService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  private mapToResponseType(row: any): CategoryType {
    const { deletedAt, ...data } = row;
    return data as CategoryType;
  }

  async create({
    data,
    createdById,
  }: {
    data: CreateCategoryBodyType;
    createdById: string;
  }): Promise<CategoryType> {
    try {
      const existed = await this.categoryRepository.findByName(data.name);
      if (existed) throw CategoryAlreadyExistsException;

      const created = await this.categoryRepository.create({
        data,
        createdById,
      });
      return this.mapToResponseType(created);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw InternalCreateCategoryErrorException;
    }
  }

  async update({
    id,
    data,
    updatedById,
  }: {
    id: string;
    data: UpdateCategoryBodyType;
    updatedById: string;
  }): Promise<CategoryType> {
    try {
      if (Object.keys(data).length === 0)
        throw AtLeastOneCategoryFieldMustBeProvidedException;

      const existing = await this.categoryRepository.findById(id);
      if (!existing) throw CategoryNotFoundException;

      if (data.name) {
        const dupe = await this.categoryRepository.findByName(data.name, id);
        if (dupe) throw CategoryAlreadyExistsException;
      }

      const updated = await this.categoryRepository.update({
        id,
        data,
        updatedById,
      });
      return this.mapToResponseType(updated);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw InternalUpdateCategoryErrorException;
    }
  }

  async delete({ id }: { id: string }): Promise<{ message: string }> {
    try {
      const existing = await this.categoryRepository.findById(id);
      if (!existing) throw CategoryNotFoundException;

      await this.categoryRepository.softDelete(id);
      return {
        message: `Category ${existing.name} has been successfully deleted.`,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw InternalDeleteCategoryErrorException;
    }
  }

  async findOne(id: string): Promise<CategoryType> {
    try {
      const row = await this.categoryRepository.findById(id);
      if (!row) throw CategoryNotFoundException;
      return this.mapToResponseType(row);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw InternalRetrieveCategoryErrorException;
    }
  }

  async findAll(query: GetCategoryQueryType): Promise<GetCategoriesResType> {
    try {
      const res = await this.categoryRepository.findAll(query);
      return {
        data: res.data.map((d) => this.mapToResponseType(d)),
        pagination: res.pagination,
      };
    } catch {
      throw InternalRetrieveCategoryErrorException;
    }
  }

  async getAll(): Promise<GetAllCategoriesResType> {
    try {
      const rows = await this.categoryRepository.getAll();
      return {
        data: rows.map((d) => this.mapToResponseType(d)),
        totalItems: rows.length,
      };
    } catch (e) {
      if (e instanceof HttpException) throw e;
      throw InternalRetrieveCategoryErrorException;
    }
  }
}
