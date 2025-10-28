import z from 'zod';

export const CategorySchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  image: z.string().optional().nullable(),

  createdById: z.string().nullable().optional(),
  updatedById: z.string().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable().optional(),
});

export const CategoryResponseSchema = CategorySchema.omit({ deletedAt: true });

export const CreateCategoryBodySchema = z
  .object({
    name: z.string().min(1),
    description: z.string().optional(),
    image: z.string().url().optional(), // cho phép trống
  })
  .strict();

export const UpdateCategoryBodySchema =
  CreateCategoryBodySchema.partial().strict();

export const GetCategoryQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().min(2).optional(),
  includeDeleted: z.coerce.boolean().default(false),
});

export const GetCategoriesResSchema = z.object({
  data: z.array(CategoryResponseSchema),
  pagination: z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    total: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
  }),
});

export const GetAllCategoriesResSchema = z.object({
  data: z.array(
    CategorySchema.omit({
      deletedAt: true,
    }),
  ),
  totalItems: z.number(),
});

export const CreateCategoryResSchema = CategoryResponseSchema;
export const UpdateCategoryResSchema = CategoryResponseSchema;
export const GetCategoryDetailSchema = CategoryResponseSchema;

export type CategoryType = z.infer<typeof CategoryResponseSchema>;
export type CreateCategoryBodyType = z.infer<typeof CreateCategoryBodySchema>;
export type UpdateCategoryBodyType = z.infer<typeof UpdateCategoryBodySchema>;
export type GetCategoryQueryType = z.infer<typeof GetCategoryQuerySchema>;
export type GetCategoriesResType = z.infer<typeof GetCategoriesResSchema>;
export type GetAllCategoriesResType = z.infer<typeof GetAllCategoriesResSchema>;
