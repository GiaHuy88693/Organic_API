import { createZodDto } from 'nestjs-zod';
import {
  CreateCategoryBodySchema,
  CreateCategoryResSchema,
  GetAllCategoriesResSchema,
  GetCategoriesResSchema,
  GetCategoryDetailSchema,
  GetCategoryQuerySchema,
  UpdateCategoryBodySchema,
  UpdateCategoryResSchema,
} from '../category.model';

export class CreateCategoryBodyDTO extends createZodDto(
  CreateCategoryBodySchema,
) {}
export class CreateCategoryResDTO extends createZodDto(
  CreateCategoryResSchema,
) {}

export class UpdateCategoryBodyDTO extends createZodDto(
  UpdateCategoryBodySchema,
) {}
export class UpdateCategoryResDTO extends createZodDto(
  UpdateCategoryResSchema,
) {}

export class GetCategoryQueryDTO extends createZodDto(GetCategoryQuerySchema) {}
export class GetCategoriesResDTO extends createZodDto(GetCategoriesResSchema) {}
export class GetAllCategoriesResDTO extends createZodDto(
  GetAllCategoriesResSchema,
) {}
export class GetCategoryDetailResDTO extends createZodDto(
  GetCategoryDetailSchema,
) {}
