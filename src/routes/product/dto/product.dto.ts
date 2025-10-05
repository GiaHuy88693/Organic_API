import { createZodDto } from 'nestjs-zod';
import {
  CreateProductBodySchema,
  CreateProductResSchema,
  GetAllProductsResSchema,
  GetProductDetailSchema,
  GetProductQuerySchema,
  GetProductsResSchema,
  UpdateProductBodySchema,
  UpdateProductResSchema,
} from '../product.model';
export class CreateProductBodyDTO extends createZodDto(
  CreateProductBodySchema,
) {}
export class CreateProductResDTO extends createZodDto(CreateProductResSchema) {}
export class UpdateProductBodyDTO extends createZodDto(
  UpdateProductBodySchema,
) {}
export class UpdateProductResDTO extends createZodDto(UpdateProductResSchema) {}

export class GetProductQueryDTO extends createZodDto(GetProductQuerySchema) {}
export class GetProductsResDTO extends createZodDto(GetProductsResSchema) {}
export class GetAllProductsResDTO extends createZodDto(
  GetAllProductsResSchema,
) {}
export class GetProductDetailResDTO extends createZodDto(
  GetProductDetailSchema,
) {}
