import { HttpException, Inject, Injectable } from '@nestjs/common';
import {
  CreateProductBodyType,
  GetAllProductsResType,
  GetProductQueryType,
  GetProductsResType,
  ProductType,
  UpdateProductBodyType,
} from './product.model';
import {
  AtLeastOneProductFieldMustBeProvidedException,
  InternalCreateProductErrorException,
  InternalDeleteProductErrorException,
  InternalRetrieveProductErrorException,
  InternalUpdateProductErrorException,
  ProductAlreadyExistsException,
  ProductNotFoundException,
} from './product.error';
import { ProductRepository } from './product.repo';

export interface UploaderService {
  upload(file: Express.Multer.File): Promise<string>;
  uploadMany(files: Express.Multer.File[]): Promise<string[]>;
}

@Injectable()
export class ProductService {
  constructor(
    private readonly productRepository: ProductRepository,
    @Inject('UploaderService') private readonly uploader: UploaderService,
  ) {}

  private mapToResponseType(product: any): ProductType {
    const { deletedAt, ...data } = product;
    return data as ProductType;
  }

  async create({
    data,
    createdById,
  }: {
    data: CreateProductBodyType;
    createdById: string;
  }): Promise<ProductType> {
    try {
      const slug = data.name
        .toLowerCase()
        .trim()
        .replace(/[\s_]+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-');
      const existed = await this.productRepository.findByNameOrSlug(
        data.name,
        slug,
        undefined,
      );
      if (existed) throw ProductAlreadyExistsException;

      const created = await this.productRepository.create({
        data,
        createdById,
      });
      return this.mapToResponseType(created);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw InternalCreateProductErrorException;
    }
  }

  async update({
    id,
    data,
    updatedById,
  }: {
    id: string;
    data: UpdateProductBodyType;
    updatedById: string;
  }): Promise<ProductType> {
    try {
      if (Object.keys(data).length === 0)
        throw AtLeastOneProductFieldMustBeProvidedException;

      const existing = await this.productRepository.findById(id);
      if (!existing) throw ProductNotFoundException;

      if (data.name) {
        const slug = data.name
          .toLowerCase()
          .trim()
          .replace(/[\s_]+/g, '-')
          .replace(/[^a-z0-9-]/g, '')
          .replace(/-+/g, '-');
        const dupe = await this.productRepository.findByNameOrSlug(
          data.name,
          slug,
          id,
        );
        if (dupe) throw ProductAlreadyExistsException;
      }

      const updated = await this.productRepository.update({
        id,
        data,
        updatedById,
      });
      return this.mapToResponseType(updated);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw InternalUpdateProductErrorException;
    }
  }

  async delete({ id }: { id: string }): Promise<{ message: string }> {
    try {
      const existing = await this.productRepository.findById(id);
      if (!existing) throw ProductNotFoundException;
      await this.productRepository.softDelete(id);
      return {
        message: `Product ${existing.name} has been successfully deleted.`,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw InternalDeleteProductErrorException;
    }
  }

  async findOne(id: string): Promise<ProductType> {
    try {
      const row = await this.productRepository.findById(id);
      if (!row) throw ProductNotFoundException;
      return this.mapToResponseType(row);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw InternalRetrieveProductErrorException;
    }
  }

  async findAll(query: GetProductQueryType): Promise<GetProductsResType> {
    try {
      const res = await this.productRepository.findAll(query);
      return {
        data: res.data.map((d) => this.mapToResponseType(d)),
        pagination: res.pagination,
      };
    } catch {
      throw InternalRetrieveProductErrorException;
    }
  }

  async getAll(): Promise<GetAllProductsResType> {
    try {
      const rows = await this.productRepository.getAll();
      return {
        data: rows.map((d) => this.mapToResponseType(d)),
        totalItems: rows.length,
      };
    } catch (e) {
      if (e instanceof HttpException) throw e;
      throw InternalRetrieveProductErrorException;
    }
  }

  async uploadImages({
    productId,
    files,
    createdById,
  }: {
    productId: string;
    files: Express.Multer.File[];
    createdById: string;
  }) {
    try {
      const existing = await this.productRepository.findById(productId);
      if (!existing) throw ProductNotFoundException;

      const urls = await this.uploader.uploadMany(files);
      const rows = await this.productRepository.addImages({
        productId,
        urls,
        createdById,
      });
      return { data: rows, totalItems: rows.length };
    } catch (e) {
      if (e instanceof HttpException) throw e;
      throw InternalUpdateProductErrorException;
    }
  }

  async listImages(productId: string) {
    try {
      const existing = await this.productRepository.findById(productId);
      if (!existing) throw ProductNotFoundException;
      return { data: await this.productRepository.listImages(productId) };
    } catch (e) {
      if (e instanceof HttpException) throw e;
      throw InternalRetrieveProductErrorException;
    }
  }

  async setPrimaryImage({
    productId,
    imageId,
    updatedById,
  }: {
    productId: string;
    imageId: string;
    updatedById: string;
  }) {
    try {
      const existing = await this.productRepository.findById(productId);
      if (!existing) throw ProductNotFoundException;
      await this.productRepository.setPrimaryImage({
        productId,
        imageId,
        updatedById,
      });
      return { message: 'Primary image set successfully.' };
    } catch (e) {
      if (e instanceof HttpException) throw e;
      throw InternalUpdateProductErrorException;
    }
  }

  async deleteImage({
    productId,
    imageId,
  }: {
    productId: string;
    imageId: string;
  }) {
    try {
      const existing = await this.productRepository.findById(productId);
      if (!existing) throw ProductNotFoundException;
      await this.productRepository.deleteImage({ productId, imageId });
      return { message: 'Image deleted successfully.' };
    } catch (e) {
      if (e instanceof HttpException) throw e;
      throw InternalDeleteProductErrorException;
    }
  }
}
